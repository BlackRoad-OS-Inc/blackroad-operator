variable "name" { type = string }
variable "environment" { type = string }
variable "image" { type = string }
variable "cpu" { type = number }
variable "memory" { type = number }
variable "desired_count" { type = number }
variable "autoscaling_min" { type = number }
variable "autoscaling_max" { type = number }
variable "subnets" { type = list(string) }
variable "security_groups" { type = list(string) }
variable "assign_public_ip" { type = bool }
variable "otlp_endpoint" { type = string }
variable "vpc_id" { type = string }
variable "region" { type = string default = "us-east-1" }
