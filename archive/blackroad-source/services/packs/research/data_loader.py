import json
from pathlib import Path
from typing import Any, Dict

import nbformat


def save_notebook_artifact(path: str, payload: Dict[str, Any]) -> None:
    nb_path = Path(path)
    nb_path.parent.mkdir(exist_ok=True)
    nb = nbformat.v4.new_notebook()
    nb.cells.append(nbformat.v4.new_markdown_cell("# Auto-generated experiment notebook"))
    nb.cells.append(nbformat.v4.new_code_cell(f"artifact = {json.dumps(payload, indent=2)}"))
    nb.cells.append(nbformat.v4.new_code_cell("artifact"))
    nbformat.write(nb, nb_path)


# TODO(lab-pack-next): add dataset registry and remote fetch helpers
