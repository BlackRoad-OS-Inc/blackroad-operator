package service

import (
	"context"
	"database/sql"
	"errors"
	"math"
	"testing"
	"time"
)

func newTestService(t *testing.T) (*Service, *sql.DB) {
	t.Helper()
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	svc, err := New(db, WithClock(func() time.Time { return time.Unix(1, 0).UTC() }))
	if err != nil {
		t.Fatalf("construct service: %v", err)
	}
	return svc, db
}

func TestNewServiceRequiresDB(t *testing.T) {
	if _, err := New(nil); err != ErrNilDB {
		t.Fatalf("expected ErrNilDB, got %v", err)
	}
}

func TestHealth(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	ctx := context.Background()
	got, err := svc.Health(ctx)
	if err != nil {
		t.Fatalf("Health() error = %v", err)
	}
	if got.Status != "ok" {
		t.Errorf("unexpected status: %s", got.Status)
	}
	if got.Service != "prism-service" {
		t.Errorf("unexpected service name: %s", got.Service)
	}
	if !got.Time.Equal(time.Unix(1, 0).UTC()) {
		t.Errorf("unexpected time: %v", got.Time)
	}
}

func TestHealthPingFailure(t *testing.T) {
	svc, db := newTestService(t)
	_ = db.Close()
	if _, err := svc.Health(context.Background()); err == nil {
		t.Fatal("expected error when database is closed")
	}
}

func TestEcho(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })
	payload := map[string]string{"hello": "world"}
	got := svc.Echo(context.Background(), payload)
	if !got.OK {
		t.Fatalf("expected OK result")
	}
	if got.Received.(map[string]string)["hello"] != "world" {
		t.Fatalf("payload mismatch: %+v", got.Received)
	}
}

func TestMiniInfer(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	tests := []struct {
		name    string
		x, y    float64
		want    float64
		wantErr error
	}{
		{name: "positive", x: 3, y: 7, want: 21},
		{name: "zero", x: 0, y: 42, want: 0},
		{name: "negative", x: -4, y: 2.5, want: -10},
		{name: "nan", x: math.NaN(), y: 1, wantErr: ErrInvalidNumber},
		{name: "inf", x: math.Inf(1), y: 2, wantErr: ErrInvalidNumber},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := svc.MiniInfer(context.Background(), tc.x, tc.y)
			if tc.wantErr != nil {
				if err == nil {
					t.Fatalf("expected error %v, got nil", tc.wantErr)
				}
				if err != tc.wantErr {
					t.Fatalf("expected error %v, got %v", tc.wantErr, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("MiniInfer() error = %v", err)
			}
			if got.Output != tc.want {
				t.Fatalf("MiniInfer() output = %v, want %v", got.Output, tc.want)
			}
		})
	}

	var count int
	if err := db.QueryRow(`SELECT COUNT(1) FROM mini_infer_requests`).Scan(&count); err != nil {
		t.Fatalf("count records: %v", err)
	}
	if count != 3 {
		t.Fatalf("expected 3 persisted rows, got %d", count)
	}
}

func TestMiniInferInsertFailure(t *testing.T) {
	svc, db := newTestService(t)
	if _, err := db.Exec(`DROP TABLE mini_infer_requests`); err != nil {
		t.Fatalf("drop table: %v", err)
	}
	_ = db.Close()
	if _, err := svc.MiniInfer(context.Background(), 1, 2); err == nil {
		t.Fatal("expected insert failure")
	}
}

func TestIssueCredentialRegistersDIDComm(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	req := CredentialRequest{
		SubjectDID:     "did:example:alice",
		CredentialType: "EmployeeCredential",
		DIDComm: &DIDCommRegistration{
			Endpoint: "https://wallet.example.com/didcomm",
		},
	}
	resp, err := svc.IssueCredential(context.Background(), req)
	if err != nil {
		t.Fatalf("IssueCredential() error = %v", err)
	}
	if resp.Format != "vc+sd-jwt" {
		t.Fatalf("unexpected format: %s", resp.Format)
	}
	if resp.DIDComm == nil || resp.DIDComm.Endpoint != "https://wallet.example.com/didcomm" {
		t.Fatalf("expected didcomm endpoint in response: %+v", resp.DIDComm)
	}
	issued := svc.IssuedCredentials()
	if len(issued) != 1 {
		t.Fatalf("expected 1 issued credential, got %d", len(issued))
	}
	if issued[0].SubjectDID != "did:example:alice" {
		t.Fatalf("unexpected subject: %s", issued[0].SubjectDID)
	}
	channels := svc.DIDCommChannels()
	if len(channels) != 1 {
		t.Fatalf("expected 1 didcomm channel, got %d", len(channels))
	}
}

func TestBatchIssueCredential(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	reqs := []CredentialRequest{
		{SubjectDID: "did:example:1", CredentialType: "Test"},
		{SubjectDID: "did:example:2", CredentialType: "Test"},
	}
	resps, err := svc.BatchIssueCredential(context.Background(), reqs)
	if err != nil {
		t.Fatalf("BatchIssueCredential() error = %v", err)
	}
	if len(resps) != 2 {
		t.Fatalf("expected 2 responses, got %d", len(resps))
	}
	if len(svc.IssuedCredentials()) != 2 {
		t.Fatalf("expected 2 issued credentials")
	}
}

func TestAuthorizeAndCompletePresentation(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	auth, err := svc.AuthorizePresentation(context.Background(), PresentationAuthorizationRequest{
		ClientID:    "client-123",
		RedirectURI: "https://rp.example.com/callback",
		Scope:       []string{"openid", "vp_token"},
	})
	if err != nil {
		t.Fatalf("AuthorizePresentation() error = %v", err)
	}
	if auth.Nonce == "" {
		t.Fatal("expected nonce to be populated")
	}

	record, err := svc.CompletePresentation(context.Background(), PresentationSubmission{
		Nonce:      auth.Nonce,
		SubjectDID: "did:example:alice",
		VPToken:    map[string]interface{}{"proof": "ok"},
	})
	if err != nil {
		t.Fatalf("CompletePresentation() error = %v", err)
	}
	if record.Nonce != auth.Nonce {
		t.Fatalf("nonce mismatch: %s vs %s", record.Nonce, auth.Nonce)
	}
	if len(svc.PresentationHistory()) != 1 {
		t.Fatalf("expected presentation history to be recorded")
	}
}

func TestCompletePresentationUnknownNonce(t *testing.T) {
	svc, db := newTestService(t)
	t.Cleanup(func() { _ = db.Close() })

	_, err := svc.CompletePresentation(context.Background(), PresentationSubmission{
		Nonce:      "no-such-nonce",
		SubjectDID: "did:example:bob",
	})
	if !errors.Is(err, ErrPresentationNonceUnknown) {
		t.Fatalf("expected ErrPresentationNonceUnknown, got %v", err)
	}
}
