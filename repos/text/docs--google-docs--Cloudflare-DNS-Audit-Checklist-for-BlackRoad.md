# Cloudflare DNS Audit Checklist for BlackRoad

**Source:** google-docs

---

Cloudflare DNS Audit Checklist for BlackRoad

Inventory

Compile a full inventory of all DNS zones in Cloudflare.

Export the list of DNS records for each zone, including record types (A, AAAA, CNAME, TXT, MX, etc.).

Ensure each record has a clear description of its purpose and owner.

DNS Records mapping (apex, www, and subdomains)

Identify the apex (root) domain record (e.g., @) and document whether it uses an A or CNAME (Cloudflare may flatten CNAME at apex).

Document the www record and confirm it points to the correct service.

Map all subdomains to their targets, ensuring there are no stale CNAMEs or records left from previous services.

Verify that CNAMEs used for third party services are set to DNS only (not proxied) when necessary, since Cloudflare recommends proxying only A, AAAA, and CNAME records used for serving web traffic (developers.cloudflare.com).

Routing (Railway/Vercel targets)

Check that the apex and www records route to the correct Railway or Vercel endpoints. Railway typically provides a target CNAME; Vercel provides an alias or nameserver; ensure these values match.

Validate that any subdomain used for apps on Railway/Vercel resolves correctly and returns expected HTTP content.

For apex CNAMEs, confirm that CNAME flattening (if used) returns the correct IP addresses.

Remove any stale or unused CNAMEs from prior deployments to prevent hijacking.

TLS/SSL

Review the SSL/TLS configuration in Cloudflare. Certificates go through several stages (Initializing, Pending Validation, Pending Issuance, Pending Deployment, Active) before becoming active (developers.cloudflare.com).

Ensure the edge certificate for the domain is in an Active state; if not, troubleshoot validation steps.

Verify that the SSL/TLS mode is set to Full (strict) where possible, and that origin servers have valid certificates.

Use Certificate Transparency monitoring or Cloudflare’s certificate dashboard to watch for unexpected certificates.

Proxy/Security

Check the proxy status (orange cloud) for each record. When a DNS record is set to Proxied (orange cloud), Cloudflare can protect the origin server from DDoS attacks and provide caching and performance benefits (developers.cloudflare.com).

For records that should not be proxied (e.g., verification CNAMEs for third party services), ensure they are set to DNS only.

Confirm that the orange cloud is enabled for web‑facing A, AAAA, and CNAME records that need security and performance benefits. A DNS‟only (grey cloud) record exposes the origin IP and does not benefit from Cloudflare’s services (www.whogohost.com).

Check the audit log to see if any records have been modified unexpectedly.

Review DNSSEC status and ensure it is enabled for zones that support it.

Change Log

Maintain a change log documenting every DNS modification: date/time, record changed, reason, and person responsible.

Use Cloudflare’s audit log to review historical changes and cross‑reference with internal requests.

When updating or deleting records, add comments or descriptions in Cloudflare for future reference.

Review & Publication Plan

Perform this DNS audit quarterly to ensure configurations remain current and secure.

Assign reviewers from the infrastructure team and the security team. At least one reviewer should be familiar with Railway and Vercel deployments.

Schedule a quarterly meeting to review the audit findings, implement necessary changes, and publish an updated audit report internally.

Communicate any significant changes to stakeholders and update documentation accordingly.
