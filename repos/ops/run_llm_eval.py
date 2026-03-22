#!/usr/bin/env python3
import os, time, json, requests, statistics, sys
API=os.getenv("API","https://staging.api.yourdomain/v1/chat/completions")
cases=json.load(open("ops/llm_eval.json"))
latencies=[]
for c in cases["cases"]:
    t=time.time(); r=requests.post(API,json={"messages":[{"role":"user","content":c["prompt"]}]},timeout=20); dt=(time.time()-t)*1000
    r.raise_for_status(); latencies.append(dt)
    if "mustContain" in c and not all(s.lower() in r.text.lower() for s in c["mustContain"]): sys.exit("❌ content check")
p95=statistics.quantiles(latencies,n=20)[18]
assert p95 < cases["thresholds"]["latency_p95_ms"], f"❌ p95={p95}ms"
print("✅ LLM eval OK p95=%.1fms" % p95)
