# Changelog

## 0.1.0 (unreleased)

### Compatibility and behavior

- Require Angular 21 for the verified package build. The published 0.0.8 manifest allowed Angular 17 and later, but the current helpers use `linkedSignal` and the package is verified against an Angular 21 consumer.
- Make `distinctSignal` a synchronous computed signal with an equality comparator.
- Make `filterSignal` retain accepted values synchronously and return a readonly signal.
- Expose the source's initial value immediately from `debounceSignal`. It now accepts an optional `{ injector }` argument and cancels pending updates on cleanup.
- Make `throttleEffect` deliver the latest value at the end of each window. `debounceEffect` and `throttleEffect` cancel pending callbacks on cleanup.
- Keep user predicates and callbacks out of effect dependency tracking. `watchSignal` skips batched changes that return to the prior value.
- Infer a readonly tuple from `combineSignals([a, b])` without `as const`.
- Include an MIT license in the package.

### Migration

Upgrade consuming applications to Angular 21 before installing 0.1.0. Review code that depended on the old timing of filtered, distinct, debounced, or throttled values; see the README's timing section.
