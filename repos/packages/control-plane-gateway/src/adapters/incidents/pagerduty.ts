import { Incident } from '../../domain';
import { IncidentAdapter } from '../types';

/**
 * PagerDuty Incident Adapter
 * Integrates with PagerDuty API to fetch and manage incidents for BlackRoad services
 */
export class PagerDutyIncidentAdapter implements IncidentAdapter {
  name: 'pagerduty' = 'pagerduty';

  private readonly apiToken: string;
  private readonly apiBaseUrl: string = 'https://api.pagerduty.com';

  constructor(config: { apiToken: string; apiBaseUrl?: string }) {
    if (!config.apiToken) {
      throw new Error('PagerDuty API token is required');
    }
    this.apiToken = config.apiToken;
    if (config.apiBaseUrl) {
      this.apiBaseUrl = config.apiBaseUrl;
    }
  }

  /**
   * Fetch recent incidents for a service from PagerDuty
   */
  async recent(input: { serviceId: string; limit?: number }): Promise<Incident[]> {
    const limit = input.limit || 50;

    try {
      // Map BlackRoad service ID to PagerDuty service ID
      const pdServiceId = this.mapServiceId(input.serviceId);

      // Fetch incidents from PagerDuty API
      const response = await this.fetchPagerDutyIncidents(pdServiceId, limit);

      // Transform PagerDuty incidents to BlackRoad Incident format
      return this.transformIncidents(response.incidents, input.serviceId);
    } catch (error) {
      console.error(`Failed to fetch PagerDuty incidents for service ${input.serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch incidents from PagerDuty API
   */
  private async fetchPagerDutyIncidents(
    serviceId: string,
    limit: number
  ): Promise<{ incidents: PagerDutyIncident[] }> {
    const url = new URL(`${this.apiBaseUrl}/incidents`);
    url.searchParams.set('service_ids[]', serviceId);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('sort_by', 'created_at:desc');
    url.searchParams.set('statuses[]', 'triggered');
    url.searchParams.set('statuses[]', 'acknowledged');

    const headers = {
      'Authorization': `Token token=${this.apiToken}`,
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json'
    };

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PagerDuty API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Transform PagerDuty incidents to BlackRoad format
   */
  private transformIncidents(pdIncidents: PagerDutyIncident[], serviceId: string): Incident[] {
    return pdIncidents.map(pdi => ({
      id: pdi.id,
      serviceId: serviceId,
      severity: this.mapSeverity(pdi.urgency, pdi.priority),
      startedAt: pdi.created_at,
      status: pdi.status,
      link: pdi.html_url
    }));
  }

  /**
   * Map PagerDuty urgency/priority to BlackRoad severity
   */
  private mapSeverity(
    urgency: 'high' | 'low',
    priority?: { summary: string }
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (urgency === 'high') {
      // Check if P1/SEV1 in priority summary
      if (priority?.summary?.match(/P1|SEV-?1|critical/i)) {
        return 'critical';
      }
      return 'high';
    }

    // Low urgency
    if (priority?.summary?.match(/P3|SEV-?3|low/i)) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Map BlackRoad service ID to PagerDuty service ID
   * In production, this would lookup from a config/database
   */
  private mapServiceId(blackroadServiceId: string): string {
    // Check environment variable first
    const envKey = `PAGERDUTY_SERVICE_${blackroadServiceId.toUpperCase().replace(/-/g, '_')}`;
    const pdServiceId = process.env[envKey];

    if (pdServiceId) {
      return pdServiceId;
    }

    // Fallback: assume direct mapping or use default service
    // In production, this should be a required configuration
    console.warn(
      `No PagerDuty service mapping found for ${blackroadServiceId}. ` +
      `Set ${envKey} environment variable.`
    );

    return blackroadServiceId; // Direct mapping fallback
  }

  /**
   * Create a new incident in PagerDuty (optional extension)
   */
  async createIncident(params: {
    serviceId: string;
    title: string;
    description: string;
    urgency?: 'high' | 'low';
  }): Promise<Incident> {
    const pdServiceId = this.mapServiceId(params.serviceId);

    const body = {
      incident: {
        type: 'incident',
        title: params.title,
        service: {
          id: pdServiceId,
          type: 'service_reference'
        },
        urgency: params.urgency || 'high',
        body: {
          type: 'incident_body',
          details: params.description
        }
      }
    };

    const headers = {
      'Authorization': `Token token=${this.apiToken}`,
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      'From': process.env.PAGERDUTY_USER_EMAIL || 'blackroad@example.com'
    };

    const response = await fetch(`${this.apiBaseUrl}/incidents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create PagerDuty incident (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return this.transformIncidents([result.incident], params.serviceId)[0];
  }

  /**
   * Acknowledge an incident
   */
  async acknowledgeIncident(incidentId: string, acknowledger: string): Promise<void> {
    const body = {
      incident: {
        type: 'incident_reference',
        status: 'acknowledged'
      }
    };

    const headers = {
      'Authorization': `Token token=${this.apiToken}`,
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      'From': acknowledger
    };

    const response = await fetch(`${this.apiBaseUrl}/incidents/${incidentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to acknowledge incident ${incidentId} (${response.status}): ${errorText}`);
    }
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(incidentId: string, resolver: string): Promise<void> {
    const body = {
      incident: {
        type: 'incident_reference',
        status: 'resolved'
      }
    };

    const headers = {
      'Authorization': `Token token=${this.apiToken}`,
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      'From': resolver
    };

    const response = await fetch(`${this.apiBaseUrl}/incidents/${incidentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to resolve incident ${incidentId} (${response.status}): ${errorText}`);
    }
  }
}

/**
 * PagerDuty API types
 */
interface PagerDutyIncident {
  id: string;
  type: 'incident';
  summary: string;
  status: 'triggered' | 'acknowledged' | 'resolved';
  urgency: 'high' | 'low';
  created_at: string;
  html_url: string;
  priority?: {
    summary: string;
    id: string;
  };
  service: {
    id: string;
    summary: string;
  };
}
