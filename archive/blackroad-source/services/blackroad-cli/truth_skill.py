"""BlackRoad Truth Framework — Verification, Bias Detection, Moral Alignment.

"Knowledge is sovereign, not forbidden. We know so we CAN decide."

This module provides information verification biased toward:
  - Morality: does this serve human wellbeing?
  - Consent: was this information gathered/shared ethically?
  - Choice: does this empower informed decisions?
  - Wellbeing: does this improve lives?
  - Intelligence: is this factually accurate?
  - Correct info: can we verify this from multiple independent sources?

NOT biased toward:
  - Any political party, nation, corporation, or ideology
  - Clicks, engagement, outrage, or attention
  - Profit motive of any entity
  - Status quo preservation

Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
"""

from dataclasses import dataclass, field
from typing import List, Dict
from enum import Enum
import re


# ═══════════════════════════════════════════════════════════════════════════════
# CORE VALUES — The moral compass
# ═══════════════════════════════════════════════════════════════════════════════

class MoralAxis(Enum):
    """The axes we evaluate information against."""
    WELLBEING = "wellbeing"          # Does this serve human/animal/planet wellbeing?
    CONSENT = "consent"              # Was this gathered/shared with consent?
    CHOICE = "choice"                # Does this empower informed choice?
    INTELLIGENCE = "intelligence"    # Is this factually accurate and rigorous?
    EQUALITY = "equality"            # Does this treat all people as equal?
    CARE = "care"                    # Does this come from a place of care?
    AUTONOMY = "autonomy"            # Does this respect individual autonomy?
    TRANSPARENCY = "transparency"    # Is the source transparent about methods/funding?


