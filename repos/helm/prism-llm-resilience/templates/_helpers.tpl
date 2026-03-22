{{- define "prism-llm-resilience.canaryScript" -}}
{{- $path := "files/lucidia_llm_canary.py" -}}
{{- $lines := .Files.Get $path | splitList "\n" -}}
{{- range $lines -}}
{{ . | replace "\t" "    " }}
{{ end -}}
{{- end -}}
