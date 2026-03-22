#!/usr/bin/env bash
set -euo pipefail
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx create --name brbuilder --use || docker buildx use brbuilder
