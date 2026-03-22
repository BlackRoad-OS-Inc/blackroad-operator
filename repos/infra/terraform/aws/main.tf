terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "svc_template" {
  source              = "./modules/ecs"
  region              = var.region
  name                = var.service_name
  environment         = var.environment
  image               = var.image
  cpu                 = var.cpu
  memory              = var.memory
  desired_count       = var.desired_count
  subnets             = var.subnets
  security_groups     = var.security_groups
  vpc_id             = var.vpc_id
  assign_public_ip    = var.assign_public_ip
  autoscaling_max     = var.autoscaling_max
  autoscaling_min     = var.autoscaling_min
  otlp_endpoint       = var.otlp_endpoint
}

output "service_arn" {
  value = module.svc_template.service_arn
}
