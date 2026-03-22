#!/usr/bin/env bash
# UI Enhancement Script for BlackRoad Services
# Applies modern UI improvements across all services

set -e

echo "🎨 BlackRoad UI Enhancement Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICES_DIR="/Users/alexa/services"
SHARED_DIR="/Users/alexa/shared"

# Function to enhance a service
enhance_service() {
  local service=$1
  local service_path="$SERVICES_DIR/$service"
  
  if [ ! -d "$service_path" ]; then
    echo -e "${YELLOW}⚠️  Service $service not found, skipping${NC}"
    return
  fi
  
  echo -e "${BLUE}🔧 Enhancing $service...${NC}"
  
  # Create components directory if it doesn't exist
  mkdir -p "$service_path/components"
  
  # Copy shared components
  if [ -d "$SHARED_DIR/components" ]; then
    cp -r "$SHARED_DIR/components/"* "$service_path/components/" 2>/dev/null || true
    cp -r "$SHARED_DIR/styles/"* "$service_path/components/" 2>/dev/null || true
    echo "  ✓ Copied shared components"
  fi
  
  # Add global.css if it doesn't exist
  if [ ! -f "$service_path/app/globals.css" ]; then
    cat > "$service_path/app/globals.css" << 'EOF'
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.4s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Loading skeleton */
@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0px,
    rgba(255, 255, 255, 0.1) 40px,
    rgba(255, 255, 255, 0.05) 80px
  );
  background-size: 200px 100%;
  animation: skeleton 1.2s ease-in-out infinite;
}
EOF
    echo "  ✓ Created globals.css with animations"
  fi
  
  echo -e "${GREEN}  ✓ Enhanced $service${NC}"
}

# Array of services to enhance
SERVICES=(
  "web"
  "prism"
  "operator"
  "brand"
  "core"
  "demo"
  "docs"
  "ideas"
  "infra"
  "research"
  "developer"
  "api"
)

echo "📦 Found ${#SERVICES[@]} services to enhance"
echo ""

# Enhance each service
for service in "${SERVICES[@]}"; do
  enhance_service "$service"
done

echo ""
echo -e "${GREEN}✅ UI Enhancement Complete!${NC}"
echo ""
echo "Summary:"
echo "  • Added shared design tokens"
echo "  • Created reusable components"
echo "  • Added CSS animations and transitions"
echo "  • Improved accessibility"
echo ""
echo "Next steps:"
echo "  1. Import components in your pages"
echo "  2. Test responsive layouts"
echo "  3. Verify accessibility"
echo "  4. Deploy to staging"
