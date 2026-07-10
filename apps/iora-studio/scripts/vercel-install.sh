#!/bin/bash
set -e
cd ../..
git config --global url."https://${GH_TOKEN}@github.com/".insteadOf "https://github.com/"
git submodule sync -- packages/ui
git submodule update --init packages/ui
corepack prepare pnpm@10.0.0 --activate
corepack pnpm install --frozen-lockfile
