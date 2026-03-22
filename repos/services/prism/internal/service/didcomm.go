package service

import (
	"context"
	"errors"
	"sync"
	"time"
)

var (
	// ErrDIDCommAgentUnavailable is returned when registering without a configured agent.
	ErrDIDCommAgentUnavailable = errors.New("service: didcomm agent unavailable")
	// ErrDIDRequired indicates the DID was missing from the registration payload.
	ErrDIDRequired = errors.New("service: did is required")
	// ErrDIDCommEndpointRequired indicates the DIDComm service endpoint was omitted.
	ErrDIDCommEndpointRequired = errors.New("service: didcomm endpoint is required")
)

// DIDCommRegistration models the DID and endpoint metadata advertised by the holder wallet.
type DIDCommRegistration struct {
	DID         string            `json:"did"`
	Endpoint    string            `json:"endpoint"`
	RoutingKeys []string          `json:"routing_keys,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

// DIDCommChannel captures the resolved DIDComm service endpoint registered with Prism.
type DIDCommChannel struct {
	DID          string            `json:"did"`
	Endpoint     string            `json:"endpoint"`
	RoutingKeys  []string          `json:"routing_keys,omitempty"`
	Metadata     map[string]string `json:"metadata,omitempty"`
	RegisteredAt time.Time         `json:"registered_at"`
}

// DIDCommAgent stores DIDComm channel registrations in-memory for follow-up messaging.
type DIDCommAgent struct {
	mu       sync.RWMutex
	channels map[string]DIDCommChannel
}

// NewDIDCommAgent constructs an empty DIDComm agent registry.
func NewDIDCommAgent() *DIDCommAgent {
	return &DIDCommAgent{channels: make(map[string]DIDCommChannel)}
}

// Register stores or updates a DIDComm channel for the provided DID.
func (a *DIDCommAgent) Register(_ context.Context, reg DIDCommRegistration, now time.Time) (DIDCommChannel, error) {
	if reg.DID == "" {
		return DIDCommChannel{}, ErrDIDRequired
	}
	if reg.Endpoint == "" {
		return DIDCommChannel{}, ErrDIDCommEndpointRequired
	}
	channel := DIDCommChannel{
		DID:          reg.DID,
		Endpoint:     reg.Endpoint,
		RoutingKeys:  append([]string(nil), reg.RoutingKeys...),
		Metadata:     cloneStringMap(reg.Metadata),
		RegisteredAt: now,
	}
	a.mu.Lock()
	a.channels[reg.DID] = channel
	a.mu.Unlock()
	return channel, nil
}

// Channels returns a snapshot of the registered DIDComm channels.
func (a *DIDCommAgent) Channels() []DIDCommChannel {
	a.mu.RLock()
	defer a.mu.RUnlock()
	out := make([]DIDCommChannel, 0, len(a.channels))
	for _, channel := range a.channels {
		out = append(out, channel)
	}
	return out
}

// RegisterDIDCommChannel records a DIDComm endpoint for follow-up communications.
func (s *Service) RegisterDIDCommChannel(ctx context.Context, reg DIDCommRegistration) (DIDCommChannel, error) {
	if reg.DID == "" {
		return DIDCommChannel{}, ErrDIDRequired
	}
	if reg.Endpoint == "" {
		return DIDCommChannel{}, ErrDIDCommEndpointRequired
	}
	if s.agent == nil {
		return DIDCommChannel{}, ErrDIDCommAgentUnavailable
	}
	channel, err := s.agent.Register(ctx, reg, s.now())
	if err != nil {
		return DIDCommChannel{}, err
	}
	return channel, nil
}

// DIDCommChannels exposes the registered DIDComm channels.
func (s *Service) DIDCommChannels() []DIDCommChannel {
	if s.agent == nil {
		return nil
	}
	return s.agent.Channels()
}

func cloneStringMap(in map[string]string) map[string]string {
	if in == nil {
		return nil
	}
	out := make(map[string]string, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}
