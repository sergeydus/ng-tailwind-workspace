# Changelog

## 2.0.0 (unreleased)

### Breaking changes

- Require Angular 21 or 22. The published 1.0.0 manifest allowed Angular 17 and later; this Angular 21-built directive has been verified in packed-package production builds with both Angular 21 and 22 consumers.
- Class conflict handling now follows the directive inputs' documented order. `NgTailwindMerge` merges `class` before `ngClass`; `NgMerge` merges literal static classes before `merge`. Templates that relied on the previous whole-attribute rewrite may render a different class list.

### Improvements and fixes

- Accept strings, arrays, and objects in `NgTailwindMerge.class`.
- Preserve unrelated static and Angular `[class.foo]` classes when directive inputs change.
- Remove superseded directive classes during server rendering.
- Include an MIT license in the package.
- Keep the existing `[merge]` selector for this release. It can conflict with another imported directive using the same selector; import `NgMerge` only where intended.

### Migration

Upgrade consuming applications to Angular 21 or 22 before installing 2.0.0. Review templates that mix `[class]`, `[ngClass]`, `[class.foo]`, and `[merge]` bindings. Angular's `NgClass` import is unnecessary when `NgTailwindMerge` handles `[ngClass]`.
