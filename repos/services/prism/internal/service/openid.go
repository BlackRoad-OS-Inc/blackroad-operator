package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
)

var (
	// ErrCredentialSubjectMissing indicates the credential request lacked a subject DID.
	ErrCredentialSubjectMissing = errors.New("service: credential request must include subject_did")
	// ErrCredentialTypeMissing indicates the credential request lacked a credential type.
	ErrCredentialTypeMissing = errors.New("service: credential request must include credential_type")
	// ErrPresentationRequestInvalid indicates the authorization request was missing required fields.
	ErrPresentationRequestInvalid = errors.New("service: presentation request requires client_id and redirect_uri")
	// ErrPresentationSubmissionInvalid indicates the presentation submission payload was incomplete.
	ErrPresentationSubmissionInvalid = errors.New("service: presentation submission requires nonce and subject_did")
	// ErrPresentationNonceUnknown indicates a nonce was not previously issued.
	ErrPresentationNonceUnknown = errors.New("service: presentation nonce not recognized")
	// ErrPresentationNonceExpired indicates a nonce was issued but is no longer valid.
	ErrPresentationNonceExpired = errors.New("service: presentation nonce has expired")
)

// CredentialRequest represents the JSON payload accepted by the OID4VCI credential endpoint.
type CredentialRequest struct {
	CredentialType string                 `json:"credential_type"`
	SubjectDID     string                 `json:"subject_did"`
	Format         string                 `json:"format"`
	Claims         map[string]interface{} `json:"claims,omitempty"`
	DIDComm        *DIDCommRegistration   `json:"didcomm,omitempty"`
}

// CredentialResponse is returned to the wallet when issuing a credential.
type CredentialResponse struct {
	Format     string                 `json:"format"`
	Credential map[string]interface{} `json:"credential"`
	Nonce      string                 `json:"nonce"`
	DIDComm    *DIDCommChannel        `json:"didcomm,omitempty"`
}

// IssuedCredential captures metadata about issued credentials for auditing.
type IssuedCredential struct {
	Nonce           string    `json:"nonce"`
	SubjectDID      string    `json:"subject_did"`
	CredentialType  string    `json:"credential_type"`
	Format          string    `json:"format"`
	DIDCommEndpoint string    `json:"didcomm_endpoint,omitempty"`
	IssuedAt        time.Time `json:"issued_at"`
}

// PresentationAuthorizationRequest captures the OIDC4VP authorization request parameters.
type PresentationAuthorizationRequest struct {
	ClientID               string                 `json:"client_id"`
	RedirectURI            string                 `json:"redirect_uri"`
	Scope                  []string               `json:"scope,omitempty"`
	State                  string                 `json:"state,omitempty"`
	PresentationDefinition map[string]interface{} `json:"presentation_definition,omitempty"`
}

// PresentationAuthorization represents the authorize response returned to the relying party.
type PresentationAuthorization struct {
	AuthorizationURL string    `json:"authorization_url"`
	Nonce            string    `json:"nonce"`
	ExpiresAt        time.Time `json:"expires_at"`
}

// PresentationSubmission represents the wallet callback payload with the verifiable presentation.
type PresentationSubmission struct {
	Nonce      string                 `json:"nonce"`
	SubjectDID string                 `json:"subject_did"`
	VPToken    map[string]interface{} `json:"vp_token"`
}

// PresentationRecord captures successful presentation verifications.
type PresentationRecord struct {
	Nonce       string    `json:"nonce"`
	SubjectDID  string    `json:"subject_did"`
	ClientID    string    `json:"client_id"`
	RedirectURI string    `json:"redirect_uri"`
	VerifiedAt  time.Time `json:"verified_at"`
}

type presentationNonce struct {
	ClientID    string
	RedirectURI string
	ExpiresAt   time.Time
}

