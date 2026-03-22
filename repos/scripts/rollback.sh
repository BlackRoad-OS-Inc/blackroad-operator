#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $0 --env <preview|staging|production> --to-image <image>
USAGE
}

ENVIRONMENT=""
TARGET_IMAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --to-image)
      TARGET_IMAGE="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$ENVIRONMENT" || -z "$TARGET_IMAGE" ]]; then
  echo "Both --env and --to-image are required" >&2
  usage
  exit 1
fi

case "$ENVIRONMENT" in
  preview)
    echo "Rolling back preview via Fly to image $TARGET_IMAGE"
    flyctl deploy --app prism-console-preview --image "$TARGET_IMAGE" --yes
    ;;
  staging)
    echo "Rolling back staging via ECS to image $TARGET_IMAGE"
    aws ecs update-service \
      --cluster prism-shared-staging \
      --service prism-console-web \
      --force-new-deployment \
      --region us-east-1
    ;;
  production)
    echo "Rolling back production via ECS to image $TARGET_IMAGE"
    aws ecs update-service \
      --cluster prism-shared-prod \
      --service prism-console-web \
      --force-new-deployment \
      --region us-east-1
    ;;
  *)
    echo "Unsupported environment: $ENVIRONMENT" >&2
    exit 1
    ;;
fi
