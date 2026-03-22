output "load_balancer_dns" {
  value       = module.svc_template.lb_dns
  description = "DNS name of the ALB"
}
