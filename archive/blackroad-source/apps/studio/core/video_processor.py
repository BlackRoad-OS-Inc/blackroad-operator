"""
BlackRoad Studio — Video Processor
Batch processing with ffmpeg: transcode, thumbnail, caption extraction
"""
import subprocess, os, json
from pathlib import Path
from typing import Optional


def probe(input_path: str) -> dict:
    """Get video metadata via ffprobe."""
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams",
           "-show_format", input_path]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return json.loads(r.stdout) if r.returncode == 0 else {}


def transcode(input_path: str, output_path: str,
              preset: str = "web",
              max_width: int = 1920) -> bool:
    """Transcode video to web-optimized H.264/AAC."""
    presets = {
        "web":     ["-c:v", "libx264", "-crf", "23", "-preset", "fast",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"],
        "preview": ["-c:v", "libx264", "-crf", "30", "-preset", "ultrafast",
                    "-vf", f"scale='min({max_width},iw)':-2",
                    "-c:a", "aac", "-b:a", "96k"],
        "lossless":["-c:v", "libx264", "-crf", "0", "-preset", "veryslow", "-c:a", "copy"],
    }
    if preset not in presets:
        raise ValueError(f"Unknown preset: {preset}. Choose from {list(presets.keys())}")
    cmd = (["ffmpeg", "-y", "-i", input_path]
           + presets[preset]
           + [output_path])
    r = subprocess.run(cmd, capture_output=True, timeout=3600)
    return r.returncode == 0


def thumbnail(input_path: str, output_path: str,
              time_s: float = 5.0, size: str = "320x180") -> bool:
    """Extract a thumbnail at the given timestamp."""
    cmd = ["ffmpeg", "-y", "-ss", str(time_s), "-i", input_path,
           "-vframes", "1", "-vf", f"scale={size}", output_path]
    r = subprocess.run(cmd, capture_output=True, timeout=60)
    return r.returncode == 0


def extract_audio(input_path: str, output_path: str, format: str = "mp3") -> bool:
    """Extract audio track from video."""
    cmd = ["ffmpeg", "-y", "-i", input_path,
           "-vn", "-acodec", "libmp3lame" if format == "mp3" else "copy",
           output_path]
    r = subprocess.run(cmd, capture_output=True, timeout=600)
    return r.returncode == 0


def batch_process(input_dir: str, output_dir: str, preset: str = "web") -> dict:
    """Process all videos in a directory."""
    results = {"processed": [], "failed": [], "skipped": []}
    inp = Path(input_dir)
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    for f in inp.glob("**/*"):
        if f.suffix.lower() not in {".mp4", ".mov", ".avi", ".mkv", ".webm"}:
            continue
        out_f = out / f.with_suffix(".mp4").name
        if out_f.exists():
            results["skipped"].append(str(f))
            continue
        ok = transcode(str(f), str(out_f), preset)
        if ok:
            thumb = out / f.with_suffix(".jpg").name
            thumbnail(str(f), str(thumb))
            results["processed"].append(str(f))
        else:
            results["failed"].append(str(f))
    return results


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: video_processor.py <input_dir> <output_dir> [preset]")
        sys.exit(1)
    result = batch_process(sys.argv[1], sys.argv[2],
                           sys.argv[3] if len(sys.argv) > 3 else "web")
    print(json.dumps(result, indent=2))
