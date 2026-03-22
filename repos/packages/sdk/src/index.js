/**
 * RoadCode SDK — client for the /road/v1/* API
 */

class RoadCodeClient {
  constructor(baseUrl = 'http://localhost:3101') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async _fetch(path) {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`RoadCode API error: ${res.status} ${path}`);
    return res.json();
  }

  async orgs() { return this._fetch('/road/v1/orgs'); }
  async org(name) { return this._fetch(`/road/v1/orgs/${name}`); }
  async repos(org) { return this._fetch(org ? `/road/v1/repos?org=${org}` : '/road/v1/repos'); }
  async domains(org) { return this._fetch(org ? `/road/v1/domains?org=${org}` : '/road/v1/domains'); }
  async agents(org) { return this._fetch(org ? `/road/v1/agents?org=${org}` : '/road/v1/agents'); }
  async nodes() { return this._fetch('/road/v1/nodes'); }
  async services(node) { return this._fetch(node ? `/road/v1/services?node=${node}` : '/road/v1/services'); }
  async search(q) { return this._fetch(`/road/v1/search?q=${encodeURIComponent(q)}`); }
  async health() { return this._fetch('/road/v1/health'); }
}

module.exports = { RoadCodeClient };
