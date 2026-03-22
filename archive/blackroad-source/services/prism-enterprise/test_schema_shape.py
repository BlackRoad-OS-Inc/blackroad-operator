import json
from pathlib import Path

from pydantic import BaseModel, Field


class SilasPacketModel(BaseModel):
    assumptions: list[str] = Field(default_factory=list)
    logic_steps: list[str] = Field(default_factory=list)
    code: str
    tests: str
    balanced_ternary: str


def test_schema_matches_expected_structure():
    schema_path = Path("schemas/silas_packet.json")
    data = json.loads(schema_path.read_text())

    assert data["type"] == "object"
    assert data["additionalProperties"] is False
    assert set(data["required"]) == {
        "assumptions",
        "logic_steps",
        "code",
        "tests",
        "balanced_ternary",
    }

    props = data["properties"]
    assert props["assumptions"]["type"] == "array"
    assert props["logic_steps"]["type"] == "array"
    assert props["code"]["type"] == "string"
    assert props["tests"]["type"] == "string"
    assert props["balanced_ternary"]["pattern"] == "^[+-0]+$"

    sample = {
        "assumptions": ["models boot"],
        "logic_steps": ["collect", "compose"],
        "code": "print('ok')",
        "tests": "pytest -k silas",
        "balanced_ternary": "+-0",
    }

    packet = SilasPacketModel(**sample)
    assert packet.model_dump() == sample
