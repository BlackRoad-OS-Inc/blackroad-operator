"""Quantum language model agent orchestrating rule-based and toolformer flows."""
from __future__ import annotations

from typing import List

from .base import Agent
from ..cache.prompt_cache import get as cache_get, put as cache_put
from ..lineage import append as log_lineage
from ..llm import ToolContext, Toolformer, execute_tagged_text
from ..policies import Policy
from ..proto import Msg, new
from ..tools import quantum_np as Q, viz
from ..tools.registry import default_registry


class QLM(Agent):
    """Quantum laboratory agent capable of rule-based and tool-called flows."""

    name = "qlm"

    def __init__(self, bus, policy: Policy | None = None, registry=None) -> None:
        super().__init__(bus)
        self.policy = policy or Policy()
        self.registry = registry or default_registry()
        self.toolformer = Toolformer()
        self.ctx = ToolContext()
        self.last_citations: List[dict[str, object]] = []

    def can_handle(self, m: Msg) -> bool:
        if m.recipient != self.name:
            return False
        if m.kind == "task" and m.op in {
            "solve_quantum",
            "prove_chsh",
            "solve_freeform",
            "prove_freeform",
            "solve_quantum_llm",
            "prove_chsh_llm",
        }:
            return True
        if m.kind == "result" and m.op == "citations":
            return True
        return False

    def _request_citations(self, query: str, k: int = 3) -> List[dict[str, object]]:
        self.last_citations = []
        if not query.strip():
            return []
        message = new(self.name, "researcher", "task", "retrieve", query=query, k=k)
        self.bus.publish(message)
        return self.last_citations

    def _execute_plan(
        self,
        plan_text: str,
        sender: str,
        op: str,
        source: str,
        citations: List[dict[str, object]] | None = None,
    ) -> tuple[List[Msg], List[str]]:
        before = set(self.ctx.artifacts)
        stitched, trace = execute_tagged_text(plan_text, self.registry, self.policy, self.ctx)
        new_artifacts = [path for path in self.ctx.artifacts if path not in before]
        message = new(
            self.name,
            sender,
            "result",
            op,
            text=stitched,
            trace=trace,
            source=source,
            citations=citations or [],
        )
        return [message], new_artifacts

    def _run_toolformer_plan(
        self, prompt: str, sender: str, op: str, citations: List[dict[str, object]]
    ) -> List[Msg]:
        cached = cache_get(prompt)
        if cached:
            plan_text = cached[0].plan_text
            source = "cache"
        else:
            plan = self.toolformer.generate(prompt)
            citation_lines = "\n".join(
                f"# cite: {c['path']} L{c['start']}-{c['end']} (score={c['score']:.3f})" for c in citations
            )
            plan_text = f"""{citation_lines}\n{plan.text_with_tags}""" if citation_lines else plan.text_with_tags
            source = plan.source
        responses, new_artifacts = self._execute_plan(plan_text, sender, op, source, citations)
        cache_put(prompt, plan_text, artifacts=new_artifacts, source=source)
        return responses

    def handle(self, m: Msg) -> List[Msg]:
        if m.kind == "result" and m.op == "citations":
            self.last_citations = list(m.args.get("citations", []))
            log_lineage({"agent": self.name, "op": "citations_received", "citations": self.last_citations})
            return []

        if m.op == "prove_chsh_llm":
            plan_text = (
                "Compute CHSH for |Φ+> and render histogram.\n"
                '<tool name="quantum_np.chsh_value_phi_plus" as="S"/>\n'
                '<tool name="viz.hist" args="{\\"00\\":0.5,\\"11\\":0.5}" fname="bell_hist_toolcaller.png" as="hist_path"/>'
            )
            responses, _ = self._execute_plan(plan_text, m.sender, m.op, "preset", [])
            return responses

        if m.op == "solve_quantum_llm":
            plan_text = (
                "Prepare Bell, measure, and plot histogram.\n"
                '<tool name="quantum_np.bell_phi_plus" as="psi"/>\n'
                '<tool name="quantum_np.measure_counts" from="psi" shots="4096" as="counts"/>\n'
                '<tool name="viz.hist" from="counts" fname="bell_hist_empirical_toolcaller.png" as="hist_path"/>'
            )
            responses, _ = self._execute_plan(plan_text, m.sender, m.op, "preset", [])
            return responses

        if m.op == "prove_chsh":
            s = Q.chsh_value_phi_plus()
            psi = Q.bell_phi_plus()
            reduced = psi.reshape(2, 2)
            rho = reduced @ reduced.conjugate().T
            bloch = (
                float(2 * rho[0, 1].real),
                float(-2 * rho[0, 1].imag),
                float((rho[0, 0] - rho[1, 1]).real),
            )
            bloch_path = viz.bloch(bloch, fname="bloch_q0.png")
            return [
                new(
                    self.name,
                    "critic",
                    "result",
                    "prove_chsh",
                    s=s,
                    bloch=bloch,
                    path=bloch_path,
                ),
                new(
                    self.name,
                    "archivist",
                    "log",
                    "qlm",
                    details={"op": "prove_chsh", "s": s},
                ),
            ]

        if m.op == "solve_quantum":
            psi = Q.bell_phi_plus()
            counts = Q.measure_counts(psi, shots=4096)
            viz.hist({"00": 0.5, "11": 0.5}, fname="bell_hist.png")
            hist_path = viz.hist(counts, fname="bell_hist_empirical.png")
            return [
                new(
                    self.name,
                    "critic",
                    "result",
                    "solve_quantum",
                    counts=counts,
                    path=hist_path,
                ),
                new(
                    self.name,
                    "archivist",
                    "log",
                    "qlm",
                    details={"op": "solve_quantum", "counts": counts},
                ),
            ]

        if m.op in {"solve_freeform", "prove_freeform"}:
            prompt = str(m.args.get("prompt", ""))
            citations = self._request_citations(prompt, k=int(m.args.get("k", 3)))
            return self._run_toolformer_plan(prompt, m.sender, m.op, citations)

        return []


__all__ = ["QLM"]
