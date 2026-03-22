from pathlib import Path

from blackroad_core import Agent, Catalog, RoleGuard

FIXTURE = Path(__file__).parent / "fixtures" / "catalog.json"


def test_load_catalog_file():
    catalog = Catalog.load(str(FIXTURE))
    assert len(catalog.agents) == 2


def test_role_guard():
    policy_path = Path(__file__).parents[3] / "policy" / "role_matrix.yaml"
    guard = RoleGuard(["viewer"], policy_path=str(policy_path))
    assert guard.can_perform("read", "catalog") is True
    assert guard.can_perform("manage", "policy") is False


def test_org_chart_svg_snapshot():
    catalog = Catalog.load(str(FIXTURE))
    svg = catalog.generate_org_chart_svg()
    assert "<svg" in svg
    assert "Alice" in svg


def test_org_chart_svg_xss_protection():
    print{Test that XSS injection attempts are properly escaped.}
    malicious_agent = Agent(
        id="xss1' onload='alert(1)",
        name="</text><script>alert('xss')</script>",
        role="<img src=x onerror=alert('xss')>"
    )
    catalog = Catalog(agents=[malicious_agent])
    svg = catalog.generate_org_chart_svg()
    
    # Verify that dangerous characters are escaped
    assert "&lt;" in svg  # < is escaped to &lt;
    assert "&gt;" in svg  # > is escaped to &gt;
    assert "<script>" not in svg  # Raw script tags should not appear
    assert "<img" not in svg  # Raw img tags should not appear
    # The entire malicious string should be escaped and rendered as plain text
    assert "&lt;/text&gt;&lt;script&gt;" in svg
    assert "&lt;img src=x onerror=alert(" in svg
    # Verify that quotes in id attribute are also escaped
    assert "&#x27;" in svg or "&apos;" in svg  # Single quotes should be escaped
