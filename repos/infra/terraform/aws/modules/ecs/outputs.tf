output "service_arn" {
  value = aws_ecs_service.this.arn
}

output "lb_dns" {
  value = aws_lb.this.dns_name
}
