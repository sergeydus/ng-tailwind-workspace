# Angular workspace improvement and update spec

**Research date:** 2026-09-29
**Scope:** the two present libraries, `ng-tailwind-merge` and `@sergeydus/ng-signals-utils`, plus their shared build, test, documentation, and release setup. Items 1–4 are implemented; compatibility, packaging, and release work remains planned.

## Current state

This repository is a library workspace, not an Angular application. The installed toolchain is Angular CLI 21.0.4, Angular 21.0.6, TypeScript 5.9.3, and Node 24.13.0. Both present libraries build with ng-packagr configured for partial compilation; only the directive library contains Angular declarations that use that format. Angular 21 is now in LTS; Angular 22 is the active major release. Angular's current compatibility table requires Node `^22.22.3 || ^24.15.0 || ^26.0.0` and TypeScript `>=6.0.0 <6.1.0` for Angular 22. The local Node 24.13.0 must therefore be upgraded before testing an Angular 22 consumer or migrating the workspace. [Angular release status](https://angular.dev/reference/releases) · [Version compatibility](https://angular.dev/reference/versions)

### Baseline before item 1

| Command | Result on 2026-09-29 |
| --- | --- |
| `ng build ng-tailwind-merge` | Passes; partial compilation |
| `ng build ng-signals-utils` | Passes; partial compilation |
| `ng build` | Fails: no project can be inferred in the multi-project workspace |
| `ng test ng-tailwind-merge --watch=false` | Fails before tests: missing `projects/my-directive-lib/tsconfig.lib.json` |
| `ng test ng-signals-utils --watch=false` | Same missing `tsconfig` failure |
| `ng test --watch=false` | Also tries the two missing projects and fails initialization |

After items 1–4, `npm run build` passes for both libraries. The directive smoke test was replaced with host and render-to-string tests. The signal helpers now use synchronous derivations where appropriate and clean up scheduled work. The root test command runs 51 tests across both libraries.

### Existing tests and required coverage

The workspace has **six** `.spec.ts` files and **51** `it(...)` cases. The directive suite exercises both exported utilities and both directives, including browser host behavior and server-rendered class output. The signal suite covers all **24 public signal exports**, including timer cleanup, injection context, custom equality, edge cases, and generic return types.

The behavior tests cover the following public API groups. The packed-package consumer check remains a release gate:

| Public API group | Exports | Minimum behavior to test |
| --- | ---: | --- |
| Tailwind utilities | 2 | Empty, conditional, conflicting, and nonconflicting classes; alias parity |
| Tailwind directives | 2 | Host rendering, static and dynamic classes, `[ngClass]` ownership, repeated updates, removed classes, and input shapes |
| Signal transformations | 5 | Initial and changed values, filter retention, debounce timing and destroy, tuple inference, custom equality |
| Signal array helpers | 8 | Update and derived output, empty arrays, invalid indices, predicates, and nonmutating sort |
| Signal object helpers | 7 | Patch immutability, selected/omitted keys, property extraction, keys/values/entries after updates |
| Signal effect helpers | 4 | First run, previous value, one-shot behavior, throttle/debounce timing, cleanup, and tracked dependencies |

The signal specs include type-level assertions for generic return types and use deterministic fake timers for time-based helpers. The packed-package consumer test for the actual public import paths remains planned under item 5.

## P0 — restore a trustworthy workspace

### 1. Remove dead project references and make root commands useful — implemented

The workspace had references to `my-directive-lib` and `ng-tailwind-merge1`, but neither directory exists. Those entries have been removed from `angular.json`, `tsconfig.json`, and the root README. The missing `@sergeydus/ng-signals-utils` path alias and project references have been added. The root build script now builds both named libraries, the test script runs both once, watch scripts name their projects, and the nonexistent app `start` script is gone. The README's commands, prerequisites, project inventory, and duplicated publish instructions have been corrected. The obsolete VS Code app/Karma launch file was removed, and its tasks now run the build and one-shot test scripts without background-watcher settings.

