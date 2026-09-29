# Angular Directive Workspace

An Angular 21 library workspace containing a standalone directive library and a signal utility library. Both are built with `ng-packagr` for npm publishing.

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

## Setup

### Prerequisites
- Node.js `^20.19.0 || ^22.12.0 || ^24.0.0` (the Angular 21 supported ranges)
- npm 11 (the workspace declares `npm@11.2.0`)

### Installation

```bash
npm ci
```

## Development

### Build All Libraries

```bash
npm run build
```

### Build Specific Library

```bash
npm run ng -- build ng-tailwind-merge
npm run ng -- build ng-signals-utils
```

### Run Tests

```bash
npm test
```

To run only one library's tests once:

```bash
npm run ng -- test ng-tailwind-merge --watch=false
npm run ng -- test ng-signals-utils --watch=false
```

### Watch a Library Build

```bash
npm run watch:ng-tailwind-merge
npm run watch:ng-signals-utils
```

## Publishing to npm

Build and inspect the package you intend to release:

```bash
npm run ng -- build ng-tailwind-merge
cd dist/ng-tailwind-merge
npm pack --dry-run
```

For the signals library, use `npm run ng -- build ng-signals-utils` and inspect `dist/ng-signals-utils` instead. After verification, publish from the relevant `dist/<library>` directory.

Each library is configured with `ng-packagr` for automated bundling and distribution.
