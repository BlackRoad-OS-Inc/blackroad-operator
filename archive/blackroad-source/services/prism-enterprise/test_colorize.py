import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.colorize import color_by_bt, color_by_pos


def strip_ansi(value: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", value)


def test_color_by_bt_maps_balanced_ternary():
    sample = color_by_bt("focus", "+")
    assert sample["bt"] == "+"
    assert "\x1b[" in sample["ansi"]
    assert strip_ansi(sample["ansi"]) == "focus"
    assert sample["html"].startswith("<span style=\"color:hsl(135, 70%, 45%);\">")

    neutral = color_by_bt("calm", "0")
    assert strip_ansi(neutral["ansi"]) == "calm"
    assert "hsl(0, 0%, 60%)" in neutral["html"]


def test_color_by_pos_returns_expected_mapping():
    tokens = [("Sprints", "VERB"), ("Aurora", "NOUN"), ("soft", "ADJ"), ("data", "X")] 
    colored = color_by_pos(tokens)
    assert [entry["token"] for entry in colored] == [token for token, _ in tokens]
    assert all("\x1b[" in entry["ansi"] for entry in colored)
    assert colored[0]["html"].startswith("<span style=\"color:hsl(30, 80%, 52%);\">")
    assert colored[1]["html"].startswith("<span style=\"color:hsl(210, 70%, 52%);\">")
    assert colored[2]["html"].startswith("<span style=\"color:hsl(280, 65%, 62%);\">")
    assert colored[3]["html"].startswith("<span style=\"color:hsl(200, 10%, 55%);\">")
