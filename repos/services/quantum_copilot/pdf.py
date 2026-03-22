"""Minimal PDF writer for compliance bundle summaries."""

from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from .models import BundleResult


HEADER = "%PDF-1.4\n"
FOOTER = "%%EOF\n"


def render_pdf(bundle: BundleResult, output_path: Path) -> None:
    """Write a lightweight single-page PDF summarising the bundle."""

    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        "Quantum-Secure Compliance Copilot",
        f"Case: {bundle.case_id} (status: {bundle.status})",
        f"Advisor: {bundle.manifest.metadata.get('advisor_email', 'n/a')}",
        f"Rep: {bundle.manifest.metadata.get('representative_id', 'n/a')}",
        f"PQC: {'ON' if bundle.pqc_enabled else 'OFF'}",
        "",
        "Policy Findings:",
    ]

    for finding in bundle.findings:
        status = "PASS" if finding.passed else "FAIL"
        lines.append(f"- [{status}] {finding.rule_id}: {finding.title}")

    lines.append("")
    lines.append("Rationale: " + bundle.rationale.rationale_text)
    if bundle.rationale.remediation_text:
        lines.append("Remediation: " + bundle.rationale.remediation_text)

    content_stream = _build_text_stream(lines)
    pdf_bytes = _assemble_pdf(content_stream)
    output_path.write_bytes(pdf_bytes)


def _build_text_stream(lines: list[str]) -> bytes:
    y_position = 760
    leading = 16
    commands = ["BT /F1 12 Tf"]
    for line in lines:
        wrapped = wrap(line, 90) or [""]
        for segment in wrapped:
            commands.append(f"1 0 0 1 72 {y_position} Tm ({_escape(segment)}) Tj")
            y_position -= leading
    commands.append("ET")
    content = "\n".join(commands).encode("utf-8")
    return content


def _assemble_pdf(content_stream: bytes) -> bytes:
    objects: list[bytes] = []
    offsets: list[int] = [0]

    def add_object(body: str) -> None:
        index = len(objects) + 1
        obj = f"{index} 0 obj\n{body}\nendobj\n".encode("utf-8")
        offsets.append(offsets[-1] + len(obj))
        objects.append(obj)

    add_object("<< /Type /Catalog /Pages 2 0 R >>")
    add_object("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    add_object("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>")
    add_object(f"<< /Length {len(content_stream)} >>\nstream\n" + content_stream.decode("utf-8") + "\nendstream")
    add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    xref_offset = len(HEADER)
    for obj in objects:
        xref_offset += len(obj)

    xref_entries = ["0000000000 65535 f "]
    position = len(HEADER)
    for obj in objects:
        xref_entries.append(f"{position:010} 00000 n ")
        position += len(obj)

    xref = "xref\n0 {count}\n".format(count=len(objects) + 1)
    xref += "\n".join(xref_entries) + "\n"
    trailer = f"trailer\n<< /Root 1 0 R /Size {len(objects) + 1} >>\nstartxref\n{xref_offset}\n"

    pdf = HEADER.encode("utf-8") + b"".join(objects) + xref.encode("utf-8") + trailer.encode("utf-8") + FOOTER.encode("utf-8")
    return pdf


def _escape(text: str) -> str:
    return text.replace("(", "\\(").replace(")", "\\)")


__all__ = ["render_pdf"]
