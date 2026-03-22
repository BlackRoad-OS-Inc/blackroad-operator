package deploy

default allow = false

allow {
  input.slo.p95_ms <= 500
  input.slo.error_rate <= 0.001
  input.eval.score >= 0.8
  required_headers
  probes_defined
}

required_headers {
  not input.headers["X-Build-SHA"] == ""
  not input.headers["X-Service-Version"] == ""
}

probes_defined {
  input.kubernetes.livenessProbe
  input.kubernetes.readinessProbe
  input.kubernetes.metrics.enabled
}

violation[msg] {
  not allow
  msg := {
    "message": "Deployment gate failed",
    "details": {
      "slo": input.slo,
      "eval": input.eval,
      "headers": input.headers,
    },
  }
}
