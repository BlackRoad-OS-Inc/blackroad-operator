from qlm_lab.llm.toolformer import Toolformer
from qlm_lab.llm.runtime import execute_tagged_text, ToolContext
from qlm_lab.tools.registry import default_registry
from qlm_lab.policies import Policy


def test_toolformer_generates_tags_for_chsh():
    tf = Toolformer()
    plan = tf.generate("Please show CHSH violation on a Bell state")
    assert "<tool" in plan.text_with_tags
    assert "chsh" in plan.text_with_tags.lower()


def test_end_to_end_freeform_exec_creates_artifact():
    reg = default_registry()
    policy = Policy()
    ctx = ToolContext()
    tf = Toolformer()
    plan = tf.generate("Plot Bell histogram")
    text, trace = execute_tagged_text(plan.text_with_tags, reg, policy, ctx)
    assert "<result" in text
    assert any("hist" in t["name"] or t["name"].endswith("viz.hist") for t in trace)
    import os

    art_dir = os.path.join("modules", "qlm_lab", "artifacts")
    assert any(name.endswith(".png") for name in os.listdir(art_dir))
