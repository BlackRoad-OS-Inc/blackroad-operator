"""OPA-based policy enforcement engine for Prism platform."""

from __future__ import annotations

import hashlib
import json
import logging
import subprocess
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest
from pydantic import BaseModel, Field
from starlette.responses import Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Metrics
POLICY_EVAL_COUNT = Counter("policy_evaluations_total", "Total policy evaluations", ["policy", "result"])
POLICY_EVAL_DURATION = Histogram("policy_evaluation_duration_seconds", "Policy evaluation duration", ["policy"])

app = FastAPI(
    title="Prism Policy Engine",
    description="OPA-based policy enforcement with Rego evaluation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PolicyEvaluationRequest(BaseModel):
    """Policy evaluation request."""

    policy: str = Field(..., description="Policy package name (e.g., 'deploy.authz', 'sentinel.network')")
    input: Dict[str, Any] = Field(..., description="Input data for policy evaluation")
    rule: str = Field("allow", description="Rule to evaluate (default: 'allow')")


class PolicyEvaluationResponse(BaseModel):
    """Policy evaluation response."""

    result: Any = Field(..., description="Evaluation result")
    policy: str = Field(..., description="Policy package name")
    rule: str = Field(..., description="Rule evaluated")
    allowed: bool = Field(..., description="Whether the action is allowed")
    violations: List[str] = Field(default_factory=list, description="Policy violations if any")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class PolicyBundleInfo(BaseModel):
    """Policy bundle information."""

    policies: List[str] = Field(..., description="List of available policies")
    count: int = Field(..., description="Total number of policies")


class OPAEngine:
    """OPA policy evaluation engine."""

    def __init__(self, policy_dir: Path):
        """Initialize OPA engine.

        Args:
            policy_dir: Directory containing Rego policy files
        """
        self.policy_dir = policy_dir
        self.policies: Dict[str, Path] = {}
        self._discover_policies()

    def _discover_policies(self) -> None:
        """Discover all .rego files in the policy directory."""
        if not self.policy_dir.exists():
            logger.warning(f"Policy directory does not exist: {self.policy_dir}")
            return

        for rego_file in self.policy_dir.rglob("*.rego"):
            # Extract package name from file
            policy_name = self._extract_package_name(rego_file)
            if policy_name:
                self.policies[policy_name] = rego_file
                logger.info(f"Discovered policy: {policy_name} at {rego_file}")

    def _extract_package_name(self, rego_file: Path) -> str | None:
        """Extract package name from Rego file.

        Args:
            rego_file: Path to Rego file

        Returns:
            Package name or None
        """
        try:
            content = rego_file.read_text()
            for line in content.splitlines():
                if line.strip().startswith("package "):
                    return line.strip().replace("package ", "").strip()
        except Exception as e:
            logger.error(f"Error reading {rego_file}: {e}")
        return None

    async def evaluate(self, policy: str, input_data: Dict[str, Any], rule: str = "allow") -> Dict[str, Any]:
        """Evaluate policy using OPA.

        Args:
            policy: Policy package name
            input_data: Input data for evaluation
            rule: Rule to evaluate

        Returns:
            Evaluation result

        Raises:
            HTTPException: If policy not found or evaluation fails
        """
        if policy not in self.policies:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy '{policy}' not found. Available: {list(self.policies.keys())}",
            )

        policy_file = self.policies[policy]

        try:
            # Create input file
            input_json = json.dumps(input_data)

            # Run OPA eval command
            cmd = [
                "opa",
                "eval",
                "--data",
                str(policy_file),
                "--input",
                "-",
                "--format",
                "json",
                f"data.{policy}.{rule}",
            ]

            result = subprocess.run(
                cmd,
                input=input_json.encode(),
                capture_output=True,
                timeout=10,
            )

            if result.returncode != 0:
                error_msg = result.stderr.decode()
                logger.error(f"OPA evaluation failed: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"OPA evaluation failed: {error_msg}",
                )

            # Parse result
            output = json.loads(result.stdout.decode())
            eval_result = output.get("result", [{}])[0].get("expressions", [{}])[0].get("value")

            # Check for deny_reason if allow is false
            deny_reason = None
            if not eval_result:
                cmd_reason = [
                    "opa",
                    "eval",
                    "--data",
                    str(policy_file),
                    "--input",
                    "-",
                    "--format",
                    "json",
                    f"data.{policy}.deny_reason",
                ]
                result_reason = subprocess.run(
                    cmd_reason,
                    input=input_json.encode(),
                    capture_output=True,
                    timeout=10,
                )
                if result_reason.returncode == 0:
                    output_reason = json.loads(result_reason.stdout.decode())
                    deny_reason = output_reason.get("result", [{}])[0].get("expressions", [{}])[0].get("value")

            return {
                "result": eval_result,
                "allowed": bool(eval_result),
                "violations": [deny_reason] if deny_reason else [],
                "metadata": {"policy_file": str(policy_file)},
            }

        except subprocess.TimeoutExpired:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Policy evaluation timed out",
            )
        except Exception as e:
            logger.error(f"Error evaluating policy: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Policy evaluation error: {str(e)}",
            )

    def list_policies(self) -> List[str]:
        """List all available policies.

        Returns:
            List of policy names
        """
        return list(self.policies.keys())


# Initialize OPA engine
POLICY_DIR = Path(__file__).parent.parent / "policies"
opa_engine = OPAEngine(POLICY_DIR)


@app.get("/health")
async def health():
    """Health check."""
    return {"status": "healthy", "service": "policy-engine"}


@app.get("/healthz")
async def healthz():
    """Kubernetes health check."""
    return {"ok": True}


@app.get("/policies", response_model=PolicyBundleInfo)
async def list_policies():
    """List all available policies."""
    policies = opa_engine.list_policies()
    return PolicyBundleInfo(policies=policies, count=len(policies))


@app.post("/v1/evaluate", response_model=PolicyEvaluationResponse)
async def evaluate_policy(request: PolicyEvaluationRequest):
    """Evaluate a policy.

    Args:
        request: Policy evaluation request

    Returns:
        Policy evaluation response
    """
    import time

    start_time = time.time()

    try:
        result = await opa_engine.evaluate(request.policy, request.input, request.rule)

        # Update metrics
        duration = time.time() - start_time
        POLICY_EVAL_COUNT.labels(policy=request.policy, result="allow" if result["allowed"] else "deny").inc()
        POLICY_EVAL_DURATION.labels(policy=request.policy).observe(duration)

        return PolicyEvaluationResponse(
            result=result["result"],
            policy=request.policy,
            rule=request.rule,
            allowed=result["allowed"],
            violations=result["violations"],
            metadata=result["metadata"],
        )

    except HTTPException:
        POLICY_EVAL_COUNT.labels(policy=request.policy, result="error").inc()
        raise
    except Exception as e:
        POLICY_EVAL_COUNT.labels(policy=request.policy, result="error").inc()
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/metrics")
async def metrics():
    """Prometheus metrics."""
    return Response(content=generate_latest(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
