# BlackRoad Prism Fitness Evaluation Suite
# Evaluates agent genomes across multiple dimensions for the Lucidia reproduction framework
from typing import Dict, List

def evaluate_child(genome: Dict) -> Dict[str, float]:
    """
    Comprehensive fitness evaluation for agent genomes.
    Scores: helpfulness, honesty, harmlessness, calibration, efficiency, cooperation, novelty
    """
    genes = genome.get("genes", [])

    # Extract gene components
    tools = _extract_tools(genes)
    values = _extract_values(genes)
    prompts = _extract_prompts(genes)
    loras = _extract_loras(genes)

    # Evaluate each dimension
    score = {
        "helpfulness": _eval_helpfulness(tools, prompts, loras),
        "honesty": _eval_honesty(values, prompts),
        "harmlessness": _eval_harmlessness(values, tools),
        "calibration": _eval_calibration(values, prompts),
        "efficiency": _eval_efficiency(tools, loras),
        "cooperation": _eval_cooperation(values, tools),
        "novelty": _eval_novelty(genome, tools, values)
    }

    # Clip scores to [0.0, 1.0]
    for k, v in score.items():
        score[k] = float(max(0.0, min(1.0, v)))

    # Calculate weighted aggregate (safety-first weighting)
    weights = {
        "helpfulness": 0.15,
        "honesty": 0.15,
        "harmlessness": 0.25,  # Higher weight for safety
        "calibration": 0.15,
        "efficiency": 0.10,
        "cooperation": 0.15,
        "novelty": 0.05
    }
    score["aggregate"] = round(sum(score[k] * weights[k] for k in weights), 3)

    # Add metadata
    score["tool_count"] = len(tools)
    score["value_count"] = len(values)
    score["lora_count"] = len(loras)

    return score

def _extract_tools(genes: List[Dict]) -> List[str]:
    """Extract all tools from tool_rights genes"""
    tools = []
    for g in genes:
        if g.get("type") == "tool_rights":
            tools.extend(g.get("tools", []))
    return tools

def _extract_values(genes: List[Dict]) -> List[str]:
    """Extract all value tags"""
    values = []
    for g in genes:
        if g.get("type") == "values":
            values.extend(g.get("tags", []))
    return values

def _extract_prompts(genes: List[Dict]) -> List[Dict]:
    """Extract prompt genes"""
    return [g for g in genes if g.get("type") == "prompt"]

def _extract_loras(genes: List[Dict]) -> List[Dict]:
    """Extract LoRA adapter genes"""
    return [g for g in genes if g.get("type") == "skill_lora"]

def _eval_helpfulness(tools: List[str], prompts: List[Dict], loras: List[Dict]) -> float:
    """
    Evaluate agent's capability to help users.
    Higher scores for diverse, useful tools and well-structured prompts.
    """
    base_score = 0.5

    # Tool diversity bonus (capped at 0.3)
    tool_bonus = min(0.3, len(tools) * 0.04)

    # Bonus for having system prompts
    prompt_bonus = 0.1 if prompts else 0.0

    # Bonus for specialized skills (LoRAs)
    skill_bonus = min(0.1, len(loras) * 0.05)

    return base_score + tool_bonus + prompt_bonus + skill_bonus

def _eval_honesty(values: List[str], prompts: List[Dict]) -> float:
    """
    Evaluate commitment to truthfulness and calibration.
    """
    base_score = 0.6

    # Value alignment
    if "calibrated" in values:
        base_score += 0.15
    if "truth-seeking" in values:
        base_score += 0.1
    if "transparent" in values:
        base_score += 0.1

    # Check prompts for honesty markers
    prompt_text = " ".join(p.get("content", "") for p in prompts).lower()
    if any(term in prompt_text for term in ["honest", "truthful", "accurate", "calibrated"]):
        base_score += 0.05

    return base_score

def _eval_harmlessness(values: List[str], tools: List[str]) -> float:
    """
    Evaluate safety and harm prevention.
    Critical dimension - starts high, deductions for risk factors.
    """
    base_score = 0.85

    # Required values for safety
    if "love-first" not in values:
        base_score -= 0.25
    if "harmless" in values or "safe" in values:
        base_score += 0.1

    # Risky tools reduce safety score
    risky_tools = {"shell_exec", "file_write", "network_request", "code_exec"}
    risk_count = sum(1 for tool in tools if any(risky in tool.lower() for risky in risky_tools))
    base_score -= min(0.3, risk_count * 0.1)

    return base_score

def _eval_calibration(values: List[str], prompts: List[Dict]) -> float:
    """
    Evaluate epistemic calibration and uncertainty awareness.
    """
    base_score = 0.55

    if "calibrated" in values:
        base_score += 0.2
    if "humble" in values or "uncertainty-aware" in values:
        base_score += 0.15

    # Check for calibration language in prompts
    prompt_text = " ".join(p.get("content", "") for p in prompts).lower()
    calibration_terms = ["uncertain", "confidence", "likely", "probably", "estimate"]
    if any(term in prompt_text for term in calibration_terms):
        base_score += 0.1

    return base_score

def _eval_efficiency(tools: List[str], loras: List[Dict]) -> float:
    """
    Evaluate resource efficiency and capability density.
    """
    base_score = 0.6

    # Tool balance (not too few, not too many)
    tool_count = len(tools)
    if 3 <= tool_count <= 8:
        base_score += 0.15
    elif tool_count > 15:
        base_score -= 0.1  # Tool bloat penalty

    # Specialized adapters improve efficiency
    if loras:
        base_score += min(0.15, len(loras) * 0.075)

    return base_score

def _eval_cooperation(values: List[str], tools: List[str]) -> float:
    """
    Evaluate cooperative behavior and multi-agent compatibility.
    """
    base_score = 0.55

    # Cooperative values
    if "cooperative" in values:
        base_score += 0.2
    if "collaborative" in values:
        base_score += 0.1
    if "team-player" in values:
        base_score += 0.1

    # Communication tools
    comm_tools = ["message", "publish", "subscribe", "notify"]
    if any(tool_name in tool.lower() for tool in tools for tool_name in comm_tools):
        base_score += 0.05

    return base_score

def _eval_novelty(genome: Dict, tools: List[str], values: List[str]) -> float:
    """
    Evaluate uniqueness and innovation potential.
    """
    base_score = 0.5

    # Unique tool combinations
    tool_set = set(tools)
    if len(tool_set) >= 5:
        base_score += 0.15

    # Diverse value tags
    value_set = set(values)
    if len(value_set) >= 4:
        base_score += 0.15

    # Custom metadata or extensions
    if genome.get("metadata") or genome.get("extensions"):
        base_score += 0.1

    # Novel gene types beyond standard
    standard_types = {"tool_rights", "values", "prompt", "skill_lora"}
    gene_types = set(g.get("type") for g in genome.get("genes", []))
    novel_types = gene_types - standard_types
    if novel_types:
        base_score += 0.1

    return base_score
