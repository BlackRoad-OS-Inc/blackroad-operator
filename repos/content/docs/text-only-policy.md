# Text-Only Artifact Policy

The Amundson–BlackRoad stack ships exclusively with **textual artefacts**. This
keeps the repository diffable, auditable, and reproducible without shipping
binary blobs.

## Allowed Formats

- JSON / YAML / NDJSON
- Markdown and CSV
- SVG (vector graphics, XML)
- Portable Graymap P2 (ASCII grayscale)

## Blocked Formats

These never belong in Git history or API responses:

- Raster images such as PNG, JPG, GIF, WEBP
- PDF and office documents
- Binary archives (ZIP/TAR), pickles, NumPy binaries, Parquet/Feather
- Audio/Video containers
- Base64-encoded binary payloads (other than cryptographic signatures)

The `.gitignore`, `.gitattributes`, `scripts/pre-commit-no-binaries.sh`, and
`scripts/scan-no-binaries.py` guards enforce this policy locally and in CI.

## API Examples

```bash
# AM-2 dynamics as JSON
curl -s "https://prism.blackroad/api/ambr/sim/am2?bits=12&temperature=300" | jq .

# AM-2 amplitude trace as inline SVG
curl -s "https://prism.blackroad/api/ambr/plot/am2.svg" > am2.svg

# Transport field snapshot as ASCII PGM
curl -s -X POST \
  -H 'Content-Type: application/json' \
  -d '{"values": [[0, 1, 2], [2, 1, 0]]}' \
  "https://prism.blackroad/api/ambr/field/a.pgm"

# Mandelbrot set as PGM
curl -s "https://prism.blackroad/api/math/fractals/mandelbrot.pgm?width=64&height=64&iter=64" > mandelbrot.pgm
```

All endpoints set explicit `Content-Type` headers:

| Endpoint | Type |
| --- | --- |
| `/api/ambr/sim/*`, `/api/math/*.json`, `/api/math/logic/truth-table` | `application/json; charset=utf-8` |
| `/api/ambr/plot/*.svg`, `/api/math/waves/*.svg` | `image/svg+xml; charset=utf-8` |
| `/api/ambr/field/*.pgm`, `/api/math/fractals/*.pgm` | `image/x-portable-graymap; charset=us-ascii` |

## Telemetry & Units

Every simulation response embeds units and a Landauer-floor thermo block to
report irreversible energy costs. Invariants, such as transport mass
conservation (`≤ 1e-3` relative error), are asserted in automated tests.

## Deployment Notes

The Kubernetes deployment performs text-only liveness/readiness probes and never
mounts binary artefacts into the Git tree. Artefacts that must persist are stored
as text (JSON/SVG/PGM) on the bound volume or in object storage outside Git.