// IssueCredential synthesizes a minimal Verifiable Credential response for OID4VCI wallets.
func (s *Service) IssueCredential(ctx context.Context, req CredentialRequest) (CredentialResponse, error) {
	_ = ctx
	if req.SubjectDID == "" {
		return CredentialResponse{}, ErrCredentialSubjectMissing
	}
	if req.CredentialType == "" {
		return CredentialResponse{}, ErrCredentialTypeMissing
	}
	format := req.Format
	if format == "" {
		format = "vc+sd-jwt"
	}
	credentialSubject := map[string]interface{}{"id": req.SubjectDID}
	for k, v := range req.Claims {
		credentialSubject[k] = v
	}
	issuedAt := s.now()
	credential := map[string]interface{}{
		"@context":          []string{"https://www.w3.org/2018/credentials/v1"},
		"type":              []string{"VerifiableCredential", req.CredentialType},
		"issuer":            "did:prism:issuer", // placeholder issuer DID
		"issuanceDate":      issuedAt.Format(time.RFC3339),
		"credentialSubject": credentialSubject,
	}
	nonce := uuid.NewString()
	var didcommChannel *DIDCommChannel
	if req.DIDComm != nil {
		registration := *req.DIDComm
		if registration.DID == "" {
			registration.DID = req.SubjectDID
		}
		channel, err := s.RegisterDIDCommChannel(ctx, registration)
		if err != nil {
			return CredentialResponse{}, err
		}
		didcommChannel = &channel
	}

	s.mu.Lock()
	s.issuedCredentials = append(s.issuedCredentials, IssuedCredential{
		Nonce:           nonce,
		SubjectDID:      req.SubjectDID,
		CredentialType:  req.CredentialType,
		Format:          format,
		DIDCommEndpoint: endpointFromChannel(didcommChannel),
		IssuedAt:        issuedAt,
	})
	s.mu.Unlock()

	return CredentialResponse{
		Format:     format,
		Credential: credential,
		Nonce:      nonce,
		DIDComm:    didcommChannel,
	}, nil
}

// BatchIssueCredential issues multiple credentials in one request per OID4VCI batch semantics.
func (s *Service) BatchIssueCredential(ctx context.Context, requests []CredentialRequest) ([]CredentialResponse, error) {
	responses := make([]CredentialResponse, 0, len(requests))
	for _, req := range requests {
		resp, err := s.IssueCredential(ctx, req)
		if err != nil {
			return nil, err
		}
		responses = append(responses, resp)
	}
	return responses, nil
}

// AuthorizePresentation prepares an authorization request URL and stores a nonce for later verification.
func (s *Service) AuthorizePresentation(ctx context.Context, req PresentationAuthorizationRequest) (PresentationAuthorization, error) {
	_ = ctx
	if req.ClientID == "" || req.RedirectURI == "" {
		return PresentationAuthorization{}, ErrPresentationRequestInvalid
	}
	nonce := uuid.NewString()
	expiresAt := s.now().Add(5 * time.Minute)

	query := url.Values{}
	query.Set("client_id", req.ClientID)
	query.Set("response_type", "code")
	query.Set("nonce", nonce)
	if len(req.Scope) > 0 {
		query.Set("scope", strings.Join(req.Scope, " "))
	}
	if req.State != "" {
		query.Set("state", req.State)
	}
	authorizationURL := fmt.Sprintf("%s?%s", req.RedirectURI, query.Encode())

	s.mu.Lock()
	s.presentationNonces[nonce] = presentationNonce{
		ClientID:    req.ClientID,
		RedirectURI: req.RedirectURI,
		ExpiresAt:   expiresAt,
	}
	s.mu.Unlock()

	return PresentationAuthorization{
		AuthorizationURL: authorizationURL,
		Nonce:            nonce,
		ExpiresAt:        expiresAt,
	}, nil
}

// CompletePresentation verifies the nonce issued during authorization and records the presentation.
func (s *Service) CompletePresentation(ctx context.Context, submission PresentationSubmission) (PresentationRecord, error) {
	_ = ctx
	if submission.Nonce == "" || submission.SubjectDID == "" {
		return PresentationRecord{}, ErrPresentationSubmissionInvalid
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.presentationNonces[submission.Nonce]
	if !ok {
		return PresentationRecord{}, ErrPresentationNonceUnknown
	}
	if s.now().After(req.ExpiresAt) {
		delete(s.presentationNonces, submission.Nonce)
		return PresentationRecord{}, ErrPresentationNonceExpired
	}
	delete(s.presentationNonces, submission.Nonce)

	record := PresentationRecord{
		Nonce:       submission.Nonce,
		SubjectDID:  submission.SubjectDID,
		ClientID:    req.ClientID,
		RedirectURI: req.RedirectURI,
		VerifiedAt:  s.now(),
	}
	s.presentationRecords = append(s.presentationRecords, record)
	return record, nil
}

// IssuedCredentials returns a copy of the issued credential metadata.
func (s *Service) IssuedCredentials() []IssuedCredential {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]IssuedCredential, len(s.issuedCredentials))
	copy(out, s.issuedCredentials)
	return out
}

// PresentationHistory returns a copy of the recorded presentation verifications.
func (s *Service) PresentationHistory() []PresentationRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]PresentationRecord, len(s.presentationRecords))
	copy(out, s.presentationRecords)
	return out
}

func endpointFromChannel(channel *DIDCommChannel) string {
	if channel == nil {
		return ""
	}
	return channel.Endpoint
}
