# Angular Directive Workspace

An Angular monorepo workspace containing multiple standalone directive and utility libraries. Built with Angular 21+ using `ng-packagr` for npm publishing.

## Projects

### [`ng-tailwind-merge`](./projects/ng-tailwind-merge)
An Angular standalone directive that merges Tailwind CSS classes using `tailwind-merge` and `clsx`.

**Features:**
- `[twMerge]` directive - merges `class` and `ngClass` attributes
- `[merge]` directive - dynamic class merging via property binding  
- `cn()` and `mergeTailwindClasses()` utility functions
- Signal-based inputs
- Tree-shakeable

See [ng-tailwind-merge README](./projects/ng-tailwind-merge/README.md) for detailed usage.

### [`@sergeydus/ng-signals-utils`](./projects/ng-signals-utils)
Utility functions for working with Angular signals.

**Features:**
- Signal transformations - `mapSignal`, `filterSignal`, `debounceSignal`, `combineSignals`, `distinctSignal`
- Array utilities - `arraySignalPush`, `arraySignalFilter`, `arraySignalMap`, `arraySignalSort`, and more
- Object utilities - `patchSignal`, `pickSignal`, `omitSignal`, `pluckSignal`, and more
- Effect helpers - `watchSignal`, `watchUntil`, `throttleEffect`, `debounceEffect`
- Type-safe with full TypeScript support
- Tree-shakeable

See [@sergeydus/ng-signals-utils README](./projects/ng-signals-utils/README.md) for detailed usage.

### Other Libraries
- `my-directive-lib` - foundational directive library
- `ng-tailwind-merge1` - additional Tailwind utilities

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

## Development

### Build All Libraries

```bash
npm run build
```

### Build Specific Library

```bash
ng build ng-tailwind-merge
ng build ng-signals-utils
```

### Run Tests

```bash
npm run test
```

### Development Server

```bash
npm start
```

## Publishing to npm

Build the library:

```bash
# or
ng build ng-signals-utils
```

Publish:

```bash
cd dist/ng-tailwind-merge
npm publish
# or
cd dist/ng-signals-utils
cd dist/ng-tailwind-merge
npm publish
```

Each library is configured with `ng-packagr` for automated bundling and distribution.
