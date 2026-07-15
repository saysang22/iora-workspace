#!/bin/bash
set -e
cd ../..
corepack prepare pnpm@10.0.0 --activate
corepack pnpm install --frozen-lockfile
