terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "cloudflare_api_token" {
  description = "API token with permissions to manage zones and DNS records."
  type        = string
  sensitive   = true
}

variable "zones" {
  description = "Map of zones to create/manage keyed by domain name."
  type = map(object({
    account_id = string
    plan       = optional(string)
  }))
}

variable "dns_records" {
  description = "Nested map of DNS records keyed by zone then record key."
  type = map(map(object({
    type     = string
    name     = string
    content  = string
    ttl      = optional(number, 300)
    proxied  = optional(bool, false)
    priority = optional(number)
  })))
  default = {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_zone" "domains" {
  for_each   = var.zones
  zone       = each.key
  account_id = each.value.account_id
  plan       = try(each.value.plan, null)
}

locals {
  dns_records = length(var.dns_records) > 0 ? merge([
    for zone, records in var.dns_records : {
      for record_key, record in records :
      "${zone}:${record_key}" => merge(record, { zone = zone })
    }
  ]...) : {}
}

resource "cloudflare_record" "records" {
  for_each = {
    for key, record in local.dns_records : key => record
    if contains(keys(var.zones), lookup(record, "zone", ""))
  }

  zone_id  = cloudflare_zone.domains[each.value.zone].id
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  ttl      = lookup(each.value, "ttl", 300)
  proxied  = lookup(each.value, "proxied", false)
  priority = lookup(each.value, "priority", null)
}
