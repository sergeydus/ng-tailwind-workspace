# Angular workspace improvement and update spec

**Research date:** 2026-09-29
**Scope:** the two present libraries, `ng-tailwind-merge` and `@sergeydus/ng-signals-utils`, plus their shared build, test, documentation, and release setup. Items 1–6, 8, and 9 are implemented; the Angular 22 development-toolchain migration is a separate later release.

## Current state

This repository is a library workspace, not an Angular application. The installed workspace toolchain is Angular CLI 21.0.4, Angular 21.0.6, TypeScript 5.9.3, and Node 24.21.0. Both present libraries build with ng-packagr configured for partial compilation; only the directive library contains Angular declarations that use that format. Angular 21 is now in LTS; Angular 22 is the active major release. Node 24.21.0 meets Angular's requirements for both the Angular 21 workspace and Angular 22 consumer check. The Angular 22 consumer uses its own TypeScript 6.0 toolchain; the workspace remains on Angular 21. [Angular release status](https://angular.dev/reference/releases) · [Version compatibility](https://angular.dev/reference/versions)

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

### 5. Keep the next release on an Angular 21 build — implemented

**Compatibility checks (2026-09-30):** On Node 24.21.0, `npm ci` and `npm test` pass (51 tests). `npm run verify:consumer:21` and `npm run verify:consumer:22` both build and pack the Angular 21-built libraries, check tarball contents and peer ranges, install them in clean apps, and pass strict production builds using both public import paths, including a `combineSignals` tuple assignment. The consumer installs resolved Angular 21.2.24 and 22.2.0 respectively. The directive tarball contains seven files and the signals tarball contains eight, including LICENSE, README, CHANGELOG, bundles, manifests, and declarations; the signals tarball also includes EXAMPLES.md. Both packages declare `@angular/core >=21.0.0 <23.0.0`. The 51 library runtime tests still run against Angular 21; the Angular 22 consumer check verifies installation and compilation. The fixture source and runner are checked in under `tools/consumer-fixture/` for a fresh checkout.

**Release metadata prepared:** the next directive package version is `2.0.0`, because the verified Angular floor rises from the published 1.0.0 claim and class behavior changes. The next signals package version is `0.1.0`, reflecting its Angular floor and signal timing changes during its 0.x development line. Each package has an unreleased changelog entry that must receive a release date only when publishing is approved. Neither version has been published.

The manifests originally advertised Angular `>=17.0.0`, while the directive distributable is built with Angular 21. Angular's library guidance says a consuming application must use an Angular version **at least as new as the library build version**; partial compilation does not make a 21-built directive compatible with Angular 17–20. The directive also uses the `input()` API. `ng-signals-utils` has no decorated classes, so partial compilation does not materially apply to its own code; it now uses `linkedSignal`, introduced in Angular 20. The advertised Angular 21 and 22 majors are backed by packed consumer checks in each major. [Library compatibility](https://angular.dev/tools/libraries/creating-libraries#ensuring-library-version-compatibility) · [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format)

