#!/bin/bash
# RoadWay Buildpack Detector
# Scans a project directory and determines the best runtime
# Usage: detect.sh <project-dir>

set -e

DIR="${1:-.}"

detect() {
  # Docker — user knows best
  if [ -f "$DIR/Dockerfile" ]; then
    echo "docker"
    return
  fi

  # Node.js
  if [ -f "$DIR/package.json" ]; then
    if grep -q '"next"' "$DIR/package.json" 2>/dev/null; then
      echo "nextjs"
    elif grep -q '"nuxt"' "$DIR/package.json" 2>/dev/null; then
      echo "nuxt"
    elif grep -q '"astro"' "$DIR/package.json" 2>/dev/null; then
      echo "astro"
    else
      echo "node"
    fi
    return
  fi

  # Python
  if [ -f "$DIR/requirements.txt" ] || [ -f "$DIR/pyproject.toml" ] || [ -f "$DIR/setup.py" ] || [ -f "$DIR/Pipfile" ]; then
    if [ -f "$DIR/manage.py" ]; then
      echo "django"
    elif grep -q "flask" "$DIR/requirements.txt" 2>/dev/null; then
      echo "flask"
    elif grep -q "fastapi" "$DIR/requirements.txt" 2>/dev/null; then
      echo "fastapi"
    else
      echo "python"
    fi
    return
  fi

  # Go
  if [ -f "$DIR/go.mod" ]; then
    echo "go"
    return
  fi

  # Rust
  if [ -f "$DIR/Cargo.toml" ]; then
    echo "rust"
    return
  fi

  # Ruby
  if [ -f "$DIR/Gemfile" ]; then
    if [ -f "$DIR/config.ru" ] || [ -d "$DIR/app" ]; then
      echo "rails"
    else
      echo "ruby"
    fi
    return
  fi

  # PHP
  if [ -f "$DIR/composer.json" ]; then
    echo "php"
    return
  fi

  # Java
  if [ -f "$DIR/pom.xml" ]; then
    echo "java-maven"
    return
  fi
  if [ -f "$DIR/build.gradle" ] || [ -f "$DIR/build.gradle.kts" ]; then
    echo "java-gradle"
    return
  fi

  # Deno
  if [ -f "$DIR/deno.json" ] || [ -f "$DIR/deno.jsonc" ]; then
    echo "deno"
    return
  fi

  # Bun
  if [ -f "$DIR/bun.lockb" ]; then
    echo "bun"
    return
  fi

  # Static site (HTML files present)
  if ls "$DIR"/*.html >/dev/null 2>&1; then
    echo "static"
    return
  fi

  # Shell script with shebang
  if [ -f "$DIR/start.sh" ] || [ -f "$DIR/run.sh" ]; then
    echo "shell"
    return
  fi

  echo "unknown"
}

detect
