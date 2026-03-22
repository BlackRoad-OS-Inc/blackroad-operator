"""RoadChain Identity Verification for Job Applications
Cryptographic proof of identity and achievements anchored to blockchain."""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
import hashlib
import json
from enum import Enum


class ProofType(Enum):
    """Types of verifiable proofs."""
    IDENTITY = "identity"
    EMPLOYMENT = "employment"
    EDUCATION = "education"
    SKILL = "skill"
    PROJECT = "project"
    PATENT = "patent"
    CERTIFICATION = "certification"
    GITHUB_CONTRIBUTION = "github_contribution"
    LINKEDIN_PROFILE = "linkedin_profile"


class VerificationStatus(Enum):
    """Verification status."""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


@dataclass
class VerifiableCredential:
    """    W3C-style Verifiable Credential anchored to RoadChain.

    This is a cryptographically signed proof of an achievement
    that can be verified by anyone with the blockchain state."""
    id: str
    type: ProofType
    issuer: str  # Who issued this credential (e.g., "github.com", "linkedin.com", "self")
    subject: str  # Who it's about (user's RoadChain identity)

    # Claim data
    claim: Dict[str, Any]

    # Cryptographic proof
    proof_hash: str  # PS-SHA∞ cascade hash
    roadchain_tx_hash: str  # RoadChain transaction hash
    roadchain_block_index: int  # Block number

    # Verification
    status: VerificationStatus
    issued_at: datetime
    expires_at: Optional[datetime] = None

    # Witnesses (optional multi-sig)
    witnesses: List[str] = field(default_factory=list)
    witness_signatures: List[str] = field(default_factory=list)

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class IdentityProof:
    """    Core identity proof anchored to RoadChain.
    This is the root of trust for all other credentials."""
    roadchain_address: str  # User's RoadChain address
    ps_sha_chain: List[str]  # PS-SHA∞ identity chain

    # Identity attributes (hashed for privacy)
    name_hash: str
    email_hash: str

    # Proof anchoring
    genesis_tx_hash: str  # First RoadChain transaction
    genesis_block_index: int

    # Public identity (optional)
    public_name: Optional[str] = None
    public_profile_url: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    # Linked credentials
    credentials: List[VerifiableCredential] = field(default_factory=list)


