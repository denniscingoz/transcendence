#!/bin/sh
set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)

if [ ! -f "$REPO_ROOT/.env" ]; then
	echo "Error: root .env file not found."
	echo "Create it from .env.example first:"
	echo "  cp .env.example .env"
	exit 1
fi

if [ ! -f "$REPO_ROOT/frontend/.env" ]; then
	echo "Error: frontend/.env file not found."
	echo "Create it from frontend/.env.example first:"
	echo "  cp frontend/.env.example frontend/.env"
	exit 1
fi