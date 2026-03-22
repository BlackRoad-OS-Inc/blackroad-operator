#!/usr/bin/env bash
set -euo pipefail
ENV=${1:-prod}
IMAGE_SHA=${2:?Usage: ops/rollback.sh <env> <image-sha>}

echo "⟲ Rolling back $ENV to image $IMAGE_SHA"

if [ "$ENV" = "k8s" ] || [ "$ENV" = "prod" ] || [ "$ENV" = "staging" ]; then
  kubectl set image deploy/prism prism=ghcr.io/${GITHUB_REPOSITORY}/prism:$IMAGE_SHA -n $ENV
  kubectl rollout status deploy/prism -n $ENV --timeout=180s
elif [ "$ENV" = "ecs" ]; then
  aws ecs update-service --cluster your-cluster --service prism --force-new-deployment \
    --task-definition $(aws ecs list-task-definitions --family-prefix prism | jq -r '.taskDefinitionArns[-1]')
else
  echo "Unknown env"; exit 2
fi