The local Node upgrade and both consumer checks are complete. CI should run on a Node version supported by both majors, such as Node 24.15+ within 24.x or Node 22.22.3+ within 22.x. Keep these packages built with Angular 21 for the proposed `>=21.0.0 <23.0.0` release; an Angular 22 workspace build belongs to item 7 and needs a new consumer floor. The prepared changelogs record the public input, class, timing, and type changes; review them and add release dates before publishing. [Angular release status](https://angular.dev/reference/releases) · [Version compatibility](https://angular.dev/reference/versions)

**Acceptance met for item 5:** the Angular 21-built tarballs install and compile in Angular 21 and 22 consumer fixtures under the bounded `>=21.0.0 <23.0.0` peer range. CI coverage of these checks remains in item 9.

### 6. Validate package contents and dependency metadata — implemented

`projects/ng-tailwind-merge/package-lock.json` used to call the package version `0.0.4`; the signals library's nested lockfile used to pin Angular 18. Both stale nested lockfiles have been removed, leaving the root lockfile as the single install model. A source import audit found that both distributables import only `@angular/core` from Angular, so `@angular/common` was removed from both peer lists. The consumer fixture requires the `@angular/core` peer and rejects an unnecessary `@angular/common` peer. The directive package's Node engine declaration was removed; the workspace toolchain requirement remains in the root README. Unused root `@angular/forms` and `@angular/router` dependencies were removed and the root lockfile updated. `npm ci`, all library tests, and both clean consumer production builds pass. The fixture packs each package and checks its README, license, changelog, declarations, bundle, and metadata.

The repository and both packages now have MIT LICENSE files, confirmed in both packed tarballs. The published directive package credits Eric Freeman, and the user chose to keep that attribution for this release. The generic `[merge]` selector is retained for compatibility in 2.0.0; its potential collision with another imported directive is documented in the README and changelog. Reconsider a prefixed selector in a later planned migration.

**Acceptance:** one reproducible install path is documented; lockfiles agree with manifests; packed artifacts contain the expected README, license, declarations, exports, and applicable partial-compiled directive output; installation has no avoidable peer conflicts.

### 7. Upgrade the development toolchain to Angular 22 separately

After the Angular 21-built correctness release, use the Node version established in item 5 and run the official `ng update @angular/cli@^22 @angular/core@^22` migration. Align `@angular/build`, `@angular/compiler-cli`, `ng-packagr`, TypeScript, and the lockfile with the Angular 22 compatibility table. Review the [Angular 21→22 update guide](https://angular.dev/update-guide) and migration output instead of hand-editing version numbers alone. Use the latest compatible 22 patch when implementing. [CLI update command](https://angular.dev/cli/update) · [Version compatibility](https://angular.dev/reference/versions)

An Angular 22-built directive package needs Angular 22 or newer consumers under Angular's published-library rule. Plan this as a separate breaking package release, or keep publishing the Angular 21-built line for Angular 21 consumers. Do not silently publish a 22-built artifact under the broader `>=21 <23` peer range.

**Acceptance:** Angular 22 builds and tests pass on a supported Node version; a packed-package Angular 22 consumer passes; published peer ranges match the compiler used for each artifact.

## P2 — maintenance and release hygiene

### 8. Keep documentation executable

Update package READMEs and `EXAMPLES.md` to match the selected Angular floor and the tested signal/directive semantics. Fix stale issue/repository placeholders and incorrect `npm start` and bare `npm run build` claims. Keep the directive README's `[ngClass]` example without an `NgClass` import, because it binds to the library directive's own input; explain the distinction if consumers might import Angular's `NgClass` too. Clarify that `@sergeydus/ng-signals-utils` is a library of signal helpers, not an application. Decide whether generated `docs/ng-signals-utils` is a release artifact or should be regenerated from source, and verify its links and API list when published.

**Acceptance:** copyable examples compile in the consumer fixture; install and build instructions match real commands; package metadata points to the correct repository and issue tracker.

**Implemented (2026-09-30):** The package guides use Angular 21 and 22 requirements and the tested helper behavior. The signals README and EXAMPLES use complete TypeScript samples, and the consumer fixture extracts all nine TypeScript blocks across both package READMEs and EXAMPLES.md for strict production compilation. The issue link points to this repository. The root README documents actual build, test, consumer, and API docs commands. The Compodoc script now runs on Windows; its generated `docs/ng-signals-utils/` HTML is rebuilt from source on demand and excluded from version control and npm packages. A generated API check found all 24 signal exports in its functions page.

### 9. Add a small release gate

Add CI for Node versions supported by the selected Angular build and consumer majors on at least Linux and Windows: clean install, both library builds, both test suites, and packed-package consumer builds against every advertised Angular major. Include type-level checks for generic signal helpers. Enforce source coverage through the installed `@angular/build:unit-test` builder: add `@vitest/coverage-v8`, enable `coverage`, include all library source files (including untested files) with `coverageInclude`, and set `coverageThresholds` with `perFile: true` and `functions: 100`. Add reviewed line and branch floors after the baseline is measured. This automatically includes new source files under the configured globs and makes an unexercised public function fail CI. Keep meaningful assertions for each public export, including the directives and aliases, because execution coverage alone cannot prove behavior. The builder schema in this checkout supports these options. [Angular coverage configuration](https://angular.dev/guide/testing/code-coverage)

Fail the release if any library lacks a passing test target or misses the coverage gate. npm 11.19 locally skipped some package install scripts, including `esbuild` and `lmdb`, while builds and tests still passed; confirm that a clean CI install builds successfully, and approve scripts only if CI proves they are needed. Keep publishing manual until the gate is stable; use a release checklist that records package versions, peer ranges, changelog entries, tarball inspection, and consumer smoke tests.

**Acceptance:** a fresh checkout reproduces the release gate without local `dist` or `node_modules`; coverage includes every library source file and meets per-file function thresholds; the published package version and compatibility claim match the tested tarball.

**Implemented locally (2026-09-30):** `.github/workflows/release-gate.yml` runs a clean install, both builds, both test suites with V8 coverage, and both packed consumer checks on Linux and Windows using Node 24.21.0. `angular.json` includes every library source file in coverage and enforces per-file floors of 100% functions and lines and 75% branches. After a clean local `npm ci`, all 51 tests and both consumer builds passed; npm 11 skipped several install scripts without breaking any check. A temporary untested function placed under the source glob caused the test command to fail its coverage gate, proving new source files are counted. The temporary file was removed. The consumer extractor accepts both `typescript` and `ts` fences. `RELEASE_CHECKLIST.md` records the manual release gates. Hosted CI still needs a passing run before publication.

## Suggested implementation sequence

1. Remove missing projects and repair root scripts so Vitest reaches tests.
2. Replace the directive smoke test, reproduce the class regressions, and fix directive class ownership.
3. Fix the signal `NG0203` failure, timing, cleanup, and type issues; get both test suites green.
4. Build with Angular 21 and verify packed artifacts in Angular 21 and 22 consumers on a supported Node version (done). Release the correctness fixes with peer ranges and docs limited to those verified majors after the remaining release work.
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
