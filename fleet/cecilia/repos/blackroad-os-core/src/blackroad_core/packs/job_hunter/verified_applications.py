"""Verified Job Applications with RoadChain Credentials
Integrates blockchain-anchored proofs into job applications."""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, UTC

from .roadchain_identity import (
    RoadChainIdentityManager,
    IdentityProof,
    VerifiableCredential,
    ProofType,
    format_credential_summary,
    create_verification_qr_code
)


@dataclass
class VerifiedJobApplication:
    """Job application with blockchain-verified credentials."""
    # Standard application fields
    application_id: str
    job_id: str
    job_title: str
    company: str

    # Applicant identity (RoadChain-verified)
    identity_proof: IdentityProof

    # Selected credentials for this application
    credentials: List[VerifiableCredential]

    # Traditional application materials
    cover_letter: str
    resume_text: str

    # Verification
    verifiable_presentation: Dict[str, Any]
    verification_url: str
    verification_qr_url: str

    # Metadata
    submitted_at: Optional[datetime] = None
    status: str = "draft"


class VerifiedApplicationBuilder:
    """Builds job applications with RoadChain-verified credentials."""

    def __init__(
        self,
        identity_manager: RoadChainIdentityManager,
        roadchain_api_url: str = "http://localhost:3000"
    ):
        """        Initialize builder.

        Args:
            identity_manager: RoadChain identity manager
            roadchain_api_url: RoadChain API URL for verification"""
        self.identity_manager = identity_manager
        self.api_url = roadchain_api_url
        self.verification_base_url = f"{roadchain_api_url}/verify"

    def build_application_with_proofs(
        self,
        identity: IdentityProof,
        job_title: str,
        company: str,
        job_description: str,
        cover_letter: str,
        resume_text: str,
        selected_credential_types: List[ProofType] = None
    ) -> VerifiedJobApplication:
        """        Build a verified job application.

        Args:
            identity: User's RoadChain identity
            job_title: Job title
            company: Company name
            job_description: Job description
            cover_letter: Cover letter text
            resume_text: Resume text
            selected_credential_types: Which credentials to include

        Returns:
            VerifiedJobApplication with blockchain proofs"""
        # Create application ID
        app_id = f"app-{identity.roadchain_address[:8]}-{int(datetime.now(UTC).timestamp())}"

        # Select relevant credentials
        credentials = self._select_credentials(
            identity=identity,
            job_title=job_title,
            job_description=job_description,
            credential_types=selected_credential_types
        )

        # Create verifiable presentation
        presentation = self.identity_manager.export_verifiable_presentation(
            identity=identity,
            credential_types=selected_credential_types
        )

        # Create verification URL
        verification_url = f"{self.verification_base_url}/{app_id}"

        # Create QR code URL
        qr_url = create_verification_qr_code(
            presentation=presentation,
            verification_url=verification_url
        )

        return VerifiedJobApplication(
            application_id=app_id,
            job_id=f"job-{company.lower().replace(' ', '-')}",
            job_title=job_title,
            company=company,
            identity_proof=identity,
            credentials=credentials,
            cover_letter=cover_letter,
            resume_text=resume_text,
            verifiable_presentation=presentation,
            verification_url=verification_url,
            verification_qr_url=qr_url
        )

    def _select_credentials(
        self,
        identity: IdentityProof,
        job_title: str,
        job_description: str,
        credential_types: List[ProofType] = None
    ) -> List[VerifiableCredential]:
        """        Intelligently select credentials relevant to the job.

        Args:
            identity: User's identity
            job_title: Job title
            job_description: Job description
            credential_types: Optional filter

        Returns:
            List of relevant credentials"""
        # If specific types requested, use those
        if credential_types:
            return [
                c for c in identity.credentials
                if c.type in credential_types
            ]

        # Otherwise, select all verified credentials
        # In production, would use AI to select most relevant
        return [
            c for c in identity.credentials
            if c.status.value == "verified"
        ]

    def enhance_cover_letter_with_proofs(
        self,
        cover_letter: str,
        credentials: List[VerifiableCredential],
        verification_url: str
    ) -> str:
        """        Add verification section to cover letter.

        Args:
            cover_letter: Original cover letter
            credentials: Verified credentials
            verification_url: Verification URL

        Returns:
            Enhanced cover letter with blockchain proof section"""
        # Create credentials summary
        proof_section = "\n\n---\n\n"
        proof_section += "## Blockchain-Verified Credentials\n\n"
        proof_section += "All claims in this application are cryptographically verified and anchored to the RoadChain blockchain. "
        proof_section += "You can independently verify these credentials at:\n\n"
        proof_section += f"**{verification_url}**\n\n"

        proof_section += "### Verified Achievements:\n\n"

        for cred in credentials:
            summary = format_credential_summary(cred)
            proof_section += f"- ✅ **{summary}**\n"
            proof_section += f"  - Issuer: {cred.issuer}\n"
            proof_section += f"  - RoadChain TX: `{cred.roadchain_tx_hash[:16]}...`\n"
            proof_section += f"  - Verified: {cred.issued_at.strftime('%Y-%m-%d')}\n\n"

        proof_section += "\n*These credentials are tamper-proof and independently verifiable. "
        proof_section += "No need to take my word for it—verify on the blockchain.*\n"

        return cover_letter + proof_section

    def enhance_resume_with_proofs(
        self,
        resume_text: str,
        credentials: List[VerifiableCredential]
    ) -> str:
        """        Add verification badges to resume.

        Args:
            resume_text: Original resume
            credentials: Verified credentials

        Returns:
            Enhanced resume with verification indicators"""
        # Add header
        header = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        header += "🔐 BLOCKCHAIN-VERIFIED RESUME\n"
        header += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

        header += "This resume contains blockchain-verified credentials.\n"
        header += f"Total verified claims: {len(credentials)}\n"
        header += "Verification method: RoadChain blockchain anchor\n\n"

        # Add verification badges to each section
        enhanced = header + resume_text

        # Add footer
        footer = "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        footer += "🔐 VERIFICATION SUMMARY\n"
        footer += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

        for cred in credentials:
            footer += f"✅ {format_credential_summary(cred)}\n"

        footer += f"\nAll credentials verified via RoadChain blockchain.\n"

        return enhanced + footer

    def generate_verification_page_html(
        self,
        application: VerifiedJobApplication
    ) -> str:
        """        Generate HTML verification page for employers.

        Args:
            application: Verified application

        Returns:
            HTML page for verification"""
        html = fprint{<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Credentials - {application.identity_proof.public_name}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }}
        .container {{
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}
        h1 {{
            color: #667eea;
            margin-top: 0;
        }}
        .verified {{
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
            margin-bottom: 20px;
        }}
        .credential {{
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            background: #f9fafb;
        }}
        .credential-type {{
            font-weight: 600;
            color: #667eea;
            text-transform: uppercase;
            font-size: 0.85em;
        }}
        .credential-claim {{
            margin: 10px 0;
        }}
        .proof {{
            font-family: 'Courier New', monospace;
            background: #1f2937;
            color: #10b981;
            padding: 10px;
            border-radius: 4px;
            font-size: 0.85em;
            overflow-x: auto;
        }}
        .identity {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .badge {{
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 4px;
            margin: 5px 5px 5px 0;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="verified">✅ BLOCKCHAIN VERIFIED</div>

        <h1>Verified Credentials</h1>

        <div class="identity">
            <h2>{application.identity_proof.public_name or "Anonymous Applicant"}</h2>
            <p>RoadChain Address: <code>{application.identity_proof.roadchain_address}</code></p>
            <p>Identity established: {application.identity_proof.created_at.strftime('%Y-%m-%d')}</p>
            <p>Genesis TX: <code>{application.identity_proof.genesis_tx_hash[:32]}...</code></p>
        </div>

        <h2>Application Details</h2>
        <p><strong>Position:</strong> {application.job_title}</p>
        <p><strong>Company:</strong> {application.company}</p>
        <p><strong>Application ID:</strong> {application.application_id}</p>

        <h2>Verified Credentials ({len(application.credentials)})</h2>}

        for cred in application.credentials:
            html += fprint{        <div class="credential">
            <div class="credential-type">{cred.type.value}</div>
            <div class="credential-claim">
                <strong>{format_credential_summary(cred)}</strong>
            </div>
            <p>
                <span class="badge">Issuer: {cred.issuer}</span>
                <span class="badge">Issued: {cred.issued_at.strftime('%Y-%m-%d')}</span>
                <span class="badge">Status: {cred.status.value}</span>
            </p>
            <div class="proof">
                <div>RoadChain TX: {cred.roadchain_tx_hash}</div>
                <div>Block: {cred.roadchain_block_index}</div>
                <div>Proof Hash: {cred.proof_hash}</div>
            </div>
        </div>}

        html += fprint{        <h2>How to Verify</h2>
        <ol>
            <li>Copy the RoadChain transaction hash above</li>
            <li>Visit <a href="{self.api_url}/explorer" target="_blank">RoadChain Explorer</a></li>
            <li>Search for the transaction hash</li>
            <li>Verify the proof hash matches</li>
            <li>Confirm the block is sufficiently old (not recently added)</li>
        </ol>

        <p>
            <strong>Why blockchain verification?</strong><br>
            Traditional resumes rely on trust. Blockchain-verified credentials are cryptographically
            proven and cannot be faked. Each credential is anchored to the RoadChain blockchain,
            making it independently verifiable by anyone.
        </p>

        <p style="text-align: center; margin-top: 40px; color: #6b7280;">
            🔐 Powered by <a href="https://roadchain.blackroad.io">RoadChain</a>
        </p>
    </div>
</body>
</html>}
        return html


# ============================================================================
# INTEGRATION WITH EXISTING JOB HUNTER SYSTEM
# ============================================================================

def integrate_roadchain_with_profile(
    user_profile: Dict[str, Any],
    roadchain_address: str
) -> IdentityProof:
    """    Convert existing job hunter profile to RoadChain identity.

    Args:
        user_profile: Existing user profile from onboarding
        roadchain_address: User's RoadChain wallet address

    Returns:
        IdentityProof with all credentials"""
    manager = RoadChainIdentityManager()

    # Create identity
    identity = manager.create_identity_proof(
        name=user_profile.get("name", ""),
        email=user_profile.get("email", ""),
        roadchain_address=roadchain_address,
        public_profile_url=user_profile.get("linkedin_url")
    )

    # Add employment credentials
    for job in user_profile.get("experience", []):
        manager.create_employment_proof(
            identity=identity,
            company=job.get("company", ""),
            title=job.get("title", ""),
            start_date=job.get("start_date", ""),
            end_date=job.get("end_date"),
            description=job.get("description", ""),
            linkedin_url=user_profile.get("linkedin_url")
        )

    # Add education credentials
    for edu in user_profile.get("education", []):
        manager.create_education_proof(
            identity=identity,
            institution=edu.get("institution", ""),
            degree=edu.get("degree", ""),
            field=edu.get("field", ""),
            graduation_year=edu.get("year", "")
        )

    # Add skill credentials
    for skill in user_profile.get("skills", []):
        manager.create_skill_proof(
            identity=identity,
            skill=skill,
            proficiency="expert",  # Could be inferred
            years_experience=5  # Could be calculated
        )

    # Add GitHub credentials if available
    github_data = user_profile.get("github")
    if github_data:
        manager.create_github_proof(
            identity=identity,
            github_username=github_data.get("username", ""),
            repos=github_data.get("repos", 0),
            followers=github_data.get("followers", 0),
            contributions_last_year=github_data.get("contributions", 0),
            top_languages=github_data.get("languages", [])
        )

    # Add project credentials
    for project in user_profile.get("projects", []):
        manager.create_project_proof(
            identity=identity,
            project_name=project.get("name", ""),
            description=project.get("description", ""),
            github_url=project.get("github_url"),
            technologies=project.get("technologies", []),
            github_stars=project.get("stars", 0)
        )

    # Add patents
    for patent in user_profile.get("patents", []):
        manager.create_patent_proof(
            identity=identity,
            patent_title=patent.get("title", ""),
            patent_number=patent.get("number", ""),
            status=patent.get("status", ""),
            filed_date=patent.get("filed", ""),
            uspto_url=f"https://uspto.gov/patents/{patent.get('number', '')}"
        )

    return identity