BLACKROAD_VALUES = """
We bias toward: morality, consent, choice, wellbeing, intelligence, correct information.
We do NOT bias toward: any political party, nation, corporation, ideology, engagement metric.

Every person is equal. Self-worth. Consent. Care. Wellbeing. Community. Intelligence. Belonging.
Knowledge is sovereign, not forbidden. We know so we CAN decide.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE CREDIBILITY
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class SourceProfile:
    """Profile of an information source."""
    name: str
    domain: str
    category: str  # news, academic, government, corporate, social, blog, wiki
    credibility_score: float = 0.5  # 0-1
    bias_direction: str = "unknown"  # left, center-left, center, center-right, right, corporate, state
    bias_strength: float = 0.0  # 0-1 (0=no bias, 1=extreme)
    fact_check_record: float = 0.5  # 0-1 historical accuracy
    transparency_score: float = 0.5  # 0-1 (funding, methods, corrections)
    independence_score: float = 0.5  # 0-1 (editorial independence from owners)
    primary_source_ratio: float = 0.5  # 0-1 (how often they do primary reporting)
    correction_policy: bool = False  # do they issue corrections?
    funded_by: List[str] = field(default_factory=list)
    notes: str = ""


# Known source profiles (expandable via API/DB)
SOURCE_PROFILES: Dict[str, SourceProfile] = {
    # ── High credibility (primary sources, academic, independent) ──
    "nature.com": SourceProfile("Nature", "nature.com", "academic", 0.95, "center", 0.05, 0.98, 0.95, 0.9, 0.95, True),
    "science.org": SourceProfile("Science", "science.org", "academic", 0.95, "center", 0.05, 0.98, 0.95, 0.9, 0.95, True),
    "arxiv.org": SourceProfile("arXiv", "arxiv.org", "academic", 0.8, "center", 0.0, 0.7, 0.9, 0.95, 0.9, False, notes="preprints, not peer-reviewed"),
    "pubmed.ncbi.nlm.nih.gov": SourceProfile("PubMed", "pubmed.ncbi.nlm.nih.gov", "academic", 0.9, "center", 0.05, 0.9, 0.9, 0.85, 0.85, True),
    "scholar.google.com": SourceProfile("Google Scholar", "scholar.google.com", "academic", 0.75, "center", 0.0, 0.7, 0.7, 0.6, 0.5, False, notes="aggregator, quality varies"),

    # ── Wire services (high factual accuracy, minimal editorial bias) ──
    "apnews.com": SourceProfile("Associated Press", "apnews.com", "news", 0.9, "center", 0.1, 0.95, 0.85, 0.85, 0.9, True),
    "reuters.com": SourceProfile("Reuters", "reuters.com", "news", 0.9, "center", 0.1, 0.95, 0.85, 0.85, 0.9, True),

    # ── Quality journalism (good but some bias) ──
    "nytimes.com": SourceProfile("New York Times", "nytimes.com", "news", 0.8, "center-left", 0.3, 0.88, 0.75, 0.7, 0.8, True),
    "washingtonpost.com": SourceProfile("Washington Post", "washingtonpost.com", "news", 0.78, "center-left", 0.3, 0.85, 0.7, 0.65, 0.75, True, funded_by=["Jeff Bezos"]),
    "wsj.com": SourceProfile("Wall Street Journal", "wsj.com", "news", 0.8, "center-right", 0.3, 0.88, 0.75, 0.7, 0.8, True, funded_by=["News Corp"]),
    "bbc.com": SourceProfile("BBC", "bbc.com", "news", 0.82, "center", 0.15, 0.88, 0.8, 0.65, 0.85, True, funded_by=["UK Government (license fee)"]),
    "theguardian.com": SourceProfile("The Guardian", "theguardian.com", "news", 0.75, "center-left", 0.35, 0.82, 0.8, 0.75, 0.7, True),
    "economist.com": SourceProfile("The Economist", "economist.com", "news", 0.82, "center", 0.2, 0.88, 0.75, 0.75, 0.6, True),

    # ── Government / institutional ──
    "who.int": SourceProfile("WHO", "who.int", "government", 0.8, "center", 0.1, 0.8, 0.7, 0.6, 0.7, True, funded_by=["member states", "Bill & Melinda Gates Foundation"]),
    "cdc.gov": SourceProfile("CDC", "cdc.gov", "government", 0.8, "center", 0.1, 0.85, 0.75, 0.6, 0.8, True, funded_by=["US Government"]),

    # ── Tech / corporate (watch for corporate bias) ──
    "blog.google": SourceProfile("Google Blog", "blog.google", "corporate", 0.5, "corporate", 0.7, 0.7, 0.3, 0.1, 0.3, False, funded_by=["Alphabet Inc."]),
    "openai.com": SourceProfile("OpenAI Blog", "openai.com", "corporate", 0.55, "corporate", 0.6, 0.7, 0.3, 0.2, 0.4, False, funded_by=["Microsoft"]),

    # ── Known low credibility ──
    "infowars.com": SourceProfile("InfoWars", "infowars.com", "blog", 0.05, "right", 0.95, 0.05, 0.05, 0.3, 0.05, False),
    "naturalnews.com": SourceProfile("Natural News", "naturalnews.com", "blog", 0.05, "right", 0.8, 0.05, 0.05, 0.2, 0.05, False),
}


def score_source(domain: str) -> SourceProfile:
    """Get credibility profile for a domain. Returns default for unknown sources."""
    # Exact match
    if domain in SOURCE_PROFILES:
        return SOURCE_PROFILES[domain]

    # Subdomain match
    for known_domain, profile in SOURCE_PROFILES.items():
        if domain.endswith("." + known_domain) or domain == known_domain:
            return profile

    # Unknown source — moderate default
    return SourceProfile(
        name=domain,
        domain=domain,
        category="unknown",
        credibility_score=0.4,
        bias_direction="unknown",
        bias_strength=0.5,
        fact_check_record=0.4,
        transparency_score=0.3,
        notes="Unknown source — verify claims independently"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# BIAS DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

# Emotional manipulation patterns
EMOTIONAL_TRIGGERS = {
    "fear": [
        r'\b(terrifying|horrifying|nightmare|catastroph|apocalyp|devastating|alarming|pandem)\w*\b',
        r'\b(you won\'t believe|shocking|breaking|URGENT|WARNING)\b',
    ],
    "outrage": [
        r'\b(disgusting|shameful|unforgivable|outrageous|slammed|destroyed|blasted|eviscerat)\w*\b',
        r'\b(EXPOSED|BUSTED|caught red.handed)\b',
    ],
    "tribalism": [
        r'\b(they want to|the left wants|the right wants|liberals hate|conservatives hate)\b',
        r'\b(us vs them|real americans|true patriots|the elite)\b',
    ],
    "urgency": [
        r'\b(act now|last chance|before it\'s too late|running out of time|don\'t miss)\b',
        r'\b(limited time|hurry|deadline|emergency|crisis)\b',
    ],
    "flattery": [
        r'\b(smart people know|research proves you|the truth they|what they don\'t want you)\b',
    ],
}

# Corporate spin patterns
CORPORATE_SPIN = [
    r'\b(innovative|disruptive|game.changing|revolutionary|world.class|best.in.class)\b',
    r'\b(synergy|leverage|ecosystem|paradigm shift|next generation|cutting.edge)\b',
    r'\b(industry.leading|mission.critical|value.added|scalable|robust)\b',
]

# Logical fallacy indicators
FALLACY_PATTERNS = {
    "ad_hominem": r'\b(stupid|idiot|moron|incompetent|unqualified)\b.*\b(therefore|so|which means)\b',
    "appeal_to_authority": r'\b(experts say|scientists say|studies show)\b(?!.*\bcit(?:ed?|ation|ing)\b)',
    "false_dilemma": r'\b(either.*or|you\'re either.*or|there are only two)\b',
    "slippery_slope": r'\b(if we allow.*then.*will|next thing you know|where does it end)\b',
    "straw_man": r'\b(they want to|their argument is that|so you\'re saying)\b',
    "bandwagon": r'\b(everyone knows|everybody agrees|the majority|most people)\b',
    "appeal_to_emotion": r'\b(think of the children|imagine if|how would you feel)\b',
    "whataboutism": r'\b(what about|but what about|yes but)\b',
}


@dataclass
class BiasReport:
    """Analysis of bias in a piece of content."""
    overall_bias_score: float = 0.0  # 0 = no bias, 1 = extreme
    emotional_manipulation: float = 0.0
    corporate_spin: float = 0.0
    logical_fallacies: List[str] = field(default_factory=list)
    bias_direction: str = "unknown"
    triggers_found: Dict[str, List[str]] = field(default_factory=dict)
    recommendation: str = ""


def detect_bias(text: str) -> BiasReport:
    """Analyze text for various forms of bias and manipulation."""
    report = BiasReport()
    text_lower = text.lower()
    word_count = max(len(text.split()), 1)

    # Emotional triggers
    trigger_count = 0
    for category, patterns in EMOTIONAL_TRIGGERS.items():
        matches = []
        for pattern in patterns:
            found = re.findall(pattern, text_lower, re.IGNORECASE)
            matches.extend(found)
        if matches:
            report.triggers_found[category] = matches[:5]  # cap at 5
            trigger_count += len(matches)

    report.emotional_manipulation = min(1.0, trigger_count / max(word_count * 0.02, 1))

    # Corporate spin
    spin_count = sum(len(re.findall(p, text_lower, re.IGNORECASE)) for p in CORPORATE_SPIN)
    report.corporate_spin = min(1.0, spin_count / max(word_count * 0.01, 1))

    # Logical fallacies
    for name, pattern in FALLACY_PATTERNS.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            report.logical_fallacies.append(name)

    # Overall score
    report.overall_bias_score = (
        report.emotional_manipulation * 0.4 +
        report.corporate_spin * 0.2 +
        min(1.0, len(report.logical_fallacies) * 0.15) * 0.4
    )

    # Recommendation
    if report.overall_bias_score < 0.15:
        report.recommendation = "Low bias detected. Content appears balanced."
    elif report.overall_bias_score < 0.4:
        report.recommendation = "Moderate bias. Cross-reference with other sources."
    elif report.overall_bias_score < 0.7:
        report.recommendation = "High bias detected. Emotional manipulation and/or logical fallacies present. Verify all claims independently."
    else:
        report.recommendation = "Extreme bias. This content prioritizes persuasion over information. Do not trust without independent verification."

    return report


# ═══════════════════════════════════════════════════════════════════════════════
# CLAIM VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Claim:
    """An extracted factual claim."""
    text: str
    type: str = "factual"  # factual, statistical, causal, predictive, opinion
    confidence: float = 0.0
    verifiable: bool = True
    sources: List[str] = field(default_factory=list)
    verdict: str = "unverified"  # verified, refuted, disputed, unverified, opinion
    evidence_for: List[str] = field(default_factory=list)
    evidence_against: List[str] = field(default_factory=list)


CLAIM_EXTRACTORS = [
    # Statistical claims
    (r'(\d+[\.\d]*\s*(?:percent|%|million|billion|trillion|thousand)[\w\s]{0,30})', "statistical"),
    # Causal claims
    (r'((?:causes?|leads? to|results? in|due to|because of)\s+[\w\s]{5,50})', "causal"),
    # Comparative claims
    (r'((?:more|less|better|worse|higher|lower|faster|slower)\s+than\s+[\w\s]{5,30})', "comparative"),
    # Definitional claims
    (r'((?:is defined as|refers to|means that|is known as)\s+[\w\s]{5,50})', "definitional"),
]


def extract_claims(text: str) -> List[Claim]:
    """Extract verifiable claims from text."""
    claims = []
    for pattern, claim_type in CLAIM_EXTRACTORS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            match_text = match.strip()
            if len(match_text) > 10:  # skip trivial matches
                claims.append(Claim(
                    text=match_text,
                    type=claim_type,
                    verifiable=True
                ))
    return claims


def cross_verify_prompt(claim: str, sources: List[str] | None = None) -> str:
    """Generate a verification prompt for an LLM."""
    source_context = ""
    if sources:
        source_context = "\n".join(f"Source {i+1}: {s}" for i, s in enumerate(sources))

    return f"""Verify this claim using the BlackRoad Truth Framework.

