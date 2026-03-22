#!/bin/bash
# BlackRoad 30k Agent Deployment Script

set -e

echo "🚀 BlackRoad 30,000 Agent Deployment System"
echo "============================================"
echo ""

# Configuration
DOCKER_IMAGE="blackroad/agent:latest"
K8S_NAMESPACE="blackroad-agents"
DEPLOYMENT_SIZE="${1:-100}"  # Default: 100 agents

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Build Docker Image
echo "📦 Step 1: Building Docker Image..."
if docker build -t $DOCKER_IMAGE . ; then
    log_success "Docker image built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# Step 2: Test Agent Locally
echo ""
echo "🧪 Step 2: Testing Agent Locally..."
CONTAINER_ID=$(docker run -d -p 8080:8080 $DOCKER_IMAGE)
sleep 3

if curl -s http://localhost:8080/health | grep -q "healthy"; then
    log_success "Agent health check passed"
else
    log_error "Agent health check failed"
    docker stop $CONTAINER_ID
    exit 1
fi

docker stop $CONTAINER_ID > /dev/null
log_success "Local test complete"

# Step 3: Push to Registry (if configured)
echo ""
echo "📤 Step 3: Pushing to Container Registry..."
if [ -n "$DOCKER_REGISTRY" ]; then
    docker tag $DOCKER_IMAGE $DOCKER_REGISTRY/$DOCKER_IMAGE
    if docker push $DOCKER_REGISTRY/$DOCKER_IMAGE; then
        log_success "Image pushed to registry"
    else
        log_warning "Failed to push to registry (continuing anyway)"
    fi
else
    log_warning "DOCKER_REGISTRY not set, skipping push"
fi

# Step 4: Create Kubernetes Namespace
echo ""
echo "🏗️  Step 4: Setting up Kubernetes..."
if kubectl create namespace $K8S_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -; then
    log_success "Namespace $K8S_NAMESPACE ready"
fi

# Step 5: Deploy to Kubernetes
echo ""
echo "🚢 Step 5: Deploying Agents to Kubernetes..."
echo "   Target: $DEPLOYMENT_SIZE agents"

# Update replica count
sed -i.bak "s/replicas: [0-9]*/replicas: $DEPLOYMENT_SIZE/" kubernetes/deployment.yaml

if kubectl apply -f kubernetes/deployment.yaml -n $K8S_NAMESPACE; then
    log_success "Deployment manifest applied"
else
    log_error "Deployment failed"
    exit 1
fi

# Step 6: Wait for Rollout
echo ""
echo "⏳ Step 6: Waiting for deployment to complete..."
if kubectl rollout status deployment/blackroad-agents-quantum -n $K8S_NAMESPACE --timeout=5m; then
    log_success "Deployment rolled out successfully"
else
    log_error "Deployment rollout timed out"
    exit 1
fi

# Step 7: Verify Agents
echo ""
echo "✅ Step 7: Verifying Agents..."
RUNNING_PODS=$(kubectl get pods -n $K8S_NAMESPACE -l app=blackroad-agents --field-selector=status.phase=Running --no-headers | wc -l)
echo "   Running agents: $RUNNING_PODS / $DEPLOYMENT_SIZE"

if [ "$RUNNING_PODS" -ge "$((DEPLOYMENT_SIZE * 9 / 10))" ]; then
    log_success "90%+ agents are running"
else
    log_warning "Only $RUNNING_PODS/$DEPLOYMENT_SIZE agents running"
fi

# Step 8: Show Status
echo ""
echo "📊 Deployment Summary"
echo "===================="
kubectl get deployment -n $K8S_NAMESPACE
echo ""
kubectl get pods -n $K8S_NAMESPACE | head -10
echo ""

# Final Instructions
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Commands:"
echo "  View agents:     kubectl get pods -n $K8S_NAMESPACE"
echo "  Check logs:      kubectl logs -n $K8S_NAMESPACE -l app=blackroad-agents"
echo "  Scale up:        kubectl scale deployment/blackroad-agents-quantum --replicas=1000 -n $K8S_NAMESPACE"
echo "  Health check:    kubectl port-forward -n $K8S_NAMESPACE svc/blackroad-agents-quantum 8080:80"
echo ""
echo "Dashboard: https://monitoring.blackroad.io/agents"
echo ""
