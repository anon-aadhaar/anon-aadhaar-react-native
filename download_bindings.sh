#!/bin/bash

set -euo pipefail

# Variables
BINDINGS_URL="https://github.com/vivianjeng/mopro-anon-aadhaar/releases/download/v0.1.0/MoproiOSBindings.zip"
DEST_DIR="ios"
TMP_DIR=$(mktemp -d)

echo "Downloading bindings..."
curl -L "$BINDINGS_URL" -o "$TMP_DIR/MoproiOSBindings.zip"

echo "Unzipping..."
unzip -q "$TMP_DIR/MoproiOSBindings.zip" -d "$TMP_DIR/unzipped"

echo "Replacing contents in $DEST_DIR..."
rm -rf "$DEST_DIR/MoproiOSBindings"
mkdir -p "$DEST_DIR/MoproiOSBindings"
cp -R "$TMP_DIR/unzipped"/* "$DEST_DIR"

echo "Clean up..."
rm -rf "$TMP_DIR"

echo "✅ Done: MoproiOSBindings updated in $DEST_DIR"
