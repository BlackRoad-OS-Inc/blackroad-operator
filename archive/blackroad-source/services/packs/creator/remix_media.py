"""Tiny ffmpeg wrapper used for text-only parameter composition."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List


@dataclass
class RemixJob:
  """Describes a simplified ffmpeg remix operation."""

  input_path: Path
  output_path: Path
  filters: List[str]
  bitrate: str = "6M"

  def build_command(self) -> str:
    filtergraph = ",".join(self.filters)
    return f"ffmpeg -i {self.input_path} -b:v {self.bitrate} -vf \"{filtergraph}\" {self.output_path}"


def preview_job(job: RemixJob) -> str:
  """Return the ffmpeg command without executing it."""

  return job.build_command()


# TODO(creator-pack-next): Execute ffmpeg with subprocess and stream logs.
