variable "region" {
  type    = string
  default = "us-east-1"
}

variable "service_name" {
  type    = string
  default = "svc-template"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "image" {
  type = string
}

variable "cpu" {
  type    = number
  default = 512
}

variable "memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  type    = number
  default = 2
}

variable "autoscaling_min" {
  type    = number
  default = 2
}

variable "autoscaling_max" {
  type    = number
  default = 5
}

variable "subnets" {
  type = list(string)
}

variable "security_groups" {
  type = list(string)
}

variable "assign_public_ip" {
  type    = bool
  default = false
}

variable "otlp_endpoint" {
  type    = string
  default = "https://otel.example.com"
}

variable "vpc_id" {
  type = string
}
