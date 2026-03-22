package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/blackroad/prism-console/services/prism/internal/service"
)

type batchCredentialRequest struct {
	Requests []service.CredentialRequest `json:"requests"`
}

type batchCredentialResponse struct {
	Credentials []service.CredentialResponse `json:"credentials"`
}

func (a *API) handleOID4VCICredential(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req service.CredentialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	resp, err := a.svc.IssueCredential(r.Context(), req)
	if err != nil {
		status, msg := classifyServiceError(err)
		http.Error(w, msg, status)
		return
	}
	writeJSON(w, resp)
}

func (a *API) handleOID4VCIBatchCredential(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload batchCredentialRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	resp, err := a.svc.BatchIssueCredential(r.Context(), payload.Requests)
	if err != nil {
		status, msg := classifyServiceError(err)
		http.Error(w, msg, status)
		return
	}
	writeJSON(w, batchCredentialResponse{Credentials: resp})
}

func (a *API) handleOIDC4VPAuthorize(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req service.PresentationAuthorizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	resp, err := a.svc.AuthorizePresentation(r.Context(), req)
	if err != nil {
		status, msg := classifyServiceError(err)
		http.Error(w, msg, status)
		return
	}
	writeJSON(w, resp)
}

func (a *API) handleOIDC4VPCallback(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var submission service.PresentationSubmission
	if err := json.NewDecoder(r.Body).Decode(&submission); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	record, err := a.svc.CompletePresentation(r.Context(), submission)
	if err != nil {
		status, msg := classifyServiceError(err)
		http.Error(w, msg, status)
		return
	}
	writeJSON(w, record)
}

func (a *API) handleDIDCommRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req service.DIDCommRegistration
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	channel, err := a.svc.RegisterDIDCommChannel(r.Context(), req)
	if err != nil {
		status, msg := classifyServiceError(err)
		http.Error(w, msg, status)
		return
	}
	writeJSON(w, channel)
}

func classifyServiceError(err error) (int, string) {
	switch {
	case errors.Is(err, service.ErrCredentialSubjectMissing),
		errors.Is(err, service.ErrCredentialTypeMissing),
		errors.Is(err, service.ErrPresentationRequestInvalid),
		errors.Is(err, service.ErrPresentationSubmissionInvalid),
		errors.Is(err, service.ErrPresentationNonceUnknown),
		errors.Is(err, service.ErrPresentationNonceExpired),
		errors.Is(err, service.ErrDIDRequired),
		errors.Is(err, service.ErrDIDCommEndpointRequired):
		return http.StatusBadRequest, err.Error()
	case errors.Is(err, service.ErrDIDCommAgentUnavailable):
		return http.StatusServiceUnavailable, err.Error()
	default:
		return http.StatusInternalServerError, err.Error()
	}
}
