#!/bin/sh
set -e

if [ ! -f .env ]; then
	echo "Error: .env file not found."
	echo "Create it from .env.example first:"
	echo "  cp .env.example .env"
	exit 1
fi