# Changelog

## 0.1.0 (unreleased)

### Breaking changes

- Require Angular 21 or 22. The published 0.0.8 manifest allowed Angular 17 and later, but the current helpers use `linkedSignal` and the packed package has been verified in production builds with both Angular 21 and 22 consumers.
- `combineSignals([a, b])` now infers a readonly tuple without `as const`. Code that assigns its value to a mutable array type or calls mutating methods such as `.push()` must use a readonly type or make a copy.

### Improvements and fixes

- Make `distinctSignal` a synchronous computed signal with an equality comparator. It no longer needs an injection context.
- Make `filterSignal` retain accepted values synchronously. It no longer needs an injection context and continues to return a readonly signal.
- Add an optional `{ injector }` argument to `debounceSignal` and cancel pending updates on cleanup.
- Make `throttleEffect` deliver the latest value at the end of each window. `debounceEffect` and `throttleEffect` cancel pending callbacks on cleanup.
- Keep user predicates and callbacks out of effect dependency tracking. `watchSignal` skips batched changes that return to the prior value.
- Include an MIT license in the package.

### Migration

Upgrade consuming applications to Angular 21 or 22 before installing 0.1.0. Review code that depended on the old timing of filtered, distinct, debounced, or throttled values; see the README's timing section. For a mutable array from `combineSignals`, copy the result with `[...combined()]`.