**Verification:** `npm ci` succeeds from the lockfile, then `npm run build` and `npm test` pass; no workspace configuration points to absent project directories.

### 2. Replace the invalid directive smoke test with host tests — tests added

The original spec called `TestBed.createComponent(NgTailwindMerge)`, although `NgTailwindMerge` is a directive. It has been replaced with standalone host components. The tests cover `cn()`, `mergeTailwindClasses()`, conflicting static classes, `[class]`, `[class.foo]`, class preservation after input updates, `[merge]` string/array/object inputs, and `[ngClass]` both with and without Angular's `NgClass` imported. The library directive declares its own `ngClass` input, so the no-`NgClass` case is the documented usage. The tests retain names that identify the original `[class]` capture and proposed `[merge]` precedence; item 3 records the selected behavior. [Angular directive testing](https://angular.dev/guide/testing/attribute-directives) · [Angular class bindings](https://angular.dev/guide/templates/binding)

**Verification:** both directive classes have runnable host tests and both exported class utilities pass their tests. The original class-loss regressions are now green under item 3. None are skipped or marked as expected failures.

### 3. Define and fix directive class ownership — implemented

Both directives previously called `nativeElement.setAttribute('class', ...)` from an effect. Host tests reproduced the loss of `[class.font-bold]` and unrelated static classes. The directives now use Angular host class bindings for their merged values and use a regular directive effect to remove only Tailwind classes superseded within their own inputs. A browser-only `afterRenderEffect` was tried first, then replaced because it cannot clean server-rendered output. `NgTailwindMerge` keeps its existing `class` input and accepts strings, arrays, and objects; its `ngClass` input follows `class` in conflict order. `NgMerge` merges literal static classes before its `merge` input. The host-only `mergedClasses` values are protected. Independent Angular `[class.foo]` bindings remain Angular-owned, though an overlapping token may be removed if it loses a conflict in the directive inputs; the package README documents this caveat and the optional, duplicate `NgClass` import. [Class bindings](https://angular.dev/guide/templates/binding) · [DOM APIs](https://angular.dev/guide/components/dom-apis)

**Verification:** all 20 directive tests pass with the regular effect, including first-render preservation, static/input conflict precedence, independent `[class.foo]` toggles, repeated `[ngClass]` and `[merge]` changes, array and object `[class]` values, concurrent Angular `NgClass` updates, and server-rendered conflict removal. `npm run build` passes for both libraries. Hydration remains untested.

### 4. Repair signal timing, injection context, and cleanup — implemented

`distinctSignal` now uses `computed` with its equality comparator, so it updates synchronously outside an injection context. `filterSignal` uses `linkedSignal` with the previous accepted value and returns `.asReadonly()`; it falls back to `initialValue` before a match. `debounceSignal` retains its scheduled effect, accepts an explicit `{ injector }` option, exposes the initial value immediately, and cancels pending updates when destroyed. [Computed/equality](https://angular.dev/guide/signals) · [Linked signal previous value](https://angular.dev/guide/signals/linked-signal) · [Effect injection context](https://angular.dev/guide/signals/effect#injection-context)

`debounceSignal`, `debounceEffect`, and `throttleEffect` register timer cleanup with `onCleanup`. `debounceEffect` schedules its initial value; `throttleEffect` calls immediately and delivers the latest value at the end of each window. `watchSignal`, `watchUntil`, and `throttleEffect` use `untracked` around callbacks or predicates so only their explicit source triggers them. Tests cover `watchUntil` when its predicate passes initially and when its owner is destroyed. [Effect cleanup](https://angular.dev/guide/signals/effect#effect-cleanup-functions) · [Untracked reads](https://angular.dev/guide/signals#reading-without-tracking-dependencies)

Timers use `ReturnType<typeof setTimeout>`. The `any` casts in `combineSignals` and `omitSignal` are gone, with tuple and object key types checked in specs. Deterministic Vitest fake timers and `TestBed.tick()` cover scheduling, destruction, and explicit injection. The signals README and examples describe the tested timing and context rules. [TestBed API](https://angular.dev/api/core/testing/TestBedStatic) · [Vitest testing](https://angular.dev/guide/testing)

**Verification:** all 31 signal tests pass, covering all 24 exports. `combineSignals([a, b])` now infers a readonly tuple without `as const`, confirmed both in the source spec type-check and against the built declaration. `watchSignal` skips batched net-zero changes. The signal spec files pass TypeScript checking. The root run passes all 51 tests.

## P1 — ship a compatible correctness release

### 5. Keep the next release on an Angular 21 build

The package manifests currently advertise Angular `>=17.0.0`, while the directive distributable is built with Angular 21. Angular's library guidance says a consuming application must use an Angular version **at least as new as the library build version**; partial compilation does not make a 21-built directive compatible with Angular 17–20. The directive also uses the `input()` API, so the current `17.0.0` floor is too broad on API grounds. `ng-signals-utils` has no decorated classes, so partial compilation does not materially apply to its own code; it now uses `linkedSignal`, introduced in Angular 20, and its true supported floor must be verified with consumer fixtures. Do not infer support from the broad peer range alone. [Library compatibility](https://angular.dev/tools/libraries/creating-libraries#ensuring-library-version-compatibility) · [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format)

Recommended order: first update local and CI Node to a version supported by **both** Angular 21 and 22, such as Node 24.15.x or later within the 24.x line (or Node 22.22.3+ within 22.x). Finish the P0 correctness work with the Angular 21 toolchain, then test the packed libraries in clean Angular 21 **and** 22 consumers. If both pass, advertise a bounded `>=21.0.0 <23.0.0` peer range for required Angular packages, update the README's `Node.js 18+` claim, and release the fixes. If a package fails against Angular 22, narrow its peer range until compatibility is repaired. Record the widened public `class` input type, changed class behavior, new `debounceSignal` option, synchronous filter/distinct behavior, and trailing throttle delivery in a changelog; choose package version bumps for those public changes before publishing. Angular 21 is still in LTS, so this sequence preserves its consumers while making support evidence explicit. [Angular release status](https://angular.dev/reference/releases) · [Version compatibility](https://angular.dev/reference/versions)

**Acceptance:** the published tarballs are built with Angular 21, install and build in both Angular 21 and 22 consumer fixtures, and declare only the tested Angular peer range. The README and CI use Node versions supported by their respective Angular majors.

### 6. Validate package contents and dependency metadata

`projects/ng-tailwind-merge/package-lock.json` calls the package version `0.0.4`, while its manifest says `1.0.0`; the signals library's nested lockfile pins Angular 18 and peer ranges different from its current manifest. Decide on one install model (prefer the root lockfile for this shared workspace) and remove or regenerate misleading nested lockfiles accordingly. Check whether `@angular/common` is required as a peer by **either** package; both libraries' source imports only `@angular/core` from Angular. Audit root dependencies against actual build and test use. Validate `npm pack --dry-run` from each built package and install the tarballs in a clean consumer fixture before release.

Neither package has a LICENSE file despite declaring MIT; add the intended license text to the repository and ensure it is included in the tarballs. `ng-tailwind-merge` lists "Eric Freeman" as author while the signals package lists "Sergey Dus"; verify ownership before changing metadata. The `[merge]` selector is generic and could collide with another directive; consider a prefixed selector before a breaking release, with a migration note if it changes.

**Acceptance:** one reproducible install path is documented; lockfiles agree with manifests; packed artifacts contain the expected README, license, declarations, exports, and applicable partial-compiled directive output; installation has no avoidable peer conflicts.

### 7. Upgrade the development toolchain to Angular 22 separately

After the Angular 21-built correctness release, use the Node version established in item 5 and run the official `ng update @angular/cli@^22 @angular/core@^22` migration. Align `@angular/build`, `@angular/compiler-cli`, `ng-packagr`, TypeScript, and the lockfile with the Angular 22 compatibility table. Review the [Angular 21→22 update guide](https://angular.dev/update-guide) and migration output instead of hand-editing version numbers alone. Use the latest compatible 22 patch when implementing. [CLI update command](https://angular.dev/cli/update) · [Version compatibility](https://angular.dev/reference/versions)

An Angular 22-built directive package needs Angular 22 or newer consumers under Angular's published-library rule. Plan this as a separate breaking package release, or keep publishing the Angular 21-built line for Angular 21 consumers. Do not silently publish a 22-built artifact under the broader `>=21 <23` peer range.

**Acceptance:** Angular 22 builds and tests pass on a supported Node version; a packed-package Angular 22 consumer passes; published peer ranges match the compiler used for each artifact.

## P2 — maintenance and release hygiene

### 8. Keep documentation executable

Update package READMEs and `EXAMPLES.md` to match the selected Angular floor and the tested signal/directive semantics. Fix stale issue/repository placeholders and incorrect `npm start` and bare `npm run build` claims. Keep the directive README's `[ngClass]` example without an `NgClass` import, because it binds to the library directive's own input; explain the distinction if consumers might import Angular's `NgClass` too. Clarify that `@sergeydus/ng-signals-utils` is a library of signal helpers, not an application. Decide whether generated `docs/ng-signals-utils` is a release artifact or should be regenerated from source, and verify its links and API list when published.

**Acceptance:** copyable examples compile in the consumer fixture; install and build instructions match real commands; package metadata points to the correct repository and issue tracker.

### 9. Add a small release gate

Add CI for Node versions supported by the selected Angular build and consumer majors on at least Linux and Windows: clean install, both library builds, both test suites, and packed-package consumer builds against every advertised Angular major. Include type-level checks for generic signal helpers. Enforce source coverage through the installed `@angular/build:unit-test` builder: add `@vitest/coverage-v8`, enable `coverage`, include all library source files (including untested files) with `coverageInclude`, and set `coverageThresholds` with `perFile: true` and `functions: 100`. Add reviewed line and branch floors after the baseline is measured. This automatically includes new source files under the configured globs and makes an unexercised public function fail CI. Keep meaningful assertions for each public export, including the directives and aliases, because execution coverage alone cannot prove behavior. The builder schema in this checkout supports these options. [Angular coverage configuration](https://angular.dev/guide/testing/code-coverage)

Fail the release if any library lacks a passing test target or misses the coverage gate. Keep publishing manual until the gate is stable; use a release checklist that records package versions, peer ranges, changelog entries, tarball inspection, and consumer smoke tests.

**Acceptance:** a fresh checkout reproduces the release gate without local `dist` or `node_modules`; coverage includes every library source file and meets per-file function thresholds; the published package version and compatibility claim match the tested tarball.

## Suggested implementation sequence

1. Remove missing projects and repair root scripts so Vitest reaches tests.
2. Replace the directive smoke test, reproduce the class regressions, and fix directive class ownership.
3. Fix the signal `NG0203` failure, timing, cleanup, and type issues; get both test suites green.
4. Upgrade Node to a version supported by both majors, build with Angular 21, test packed artifacts in Angular 21 and 22 consumers, and release the correctness fixes with truthful peer ranges and docs.
5. Add CI and release notes, then migrate the development toolchain to Angular 22 as a separate release with a matching consumer floor.

## Source references

- [Angular release status and support policy](https://angular.dev/reference/releases)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular update command](https://angular.dev/cli/update) and [interactive update guide](https://angular.dev/update-guide)
- [Creating and publishing Angular libraries](https://angular.dev/tools/libraries/creating-libraries)
- [Signals](https://angular.dev/guide/signals) and [effect cleanup](https://angular.dev/guide/signals/effect)
- [Linked signal previous-value behavior](https://angular.dev/guide/signals/linked-signal)
- [Class bindings](https://angular.dev/guide/templates/binding), [NgClass](https://angular.dev/api/common/NgClass), and [DOM APIs](https://angular.dev/guide/components/dom-apis)
- [Angular Vitest coverage and thresholds](https://angular.dev/guide/testing/code-coverage)
