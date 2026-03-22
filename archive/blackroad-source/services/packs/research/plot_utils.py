import base64
import io
from typing import Tuple

import matplotlib.pyplot as plt


def simple_line_plot(values: Tuple[float, ...]) -> str:
    fig, ax = plt.subplots(figsize=(3, 2))
    ax.plot(values)
    ax.set_title("signal")
    buffer = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buffer, format="png")
    plt.close(fig)
    return base64.b64encode(buffer.getvalue()).decode()


# TODO(lab-pack-next): add LaTeX export for plots
