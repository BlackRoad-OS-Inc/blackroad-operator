# Production Deployment Checklist

## Pre-Deployment (1 Week Before)

### Security
- [ ] All secrets rotated within policy timeframes (90d SSH, 30d CI, 15-30d DB/API)
- [ ] Secret management (Vault/SOPS) configured and tested
- [ ] mTLS enabled between services
- [ ] Firewall rules (UFW) applied to all hosts
- [ ] All containers running as non-root users
- [ ] Security audit completed (penetration testing)
- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Dependency security scan passed (npm audit, pip-audit)

### Infrastructure
- [ ] Terraform state backed up
- [ ] All infrastructure as code reviewed and applied
- [ ] DNS records configured (A, AAAA, CNAME, MX, TXT)
- [ ] SSL/TLS certificates valid and auto-renewal configured
- [ ] CDN configured and tested (CloudFlare/Fastly)
- [ ] Load balancers health-checked
- [ ] Auto-scaling policies configured and tested

### Observability
- [ ] Prometheus deployed and scraping all services
- [ ] Grafana dashboards imported and verified
- [ ] Alertmanager configured with routing rules
- [ ] Alert runbooks created for all critical alerts
- [ ] PagerDuty/on-call rotation configured
- [ ] Log aggregation (ELK/Loki) deployed
- [ ] Error tracking (Sentry) configured
- [ ] Distributed tracing enabled

### Application
- [ ] All tests passing (unit, integration, e2e)
- [ ] Test coverage >= 80%
- [ ] Performance testing completed (k6 load tests)
- [ ] Bundle sizes optimized and under budget
- [ ] Database migrations tested on staging
- [ ] Feature flags configured for gradual rollout
- [ ] API rate limiting configured
- [ ] CORS policies reviewed

### Data
- [ ] Backup procedures tested (restore drill completed)
- [ ] RTO/RPO defined and documented
- [ ] Data retention policies implemented
- [ ] GDPR/privacy compliance verified
- [ ] Database replication configured
- [ ] Point-in-time recovery tested

## Deployment Day

### Final Checks (T-1 Hour)
- [ ] Staging environment matches production configuration
- [ ] Smoke tests passing on staging
- [ ] Rollback plan documented and reviewed
- [ ] Communication plan activated (status page, stakeholders)
- [ ] On-call engineers briefed
- [ ] Database backup completed < 1 hour ago

### Deployment (T-0)
- [ ] Enable maintenance mode (if applicable)
- [ ] Run database migrations
- [ ] Deploy application (blue-green/canary)
- [ ] Verify health checks passing
- [ ] Run smoke tests in production
- [ ] Monitor error rates, latency, throughput
- [ ] Gradually increase traffic to new version

### Post-Deployment (T+30 min)
- [ ] All health checks green for 30+ minutes
- [ ] Error rates within normal range
- [ ] Latency P95/P99 within SLO
- [ ] No critical alerts firing
- [ ] Smoke tests passing
- [ ] User acceptance testing completed
- [ ] Disable maintenance mode

## Post-Deployment (24-48 Hours)

### Monitoring
- [ ] Review metrics dashboards (24h)
- [ ] Check error tracking for new issues
- [ ] Review log aggregation for anomalies
- [ ] Verify backup jobs completed successfully
- [ ] Check resource utilization (CPU, memory, disk)

### Documentation
- [ ] Update deployment documentation
- [ ] Create postmortem if issues occurred
- [ ] Update runbooks based on learnings
- [ ] Document configuration changes
- [ ] Update API documentation if changed

### Communication
- [ ] Notify stakeholders of successful deployment
- [ ] Update status page to operational
- [ ] Share metrics report with team
- [ ] Conduct retrospective meeting

## Rollback Procedure

If critical issues are detected:

1. **Immediate Actions**
   - [ ] Trigger incident response procedure
   - [ ] Notify on-call team
   - [ ] Update status page

2. **Rollback Steps**
   - [ ] Revert to previous version (blue-green switch)
   - [ ] Verify health checks passing
   - [ ] Run smoke tests
   - [ ] Monitor for 15 minutes

3. **Recovery**
   - [ ] Identify root cause
   - [ ] Create hotfix if needed
   - [ ] Test hotfix on staging
   - [ ] Schedule re-deployment

## Environment-Specific Checklists

### Fly.io Deployment
- [ ] `fly.toml` configured
- [ ] Secrets added via `fly secrets set`
- [ ] Database provisioned (PostgreSQL)
- [ ] Volumes configured for persistent data
- [ ] Regions selected for geographic distribution
- [ ] Deploy with `fly deploy --ha=false` (initial), then scale

### AWS ECS Deployment  
- [ ] Task definitions updated
- [ ] Service discovery configured
- [ ] ALB/NLB configured with health checks
- [ ] Auto-scaling policies applied
- [ ] CloudWatch alarms configured
- [ ] IAM roles and policies reviewed
- [ ] RDS/Aurora configured with read replicas

### Kubernetes Deployment
- [ ] Namespaces created
- [ ] ConfigMaps and Secrets applied
- [ ] Deployments, Services, Ingress configured
- [ ] HPA (Horizontal Pod Autoscaler) configured
- [ ] PodDisruptionBudgets set
- [ ] NetworkPolicies applied
- [ ] RBAC roles configured

## SLO/SLA Targets

### Availability
- **Target**: 99.9% uptime (43.8 minutes downtime/month)
- **Measurement**: Synthetic monitoring + real user monitoring

### Latency
- **API Response Time P95**: < 500ms
- **API Response Time P99**: < 1000ms
- **Page Load Time P95**: < 2000ms

### Error Rate
- **Target**: < 0.1% error rate
- **Measurement**: HTTP 5xx responses / total requests

### Recovery
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

## Sign-Off

- [ ] Engineering Lead approval
- [ ] DevOps/SRE approval
- [ ] Security approval
- [ ] Product approval

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Git Commit**: _______________
