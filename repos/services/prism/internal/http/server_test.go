package httpapi

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/blackroad/prism-console/services/prism/internal/service"
)

func newAPI(t *testing.T) (*API, *sql.DB) {
	t.Helper()
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	svc, err := service.New(db, service.WithClock(func() time.Time { return time.Unix(1, 0).UTC() }))
	if err != nil {
		t.Fatalf("new service: %v", err)
	}
	return NewAPI(svc), db
}

func TestHealthHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	req := httptest.NewRequest(http.MethodGet, "/api/health.json", nil)
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if body["status"] != "ok" {
		t.Fatalf("unexpected status: %v", body["status"])
	}
}

func TestEchoHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	payload := map[string]string{"foo": "bar"}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/echo", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	received := body["received"].(map[string]interface{})
	if received["foo"] != "bar" {
		t.Fatalf("unexpected echo payload: %v", received)
	}
}

func TestMiniInferHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	payload := map[string]float64{"x": 6, "y": 7}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/mini/infer", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string]float64
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if body["output"] != 42 {
		t.Fatalf("unexpected output: %v", body["output"])
	}
}

func TestMiniInferHandlerBadPayload(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	req := httptest.NewRequest(http.MethodPost, "/api/mini/infer", bytes.NewBufferString("not-json"))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func TestMiniInferHandlerInvalidNumbers(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	payload := map[string]float64{"x": math.Inf(1), "y": 1}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/mini/infer", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func TestHealthMethodNotAllowed(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	req := httptest.NewRequest(http.MethodPost, "/api/health.json", nil)
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status 405, got %d", rec.Code)
	}
}

func TestEchoMethodNotAllowed(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	req := httptest.NewRequest(http.MethodGet, "/api/echo", nil)
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status 405, got %d", rec.Code)
	}
}

func TestMiniInferMethodNotAllowed(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })
	req := httptest.NewRequest(http.MethodGet, "/api/mini/infer", nil)
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status 405, got %d", rec.Code)
	}
}

func TestHealthErrorPropagation(t *testing.T) {
	api, db := newAPI(t)
	_ = db.Close()
	req := httptest.NewRequest(http.MethodGet, "/api/health.json", nil)
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", rec.Code)
	}
}

func TestMiniInferHandlerInsertError(t *testing.T) {
	api, db := newAPI(t)
	if _, err := db.ExecContext(context.Background(), `DROP TABLE mini_infer_requests`); err != nil {
		t.Fatalf("drop table: %v", err)
	}
	_ = db.Close()
	payload := map[string]float64{"x": 1, "y": 2}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/mini/infer", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", rec.Code)
	}
}

func TestOID4VCICredentialHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })

	payload := map[string]interface{}{
		"credential_type": "EmployeeCredential",
		"subject_did":     "did:example:alice",
		"claims": map[string]interface{}{
			"given_name": "Alice",
		},
		"didcomm": map[string]interface{}{
			"endpoint": "https://wallet.example.com/didcomm",
		},
	}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/oid4vci/credential", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if body["format"].(string) != "vc+sd-jwt" {
		t.Fatalf("unexpected format: %v", body["format"])
	}
	didcomm := body["didcomm"].(map[string]interface{})
	if didcomm["endpoint"].(string) != "https://wallet.example.com/didcomm" {
		t.Fatalf("unexpected didcomm endpoint: %v", didcomm["endpoint"])
	}
}

func TestOID4VCICredentialHandlerValidation(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })

	payload := map[string]interface{}{
		"credential_type": "EmployeeCredential",
	}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/oid4vci/credential", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func TestOID4VCIBatchCredentialHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })

	payload := map[string]interface{}{
		"requests": []map[string]interface{}{
			{"credential_type": "EmployeeCredential", "subject_did": "did:example:1"},
			{"credential_type": "EmployeeCredential", "subject_did": "did:example:2"},
		},
	}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/oid4vci/batch_credential", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string][]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(body["credentials"]) != 2 {
		t.Fatalf("expected 2 credentials, got %d", len(body["credentials"]))
	}
}

func TestOIDC4VPAuthorizeAndCallbackHandlers(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })

	authorizePayload := map[string]interface{}{
		"client_id":    "client-1",
		"redirect_uri": "https://rp.example.com/callback",
	}
	buf, _ := json.Marshal(authorizePayload)
	req := httptest.NewRequest(http.MethodPost, "/api/oidc4vp/authorize", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("authorize expected status 200, got %d", rec.Code)
	}
	var authResp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &authResp); err != nil {
		t.Fatalf("unmarshal authorize: %v", err)
	}
	nonce := authResp["nonce"].(string)
	callbackPayload := map[string]interface{}{
		"nonce":       nonce,
		"subject_did": "did:example:alice",
		"vp_token":    map[string]interface{}{"proof": "ok"},
	}
	buf, _ = json.Marshal(callbackPayload)
	req = httptest.NewRequest(http.MethodPost, "/api/oidc4vp/callback", bytes.NewReader(buf))
	rec = httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("callback expected status 200, got %d", rec.Code)
	}
}

func TestDIDCommRegisterHandler(t *testing.T) {
	api, db := newAPI(t)
	t.Cleanup(func() { _ = db.Close() })

	payload := map[string]interface{}{
		"did":      "did:example:alice",
		"endpoint": "https://wallet.example.com/didcomm",
	}
	buf, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/didcomm/register", bytes.NewReader(buf))
	rec := httptest.NewRecorder()
	api.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if body["endpoint"].(string) != "https://wallet.example.com/didcomm" {
		t.Fatalf("unexpected endpoint: %v", body["endpoint"])
	}
}
