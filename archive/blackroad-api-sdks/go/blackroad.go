// Package blackroad provides a Go client for the BlackRoad OS API.
//
// Usage:
//
//	client := blackroad.New()
//	status, err := client.Fleet.Status()
//	err = client.Slack.Post("hello from go")
package blackroad

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	StatsURL   string
	SlackURL   string
	GatewayURL string
	HTTP       *http.Client
	Fleet      *FleetService
	Slack      *SlackService
	AI         *AIService
}

func New(opts ...Option) *Client {
	c := &Client{
		StatsURL:   "https://stats-blackroad.amundsonalexa.workers.dev",
		SlackURL:   "https://blackroad-slack.amundsonalexa.workers.dev",
		GatewayURL: "http://localhost:11434",
		HTTP:       &http.Client{Timeout: 30 * time.Second},
	}
	for _, opt := range opts {
		opt(c)
	}
	c.Fleet = &FleetService{client: c}
	c.Slack = &SlackService{client: c}
	c.AI = &AIService{client: c}
	return c
}

type Option func(*Client)

func WithStatsURL(url string) Option   { return func(c *Client) { c.StatsURL = strings.TrimRight(url, "/") } }
func WithSlackURL(url string) Option   { return func(c *Client) { c.SlackURL = strings.TrimRight(url, "/") } }
func WithGatewayURL(url string) Option { return func(c *Client) { c.GatewayURL = strings.TrimRight(url, "/") } }

// Fleet

type FleetService struct{ client *Client }

func (f *FleetService) Status() (map[string]interface{}, error) {
	return f.client.get(f.client.StatsURL + "/fleet")
}

func (f *FleetService) All() (map[string]interface{}, error) {
	return f.client.get(f.client.StatsURL + "/all")
}

func (f *FleetService) Health() (map[string]interface{}, error) {
	return f.client.get(f.client.StatsURL + "/health")
}

// Slack

type SlackService struct{ client *Client }

func (s *SlackService) Post(text string) (map[string]interface{}, error) {
	return s.client.post(s.client.SlackURL+"/post", map[string]string{"text": text})
}

func (s *SlackService) Alert(text string) (map[string]interface{}, error) {
	return s.client.post(s.client.SlackURL+"/alert", map[string]string{"text": text})
}

func (s *SlackService) Status() (map[string]interface{}, error) {
	return s.client.get(s.client.SlackURL + "/status")
}

// AI

type AIService struct{ client *Client }

func (a *AIService) Generate(model, prompt string) (map[string]interface{}, error) {
	return a.client.post(a.client.GatewayURL+"/api/generate", map[string]interface{}{
		"model": model, "prompt": prompt, "stream": false,
	})
}

func (a *AIService) Models() (map[string]interface{}, error) {
	return a.client.get(a.client.GatewayURL + "/api/tags")
}

// HTTP helpers

func (c *Client) get(url string) (map[string]interface{}, error) {
	resp, err := c.HTTP.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return decodeJSON(resp.Body)
}

func (c *Client) post(url string, data interface{}) (map[string]interface{}, error) {
	body, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return decodeJSON(resp.Body)
}

func decodeJSON(r io.Reader) (map[string]interface{}, error) {
	var result map[string]interface{}
	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}
	return result, nil
}
