#!/bin/sh

# Script to run after updating dependencies

# Remove conflicting global node typings
sed -i '' '/declare module "timers"/ { N; N; N; N; N; N; N; N; N; N; N; N; N; N; N; d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/declare namespace setTimeout/ { N; N; N; d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/declare namespace setImmediate/ { N; N; N; d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/setTimeout/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/clearTimeout/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/setInterval/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/clearInterval/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/setImmediate/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/clearImmediate/ { d; }' ./node_modules/@types/node/index.d.ts
sed -i '' '/declare var require/ { d; }' ./node_modules/@types/node/index.d.ts

# # Fix broken library
sed -i '' 's/domain = require/\/\/domain = require/g' ./node_modules/asap/raw.js