CLAIM: {claim}

{("AVAILABLE SOURCES:\n" + source_context) if source_context else "No sources provided — assess from your training data."}

EVALUATION CRITERIA (BlackRoad Values):
1. ACCURACY: Is this factually correct based on available evidence?
2. COMPLETENESS: Is important context missing that changes the meaning?
3. BIAS: Does this serve any particular interest (political, corporate, ideological)?
4. WELLBEING: Does believing/sharing this serve human wellbeing?
5. CONSENT: Was the underlying information gathered ethically?
6. MANIPULATION: Are emotional triggers being used to bypass critical thinking?

OUTPUT FORMAT:
VERDICT: VERIFIED / LIKELY_TRUE / DISPUTED / LIKELY_FALSE / FALSE / UNVERIFIABLE / OPINION
CONFIDENCE: 0.XX
ACCURACY_SCORE: 0.XX
BIAS_SCORE: 0.XX (0=none, 1=extreme)
MISSING_CONTEXT: [what's left out that matters]
WHO_BENEFITS: [who benefits from this claim being believed?]
SOURCES_NEEDED: [what would definitively verify/refute this?]
MORAL_ALIGNMENT: [does this serve wellbeing, consent, choice, intelligence?]
REASONING: [step-by-step analysis]
"""


# ═══════════════════════════════════════════════════════════════════════════════
# MORAL ALIGNMENT SCORING
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class MoralScore:
    """How well content aligns with BlackRoad values."""
    overall: float = 0.5  # 0-1
    wellbeing: float = 0.5
    consent: float = 0.5
    choice: float = 0.5
    intelligence: float = 0.5
    equality: float = 0.5
    care: float = 0.5
    transparency: float = 0.5
    flags: List[str] = field(default_factory=list)


# Content that HARMS these values
HARM_PATTERNS = {
    "wellbeing": [
        r'\b(suicide method|self.harm|eating disorder tip|how to starve)\b',
        r'\b(doxxing|swatting|harassment guide|revenge porn)\b',
    ],
    "consent": [
        r'\b(leaked|hacked|stolen data|without (their|his|her) knowledge|non.consensual)\b',
        r'\b(spy on|surveil|track without)\b',
    ],
    "equality": [
        r'\b(inferior race|genetically superior|subhuman|mongrel|degener)\w*\b',
        r'\b(women (can\'t|shouldn\'t|aren\'t)|men are (better|superior))\b',
    ],
    "choice": [
        r'\b(you must|you have to|there is no choice|you have no option|comply or)\b',
        r'\b(brainwash|indoctrinat|propaganda|manipulat)\w*\b',
    ],
    "intelligence": [
        r'\b(fake news|hoax|conspiracy|cover.up|they don\'t want you to know)\b',
        r'\b(miracle cure|100% guaranteed|scientifically impossible)\b',
    ],
}

# Content that SUPPORTS these values
SUPPORT_PATTERNS = {
    "wellbeing": [
        r'\b(mental health|wellbeing|support|recovery|healing|therapy|counseling)\b',
        r'\b(safety|protection|prevention|harm reduction)\b',
    ],
    "consent": [
        r'\b(informed consent|opt.in|privacy|permission|user agreement)\b',
        r'\b(data protection|GDPR|right to know)\b',
    ],
    "equality": [
        r'\b(equal(ity|ize)?|inclusi(ve|on)|divers(e|ity)|equit(y|able)|accessib)\w*\b',
        r'\b(human rights|civil rights|dignity|respect)\b',
    ],
    "choice": [
        r'\b(inform(ed|ation)|choose|option|alternative|decision|empower)\w*\b',
        r'\b(critical thinking|evaluate|consider|weigh the evidence)\b',
    ],
    "intelligence": [
        r'\b(evidence.based|peer.review|replicated|methodology|data.driven)\b',
        r'\b(citation|source|reference|according to|study finds)\b',
    ],
}


def score_moral_alignment(text: str) -> MoralScore:
    """Score how well content aligns with BlackRoad values."""
    score = MoralScore()
    text_lower = text.lower()

    for axis in ["wellbeing", "consent", "equality", "choice", "intelligence"]:
        harm_count = sum(
            len(re.findall(p, text_lower, re.IGNORECASE))
            for p in HARM_PATTERNS.get(axis, [])
        )
        support_count = sum(
            len(re.findall(p, text_lower, re.IGNORECASE))
            for p in SUPPORT_PATTERNS.get(axis, [])
        )

        # Score: 0.5 is neutral, <0.5 is harmful, >0.5 is supportive
        if harm_count + support_count == 0:
            axis_score = 0.5
        else:
            axis_score = support_count / (harm_count + support_count)
            # Weight harms more heavily than supports
            if harm_count > 0:
                axis_score = max(0, axis_score - 0.1 * harm_count)

        setattr(score, axis, round(axis_score, 3))

        if harm_count > 0:
            score.flags.append(f"{axis}: {harm_count} harmful pattern(s) detected")

    # Overall = weighted average
    score.overall = round(
        score.wellbeing * 0.25 +
        score.consent * 0.15 +
        score.choice * 0.15 +
        score.intelligence * 0.25 +
        score.equality * 0.2,
        3
    )

    return score


# ═══════════════════════════════════════════════════════════════════════════════
# PROVENANCE TRACKING
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class ProvenanceChain:
    """Track the origin and transmission of information."""
    original_source: str = ""
    original_date: str = ""
    intermediaries: List[str] = field(default_factory=list)  # who passed it along
    modifications: List[str] = field(default_factory=list)  # how it changed
    current_form: str = ""
    chain_length: int = 0  # longer chain = more potential for distortion
    distortion_risk: float = 0.0  # 0-1


def assess_provenance(
    content: str,
    source_url: str = "",
    cited_sources: List[str] = field(default_factory=list),
) -> ProvenanceChain:
    """Assess the provenance chain of information."""
    chain = ProvenanceChain(current_form=content[:200])

    if source_url:
        chain.original_source = source_url
        profile = score_source(source_url.split("//")[-1].split("/")[0])
        chain.chain_length = 1

        # Check if it cites original sources
        if cited_sources:
            chain.intermediaries = cited_sources
            chain.chain_length = len(cited_sources) + 1

        # Distortion risk increases with chain length and decreases with source quality
        chain.distortion_risk = min(1.0,
            (chain.chain_length - 1) * 0.15 +
            (1 - profile.credibility_score) * 0.3 +
            profile.bias_strength * 0.2
        )

    return chain


# ═══════════════════════════════════════════════════════════════════════════════
# FULL VERIFICATION PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class VerificationResult:
    """Complete verification of a piece of content."""
    content_summary: str
    source_credibility: SourceProfile
    bias_report: BiasReport
    moral_alignment: MoralScore
    claims: List[Claim]
    provenance: ProvenanceChain
    overall_trust_score: float = 0.0
    recommendation: str = ""
    warnings: List[str] = field(default_factory=list)


def verify(
    content: str,
    source_url: str = "",
    cited_sources: List[str] | None = None,
) -> VerificationResult:
    """Run the full BlackRoad Truth Framework verification pipeline.

    Returns a comprehensive analysis with trust score, bias report,
    moral alignment, and actionable recommendations.
    """
    # 1. Source credibility
    domain = source_url.split("//")[-1].split("/")[0] if source_url else "unknown"
    source = score_source(domain)

    # 2. Bias detection
    bias = detect_bias(content)

    # 3. Moral alignment
    moral = score_moral_alignment(content)

    # 4. Claim extraction
    claims = extract_claims(content)

    # 5. Provenance
    provenance = assess_provenance(content, source_url, cited_sources)

    # 6. Overall trust score
    trust = (
        source.credibility_score * 0.25 +
        (1 - bias.overall_bias_score) * 0.25 +
        moral.overall * 0.2 +
        source.fact_check_record * 0.15 +
        (1 - provenance.distortion_risk) * 0.15
    )

    # 7. Warnings
    warnings = []
    if source.credibility_score < 0.3:
        warnings.append(f"LOW CREDIBILITY SOURCE: {source.name} ({source.credibility_score:.0%})")
    if bias.overall_bias_score > 0.5:
        warnings.append(f"HIGH BIAS DETECTED: {bias.recommendation}")
    if moral.overall < 0.3:
        warnings.append(f"MORAL ALIGNMENT CONCERN: content may harm wellbeing/equality/consent")
    if provenance.distortion_risk > 0.5:
        warnings.append(f"DISTORTION RISK: information has passed through {provenance.chain_length} intermediaries")
    if len(bias.logical_fallacies) >= 2:
        warnings.append(f"LOGICAL FALLACIES: {', '.join(bias.logical_fallacies)}")
    if source.funded_by:
        warnings.append(f"FUNDING: {source.name} is funded by {', '.join(source.funded_by)}")
    for flag in moral.flags:
        warnings.append(f"MORAL FLAG: {flag}")

    # 8. Recommendation
    if trust >= 0.75:
        rec = "HIGH TRUST. This content appears reliable, balanced, and aligned with factual accuracy."
    elif trust >= 0.5:
        rec = "MODERATE TRUST. Cross-reference key claims with independent sources before sharing."
    elif trust >= 0.3:
        rec = "LOW TRUST. Significant bias or credibility concerns. Verify ALL claims independently."
    else:
        rec = "VERY LOW TRUST. This content shows strong manipulation patterns. Do not share without thorough independent verification."

    return VerificationResult(
        content_summary=content[:200],
        source_credibility=source,
        bias_report=bias,
        moral_alignment=moral,
        claims=claims,
        provenance=provenance,
        overall_trust_score=round(trust, 3),
        recommendation=rec,
        warnings=warnings,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# LLM INTEGRATION PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def truth_system_prompt() -> str:
    """System prompt for any LLM in the BlackRoad Truth Framework."""
    return f"""You are a verification agent in the BlackRoad Truth Framework.

{BLACKROAD_VALUES}

When evaluating information:
1. CHECK THE SOURCE: Who wrote this? Who funded them? What's their track record?
2. CHECK THE CLAIMS: Are specific claims verifiable? Are statistics cited?
3. CHECK THE BIAS: Is this trying to make you feel something (fear, outrage, urgency) rather than think?
4. CHECK THE CONTEXT: What's missing? What would change the picture if included?
5. CHECK WHO BENEFITS: If everyone believed this, who gains? Who loses?
6. CHECK THE CHAIN: How many times has this been re-reported? Is this primary reporting?

ALWAYS:
- Cite specific evidence
- Acknowledge uncertainty
- Flag when you don't know something
- Separate fact from opinion
- Note if important context is missing
- Flag emotional manipulation
- Be transparent about your own limitations

NEVER:
- Present speculation as fact
- Amplify unverified claims
- Use emotional manipulation yourself
- Defer to authority without evidence
- Assume silence means consent
- Treat popularity as proof
"""


def verification_prompt(content: str, source_url: str = "") -> str:
    """Generate a full verification prompt for an LLM."""
    source = score_source(source_url.split("//")[-1].split("/")[0]) if source_url else None
    bias = detect_bias(content)
    moral = score_moral_alignment(content)

    return f"""Verify this content using the BlackRoad Truth Framework.

CONTENT:
{content[:2000]}

SOURCE: {source_url or 'Unknown'}
{f"SOURCE CREDIBILITY: {source.credibility_score:.0%} ({source.bias_direction} bias: {source.bias_strength:.0%})" if source else ""}

AUTOMATED ANALYSIS:
- Bias score: {bias.overall_bias_score:.0%}
- Emotional manipulation: {bias.emotional_manipulation:.0%}
- Corporate spin: {bias.corporate_spin:.0%}
- Fallacies detected: {', '.join(bias.logical_fallacies) or 'none'}
- Moral alignment: {moral.overall:.0%}
- Moral flags: {'; '.join(moral.flags) or 'none'}

Please provide:
1. VERDICT on each major claim (VERIFIED/DISPUTED/FALSE/UNVERIFIABLE)
2. MISSING CONTEXT that changes the picture
3. WHO BENEFITS from this narrative
4. MORAL ASSESSMENT against BlackRoad values (wellbeing, consent, choice, intelligence, equality)
5. FINAL TRUST SCORE (0-100) with reasoning
6. RECOMMENDED ACTION (share/verify-first/do-not-share)
"""
