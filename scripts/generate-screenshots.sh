#!/bin/bash

# Veterinarian Screenshot Generator
# This script starts a local server, takes screenshots, then cleans up
# Uses Docker to run Playwright in a container with all dependencies

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PORT=8000
SERVER_PID=""
CONTAINER_NAME="veterinarian-screenshots-$$"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
USE_DOCKER=true

# Cleanup function
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}🛑 Stopping local server (PID: $SERVER_PID)...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Server stopped${NC}"
    fi

    # Clean up container if it exists
    if [ "$USE_DOCKER" = true ] && [ ! -z "$CONTAINER_CMD" ]; then
        if $CONTAINER_CMD ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            echo -e "${YELLOW}🐳 Removing container...${NC}"
            $CONTAINER_CMD rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
            echo -e "${GREEN}✅ Container removed${NC}"
        fi
    fi
}

# Set up trap to ensure cleanup on exit
trap cleanup EXIT INT TERM

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Veterinarian Screenshot Generator   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}\n"

# Detect container runtime (Docker or Podman)
CONTAINER_CMD=""

if command -v docker &> /dev/null && docker info >/dev/null 2>&1; then
    CONTAINER_CMD="docker"
    echo -e "${GREEN}✅ Docker detected and running${NC}\n"
elif command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    echo -e "${GREEN}✅ Podman detected${NC}\n"
else
    echo -e "${RED}❌ Error: Neither Docker nor Podman is installed or running${NC}"
    echo -e "${YELLOW}Please install one of:${NC}"
    echo -e "${YELLOW}  - Docker: https://docs.docker.com/get-docker/${NC}"
    echo -e "${YELLOW}  - Podman: https://podman.io/getting-started/installation${NC}"
    exit 1
fi

# Get host IP for Docker container to access
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # On Linux, use host.docker.internal or the docker0 bridge IP
    HOST_IP=$(ip -4 addr show docker0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' || echo "172.17.0.1")
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # On macOS, use host.docker.internal
    HOST_IP="host.docker.internal"
else
    # Fallback
    HOST_IP="host.docker.internal"
fi

echo -e "${BLUE}🌐 Host IP for container: ${HOST_IP}${NC}"

# Start local server in background (bind to all interfaces so Docker can reach it)
cd "$PROJECT_ROOT"
echo -e "${BLUE}🚀 Starting local server on port $PORT...${NC}"

# Try python3 first, then python, then node http-server
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT --bind 0.0.0.0 > /dev/null 2>&1 &
    SERVER_PID=$!
elif command -v python &> /dev/null; then
    python -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
elif command -v npx &> /dev/null; then
    echo -e "${YELLOW}Installing http-server...${NC}"
    npm install -g http-server 2>/dev/null || true
    npx http-server -p $PORT -a 0.0.0.0 -s > /dev/null 2>&1 &
    SERVER_PID=$!
else
    echo -e "${RED}❌ Error: No suitable HTTP server found (python3, python, or npx)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}\n"

# Wait for server to be ready
echo -e "${BLUE}⏳ Waiting for server to be ready...${NC}"
max_attempts=10
attempt=0
while ! curl -s http://localhost:$PORT > /dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo -e "${RED}❌ Error: Server failed to start within timeout${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo -e "\n${GREEN}✅ Server is ready${NC}\n"

# Pull Playwright image if not present
echo -e "${BLUE}🐳 Checking for Playwright image...${NC}"
if ! $CONTAINER_CMD image inspect mcr.microsoft.com/playwright:v1.56.0-jammy >/dev/null 2>&1; then
    echo -e "${YELLOW}📥 Pulling Playwright image (this may take a few minutes)...${NC}"
    $CONTAINER_CMD pull mcr.microsoft.com/playwright:v1.56.0-jammy
    echo -e "${GREEN}✅ Image pulled${NC}\n"
else
    echo -e "${GREEN}✅ Image already exists${NC}\n"
fi

# Run screenshot script in container
echo -e "${BLUE}📸 Taking screenshots in container...${NC}\n"

# Determine the correct network argument and URL based on container runtime and OS
if [[ "$CONTAINER_CMD" == "podman" ]]; then
    # Podman uses host.containers.internal or host network
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        NETWORK_ARG="--network host"
        TARGET_URL="http://localhost:${PORT}"
    else
        NETWORK_ARG=""
        TARGET_URL="http://host.containers.internal:${PORT}"
    fi
elif [[ "$CONTAINER_CMD" == "docker" ]]; then
    # Docker networking
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # On Linux, use host network mode for easy access to localhost
        NETWORK_ARG="--network host"
        TARGET_URL="http://localhost:${PORT}"
    else
        # On macOS/Windows, use host.docker.internal
        NETWORK_ARG=""
        TARGET_URL="http://host.docker.internal:${PORT}"
    fi
fi

# Add SELinux label if on Linux with SELinux (for Podman compatibility)
SELINUX_LABEL=""
if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v getenforce &> /dev/null && [[ "$(getenforce 2>/dev/null)" != "Disabled" ]]; then
    SELINUX_LABEL=":z"
fi

$CONTAINER_CMD run --rm \
    --name "$CONTAINER_NAME" \
    $NETWORK_ARG \
    -v "$PROJECT_ROOT:/work${SELINUX_LABEL}" \
    -v "$PROJECT_ROOT/screenshots:/screenshots${SELINUX_LABEL}" \
    -v "$SCRIPT_DIR:/scripts${SELINUX_LABEL}" \
    -w /scripts \
    -e SCREENSHOT_URL="$TARGET_URL" \
    mcr.microsoft.com/playwright:v1.56.0-jammy \
    /bin/bash -c "npm install && node take-screenshots.js"

# Cleanup happens automatically via trap
echo -e "\n${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Screenshots Generated! 🎉        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}\n"

echo -e "📁 Screenshots saved to: ${BLUE}screenshots/${NC}"
echo -e "\n${YELLOW}Note: The animated GIF (variable-editing-demo.gif) needs to be created manually.${NC}"
echo -e "${YELLOW}See scripts/README.md for instructions.${NC}\n"
