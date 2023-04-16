## init
```bash
yarn add --dev typescript
yarn add --dev @types/node
yarn add --dev ts-node
yarn tsc --init --rootDir src --outDir ./bin --esModuleInterop --lib ES2015 --module commonjs --noImplicitAny true
```

## build
```bash
yarn tsc
```