# NgTailwindMerge

An Angular standalone directive that **merges Tailwind CSS classes** from `class` and `ngClass` using [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) and `clsx`. Built on Angular's signal-based inputs.

## Requirements

- Angular `@angular/core` and `@angular/common` **^21.0.0** (standalone + signal inputs)
- `tailwind-merge` **^3.4.0**
- `clsx` **^2.1.1**

These are declared as peer dependencies.

## Installation

```bash
npm install ng-tailwind-merge
```

## Usage (standalone)

### `twMerge` Directive

Merges `class` and `ngClass` attributes:

```typescript
import { Component, signal } from '@angular/core';
import { NgTailwindMerge } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgTailwindMerge],
  template: `
    <!-- Simple merge: last conflicting class wins -->
    <div twMerge class="bg-red-500 bg-blue-500">
      Uses bg-blue-500
    </div>

    <!-- Merge class + ngClass -->
    <div
      twMerge
      class="p-4 bg-red-500"
      [ngClass]="{ 'text-white': isActive(), 'font-bold': true }">
      Merged with ngClass
    </div>

    <!-- Conflicts resolved -->
    <div twMerge class="p-4 p-8 m-2">
      Uses p-8 and m-2
    </div>
  `
})
export class ExampleComponent {
  isActive = signal(true);
}
```

### `merge` Directive (Signal-based)

Property binding for dynamic class merging:

```typescript
import { Component, signal } from '@angular/core';
import { NgMerge } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgMerge],
  template: `
    <!-- String input -->
    <div [merge]="'bg-red-500 bg-blue-500 p-4'">
      Uses bg-blue-500 and p-4
    </div>

    <!-- Array input -->
    <div [merge]="['bg-red-500', 'bg-blue-500', 'p-4']">
      Array merging
    </div>

    <!-- Object input -->
    <div [merge]="{ 'bg-blue-500': true, 'p-4': isActive(), 'text-white': false }">
      Conditional classes
    </div>

    <!-- Mixed input (array + object) -->
    <div [merge]="['bg-red-500', { 'p-4': true, 'font-bold': isActive() }]">
      Mixed types
    </div>

    <!-- Signal-based classes -->
    <div [merge]="classes()">
      Dynamic signal classes
    </div>
  `
})
export class ExampleComponent {
  isActive = signal(true);
  classes = signal('bg-green-500 p-8 text-white');
}
```

### `twClass` Directive

Single-class binding with automatic merging against static `class`:

```typescript
import { Component, signal } from '@angular/core';
import { NgTwClass } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgTwClass],
  template: `
    <!-- Static + dynamic classes merged -->
    <div twClass class="p-4 bg-red-500" [twClass]="dynamicClasses()">
      Merged with static class
    </div>

    <!-- Single dynamic class -->
    <button twClass [twClass]="buttonState()">
      Click me
    </button>
  `
})
export class ExampleComponent {
  dynamicClasses = signal('bg-blue-500 text-white');
  buttonState = signal('bg-green-500 hover:bg-green-600');
}
```

### `merge` Directive (Legacy @Input)

For non-signal components using traditional `@Input()`:

```typescript
import { Component } from '@angular/core';
import { NgMergeLegacy } from 'ng-tailwind-merge';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgMergeLegacy],
  template: `
    <div [merge]="classes">Traditional input binding</div>
  `
})
export class ExampleComponent {
  classes = 'bg-blue-500 p-4 text-white';
}
```

## Utility Functions

### `cn()` - Direct merging in component logic

```typescript
import { Component } from '@angular/core';
import { cn } from 'ng-tailwind-merge';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `<button [class]="buttonClass">Click</button>`
})
export class ButtonComponent {
  buttonClass = cn('px-4 py-2 rounded', 'bg-red-500 bg-blue-500'); // bg-blue-500 wins
}
```

### `mergeTailwindClasses()` - Composable function

```typescript
import { Component, computed, signal } from '@angular/core';
import { mergeTailwindClasses } from 'ng-tailwind-merge';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<div [class]="cardClasses()">Card</div>`
})
export class CardComponent {
  variant = signal('primary');
  size = signal('lg');

  cardClasses = computed(() => {
    const baseClasses = 'rounded-lg shadow-md';
    const variantClasses = this.variant() === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200';
    const sizeClasses = this.size() === 'lg' ? 'p-8' : 'p-4';
    
    return mergeTailwindClasses(baseClasses, variantClasses, sizeClasses);
  });
}
```

## API

| Directive | Selector | Input | Best For |
|-----------|----------|-------|----------|
| `NgTailwindMerge` | `[twMerge]` | `class`, `ngClass` attributes | Merging existing template attributes |
| `NgMerge` | `[merge]` (signal) | Signal input | Dynamic class merging with signals |
| `NgMergeLegacy` | `[merge]` (@Input) | Property binding | Legacy components |
| `NgTwClass` | `[twClass]` | Signal input | Single dynamic class with static base |

| Function | Returns | Best For |
|----------|---------|----------|
| `cn()` | `string` | Direct use in component logic |
| `mergeTailwindClasses()` | `string` | Composable/computed class logic |

## Features

- ✅ Signal-based and legacy `@Input()` support
- ✅ Standalone directives (no module required)
- ✅ Resolves Tailwind conflicts (last variant wins)
- ✅ Tree-shakeable (`sideEffects: false`)
- ✅ Utility functions for component scripts
- ✅ Works with strings, arrays, and objects

## How it works

- Directives read input values reactively via signals or `@Input()`.
- `clsx` normalizes inputs (strings, arrays, objects).
- `tailwind-merge` resolves Tailwind conflicts.
- Final merged string is applied to element's `class` attribute.

## License

MIT

