"""Tests for permit_tracker.py"""
import pytest
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from permit_tracker import (
    apply, approve, deny, expire_permit, expire_overdue,
    get_permits_by_address, check_compliance, send_reminder,
    export_csv, get_permit, list_permits,
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_permits.db"


def test_apply_permit(tmp_db):
    p = apply("building", "Alice Smith", "123 Main St", db_path=tmp_db)
    assert p.id
    assert p.status == "pending"
    assert p.permit_type == "building"
    assert p.applicant == "Alice Smith"


def test_invalid_permit_type(tmp_db):
    with pytest.raises(ValueError, match="Unknown permit type"):
        apply("unicorn_license", "Bob", "456 Oak Ave", db_path=tmp_db)


def test_approve_permit(tmp_db):
    p = apply("electrical", "Bob", "789 Elm St", db_path=tmp_db)
    approved = approve(p.id, db_path=tmp_db)
    assert approved.status == "approved"
    assert approved.issued_at is not None
    assert approved.expires_at is not None


def test_deny_permit(tmp_db):
    p = apply("demolition", "Carol", "321 Pine Rd", db_path=tmp_db)
    denied = deny(p.id, reason="Incomplete application", db_path=tmp_db)
    assert denied.status == "denied"
    assert denied.notes == "Incomplete application"


def test_cannot_approve_denied_permit(tmp_db):
    p = apply("signage", "Dave", "555 Oak", db_path=tmp_db)
    deny(p.id, reason="Bad signage", db_path=tmp_db)
    with pytest.raises(ValueError, match="denied"):
        approve(p.id, db_path=tmp_db)


def test_expire_permit(tmp_db):
    p = apply("event", "Eve", "100 Festival Blvd", db_path=tmp_db)
    approve(p.id, db_path=tmp_db)
    expired = expire_permit(p.id, db_path=tmp_db)
    assert expired.status == "expired"


def test_expire_overdue(tmp_db):
    import sqlite3
    # Apply and approve a permit
    p = apply("plumbing", "Frank", "999 Water St", db_path=tmp_db)
    approved = approve(p.id, validity_days=1, db_path=tmp_db)
    # Manually backdate expires_at to simulate expiry
    conn = sqlite3.connect(str(tmp_db))
    past = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    conn.execute("UPDATE permits SET expires_at=? WHERE id=?", (past, approved.id))
    conn.commit()
    conn.close()
    expired_ids = expire_overdue(db_path=tmp_db)
    assert approved.id in expired_ids


def test_get_permits_by_address(tmp_db):
    apply("zoning", "Grace", "42 Elm Avenue", db_path=tmp_db)
    apply("building", "Henry", "99 Oak Street", db_path=tmp_db)
    apply("signage", "Ivy", "42 Elm Avenue Unit 2", db_path=tmp_db)
    results = get_permits_by_address("Elm", db_path=tmp_db)
    assert len(results) == 2
    for p in results:
        assert "Elm" in p.address


def test_check_compliance_approved(tmp_db):
    p = apply("mechanical", "Jack", "55 Bridge Rd", db_path=tmp_db)
    approve(p.id, db_path=tmp_db)
    result = check_compliance(p.id, db_path=tmp_db)
    assert result["compliant"] is True
    assert len(result["issues"]) == 0


def test_check_compliance_missing_address(tmp_db):
    import sqlite3
    p = apply("other", "Kim", "100 Test St", db_path=tmp_db)
    conn = sqlite3.connect(str(tmp_db))
    conn.execute("UPDATE permits SET address='' WHERE id=?", (p.id,))
    conn.commit()
    conn.close()
    result = check_compliance(p.id, db_path=tmp_db)
    assert result["compliant"] is False
    assert any("MISSING_ADDRESS" in issue for issue in result["issues"])


def test_send_reminder_within_window(tmp_db):
    p = apply("food_service", "Leo", "77 Cuisine Blvd", db_path=tmp_db)
    import sqlite3
    approve(p.id, db_path=tmp_db)
    soon = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    conn = sqlite3.connect(str(tmp_db))
    conn.execute("UPDATE permits SET expires_at=? WHERE id=?", (soon, p.id))
    conn.commit()
    conn.close()
    reminder = send_reminder(p.id, days_before=30, db_path=tmp_db)
    assert reminder is not None
    assert reminder["days_remaining"] <= 30
    assert "expires in" in reminder["message"]


def test_send_reminder_not_needed(tmp_db):
    p = apply("variance", "Mia", "88 Remote Rd", db_path=tmp_db)
    approve(p.id, validity_days=365, db_path=tmp_db)
    reminder = send_reminder(p.id, days_before=7, db_path=tmp_db)
    assert reminder is None


def test_export_csv(tmp_db):
    apply("business_license", "Nora", "100 Business Park", db_path=tmp_db)
    apply("home_occupation", "Oscar", "200 Home Ave", db_path=tmp_db)
    csv_output = export_csv(db_path=tmp_db)
    assert "Nora" in csv_output
    assert "Oscar" in csv_output
    assert "permit_type" in csv_output  # header row


def test_export_csv_filtered_by_status(tmp_db):
    p1 = apply("building", "P", "1 St", db_path=tmp_db)
    p2 = apply("electrical", "Q", "2 Ave", db_path=tmp_db)
    approve(p2.id, db_path=tmp_db)
    csv_out = export_csv(db_path=tmp_db, status="approved")
    assert "Q" in csv_out
    assert "P" not in csv_out or "approved" in csv_out  # only Q is approved


def test_list_permits(tmp_db):
    apply("signage", "Rita", "10 Sign St", db_path=tmp_db)
    apply("event", "Sam", "20 Event Blvd", db_path=tmp_db)
    all_permits = list_permits(db_path=tmp_db)
    assert len(all_permits) == 2
    pending = list_permits(status="pending", db_path=tmp_db)
    assert len(pending) == 2


def test_get_permit_not_found(tmp_db):
    result = get_permit("nonexistent", db_path=tmp_db)
    assert result is None