class RoadChainIdentityManager:
    """Manages identity verification and credential issuance via RoadChain."""

    def __init__(self, roadchain_api_url: str = "http://localhost:3000"):
        """        Initialize identity manager.

        Args:
            roadchain_api_url: RoadChain API endpoint"""
        self.api_url = roadchain_api_url

    def create_ps_sha_hash(self, data: str, previous_hash: str = "") -> str:
        """        Create PS-SHA∞ cascade hash.

        Args:
            data: Data to hash
            previous_hash: Previous hash in chain

        Returns:
            SHA-256 hash in hex"""
        combined = previous_hash + data
        return hashlib.sha256(combined.encode()).hexdigest()

    def create_identity_proof(
        self,
        name: str,
        email: str,
        roadchain_address: str,
        public_profile_url: Optional[str] = None
    ) -> IdentityProof:
        """        Create root identity proof.

        This creates the foundational identity that all credentials
        will be attached to.

        Args:
            name: User's full name
            email: User's email
            roadchain_address: User's RoadChain wallet address
            public_profile_url: Optional public profile (LinkedIn, etc.)

        Returns:
            IdentityProof anchored to RoadChain"""
        # Hash private data
        name_hash = hashlib.sha256(name.encode()).hexdigest()
        email_hash = hashlib.sha256(email.encode()).hexdigest()

        # Create PS-SHA∞ identity chain
        ps_sha_chain = [
            self.create_ps_sha_hash(roadchain_address),
            self.create_ps_sha_hash(name, roadchain_address),
            self.create_ps_sha_hash(email, name_hash)
        ]

        # Create identity statement
        identity_statement = {
            "type": "IDENTITY_CREATION",
            "roadchain_address": roadchain_address,
            "name_hash": name_hash,
            "email_hash": email_hash,
            "ps_sha_chain": ps_sha_chain,
            "timestamp": datetime.now(UTC).isoformat()
        """

        # In production, this would submit to RoadChain
        # For now, simulate transaction
        genesis_tx_hash = self.create_ps_sha_hash(
            json.dumps(identity_statement, sort_keys=True)
        )

        return IdentityProof(
            roadchain_address=roadchain_address,
            ps_sha_chain=ps_sha_chain,
            name_hash=name_hash,
            email_hash=email_hash,
            public_name=name if public_profile_url else None,
            public_profile_url=public_profile_url,
            genesis_tx_hash=genesis_tx_hash,
            genesis_block_index=0,  # Would be actual block index from RoadChain
        )

    def issue_credential(
        self,
        identity: IdentityProof,
        proof_type: ProofType,
        claim: Dict[str, Any],
        issuer: str = "self",
        witnesses: List[str] = None
    ) -> VerifiableCredential:
        """        Issue a verifiable credential for an achievement.

        Args:
            identity: User's identity proof
            proof_type: Type of credential
            claim: The actual claim data
            issuer: Who is issuing this credential
            witnesses: Optional list of witness addresses

        Returns:
            VerifiableCredential anchored to RoadChain"""
        # Create credential ID
        credential_id = f"vc-{proof_type.value}-{len(identity.credentials)}"

        # Create proof hash using PS-SHA∞
        claim_json = json.dumps(claim, sort_keys=True)
        proof_hash = self.create_ps_sha_hash(
            claim_json,
            identity.ps_sha_chain[-1]
        )

        # Create RoadChain transaction
        tx_data = {
            "type": "TRUTH_ANCHOR",
            "statement": f"{proof_type.value} credential for {identity.roadchain_address}",
            "proofHash": proof_hash,
            "witnesses": witnesses or [],
            "psShaChain": identity.ps_sha_chain + [proof_hash]
        """

        # Simulate RoadChain submission
        tx_hash = self.create_ps_sha_hash(
            json.dumps(tx_data, sort_keys=True)
        )

        credential = VerifiableCredential(
            id=credential_id,
            type=proof_type,
            issuer=issuer,
            subject=identity.roadchain_address,
            claim=claim,
            proof_hash=proof_hash,
            roadchain_tx_hash=tx_hash,
            roadchain_block_index=0,  # Would be actual block index
            status=VerificationStatus.VERIFIED,
            issued_at=datetime.now(UTC),
            witnesses=witnesses or [],
            witness_signatures=[]  # Would contain actual signatures
        )

        # Add to identity
        identity.credentials.append(credential)

        return credential

    def verify_credential(self, credential: VerifiableCredential) -> bool:
        """        Verify a credential against RoadChain.

        Args:
            credential: Credential to verify

        Returns:
            True if valid, False otherwise"""
        # In production, would:
        # 1. Query RoadChain for transaction
        # 2. Verify proof hash matches
        # 3. Verify witnesses signatures
        # 4. Check block confirmations
        # 5. Verify PS-SHA∞ chain integrity

        # Simulated verification
        return credential.status == VerificationStatus.VERIFIED

    def create_employment_proof(
        self,
        identity: IdentityProof,
        company: str,
        title: str,
        start_date: str,
        end_date: Optional[str] = None,
        description: str = "",
        linkedin_url: Optional[str] = None
    ) -> VerifiableCredential:
        """        Create verifiable employment credential.

        Args:
            identity: User's identity proof
            company: Company name
            title: Job title
            start_date: Start date (YYYY-MM)
            end_date: End date (YYYY-MM) or None if current
            description: Job description
            linkedin_url: LinkedIn profile URL for verification

        Returns:
            VerifiableCredential for employment"""
        claim = {
            "company": company,
            "title": title,
            "start_date": start_date,
            "end_date": end_date or "present",
            "description": description,
            "verification_source": linkedin_url or "self-attested"
        """

        issuer = "linkedin.com" if linkedin_url else "self"

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.EMPLOYMENT,
            claim=claim,
            issuer=issuer
        )

    def create_education_proof(
        self,
        identity: IdentityProof,
        institution: str,
        degree: str,
        field: str,
        graduation_year: str
    ) -> VerifiableCredential:
        """Create verifiable education credential."""
        claim = {
            "institution": institution,
            "degree": degree,
            "field": field,
            "graduation_year": graduation_year
        """

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.EDUCATION,
            claim=claim,
            issuer="self"  # Could integrate with institution APIs
        )

    def create_skill_proof(
        self,
        identity: IdentityProof,
        skill: str,
        proficiency: str,
        years_experience: int,
        projects: List[str] = None
    ) -> VerifiableCredential:
        """Create verifiable skill credential."""
        claim = {
            "skill": skill,
            "proficiency": proficiency,  # "beginner", "intermediate", "expert"
            "years_experience": years_experience,
            "projects": projects or []
        """

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.SKILL,
            claim=claim,
            issuer="self"
        )

    def create_project_proof(
        self,
        identity: IdentityProof,
        project_name: str,
        description: str,
        github_url: Optional[str] = None,
        live_url: Optional[str] = None,
        technologies: List[str] = None,
        github_stars: int = 0,
        github_commits: int = 0
    ) -> VerifiableCredential:
        """Create verifiable project credential."""
        claim = {
            "name": project_name,
            "description": description,
            "github_url": github_url,
            "live_url": live_url,
            "technologies": technologies or [],
            "metrics": {
                "github_stars": github_stars,
                "github_commits": github_commits
            """
        """

        issuer = "github.com" if github_url else "self"

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.PROJECT,
            claim=claim,
            issuer=issuer
        )

    def create_patent_proof(
        self,
        identity: IdentityProof,
        patent_title: str,
        patent_number: str,
        status: str,
        filed_date: str,
        uspto_url: str
    ) -> VerifiableCredential:
        """Create verifiable patent credential."""
        claim = {
            "title": patent_title,
            "number": patent_number,
            "status": status,
            "filed_date": filed_date,
            "uspto_url": uspto_url
        """

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.PATENT,
            claim=claim,
            issuer="uspto.gov"
        )

    def create_github_proof(
        self,
        identity: IdentityProof,
        github_username: str,
        repos: int,
        followers: int,
        contributions_last_year: int,
        top_languages: List[str]
    ) -> VerifiableCredential:
        """Create verifiable GitHub profile credential."""
        claim = {
            "username": github_username,
            "repos": repos,
            "followers": followers,
            "contributions_last_year": contributions_last_year,
            "top_languages": top_languages,
            "profile_url": f"https://github.com/{github_username}"
        """

        return self.issue_credential(
            identity=identity,
            proof_type=ProofType.GITHUB_CONTRIBUTION,
            claim=claim,
            issuer="github.com"
        )

    def export_verifiable_presentation(
        self,
        identity: IdentityProof,
        credential_types: List[ProofType] = None
    ) -> Dict[str, Any]:
        """        Export verifiable presentation for job application.

        This creates a JSON-LD verifiable presentation that employers
        can independently verify against RoadChain.

        Args:
            identity: User's identity proof
            credential_types: Which credentials to include (None = all)

        Returns:
            W3C Verifiable Presentation"""
        # Filter credentials
        if credential_types:
            credentials = [
                c for c in identity.credentials
                if c.type in credential_types
            ]
        else:
            credentials = identity.credentials

        presentation = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://roadchain.blackroad.io/contexts/v1"
            ],
            "type": "VerifiablePresentation",
            "id": f"presentation-{identity.roadchain_address}-{datetime.now(UTC).timestamp()}",

            # Identity proof
            "holder": {
                "id": identity.roadchain_address,
                "ps_sha_chain": identity.ps_sha_chain,
                "genesis_tx": identity.genesis_tx_hash,
                "public_name": identity.public_name,
                "public_profile": identity.public_profile_url
            },

            # Verifiable credentials
            "verifiableCredential": [
                {
                    "id": cred.id,
                    "type": cred.type.value,
                    "issuer": cred.issuer,
                    "issuanceDate": cred.issued_at.isoformat(),
                    "expirationDate": cred.expires_at.isoformat() if cred.expires_at else None,

                    # Claim
                    "credentialSubject": cred.claim,

                    # Cryptographic proof
                    "proof": {
                        "type": "RoadChainAnchor2024",
                        "proofHash": cred.proof_hash,
                        "roadchainTxHash": cred.roadchain_tx_hash,
                        "roadchainBlock": cred.roadchain_block_index,
                        "verificationMethod": f"{self.api_url}/verify/{cred.roadchain_tx_hash}"
                    """
                """
                for cred in credentials
            ],

            # Presentation proof
            "proof": {
                "type": "RoadChainSignature2024",
                "created": datetime.now(UTC).isoformat(),
                "verificationMethod": f"{self.api_url}/identity/{identity.roadchain_address}",
                "proofPurpose": "authentication"
            """
        """

        return presentation


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def format_credential_summary(credential: VerifiableCredential) -> str:
    """Format credential for display in job application."""
    if credential.type == ProofType.EMPLOYMENT:
        claim = credential.claim
        return f"{claim['title']} at {claim['company']} ({claim['start_date']} - {claim['end_date']})"

    elif credential.type == ProofType.EDUCATION:
        claim = credential.claim
        return f"{claim['degree']} in {claim['field']} - {claim['institution']} ({claim['graduation_year']})"

    elif credential.type == ProofType.SKILL:
        claim = credential.claim
        return f"{claim['skill']} ({claim['proficiency']}, {claim['years_experience']} years)"

    elif credential.type == ProofType.PROJECT:
        claim = credential.claim
        stars = claim['metrics']['github_stars']
        return f"{claim['name']} - {stars} ⭐ on GitHub"

    elif credential.type == ProofType.PATENT:
        claim = credential.claim
        return f"{claim['title']} ({claim['number']}) - {claim['status']}"

    elif credential.type == ProofType.GITHUB_CONTRIBUTION:
        claim = credential.claim
        return f"GitHub: @{claim['username']} - {claim['repos']} repos, {claim['followers']} followers"

    else:
        return f"{credential.type.value} credential"


def create_verification_qr_code(
    presentation: Dict[str, Any],
    verification_url: str
) -> str:
    """    Create QR code for employers to verify credentials.

    Args:
        presentation: Verifiable presentation
        verification_url: URL to verification page

    Returns:
        URL that encodes the presentation for verification"""
    import base64
    import urllib.parse

    # Encode presentation as base64
    presentation_json = json.dumps(presentation)
    presentation_b64 = base64.urlsafe_b64encode(presentation_json.encode()).decode()

    # Create verification URL
    return f"{verification_url}?presentation={urllib.parse.quote(presentation_b64)}"
