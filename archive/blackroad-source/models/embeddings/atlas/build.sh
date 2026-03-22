#!/bin/bash

set -e

rm -rf dist/

echo "Building viewer frontend..."

pushd ../viewer
npm run build
popd

echo "Copying viewer assets..."

rm -rf ./embedding_atlas/static
rm -rf ./embedding_atlas/widget_static
cp -r ../viewer/dist ./embedding_atlas/static

npm run build

uv build --wheel
