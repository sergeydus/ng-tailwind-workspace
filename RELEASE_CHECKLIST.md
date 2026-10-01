# Manual release checklist

Run the [release gate](./.github/workflows/release-gate.yml) on the release commit and confirm both Linux and Windows jobs pass. It runs on Node 24.21.0. Leave publishing manual.

## Verify the candidate

- [ ] Confirm the source package versions and unreleased changelog entries agree: `ng-tailwind-merge` 2.0.0 and `@sergeydus/ng-signals-utils` 0.1.0 for the prepared release. Add dates to both changelogs when the release is approved.
- [ ] Confirm both source manifests still declare `@angular/core >=21.0.0 <23.0.0`; keep the artifacts built with Angular 21 for this range.
- [ ] From a fresh checkout, run `npm ci`, `npm run build`, and `npm test`. The test command enforces per file coverage floors: 100% functions and lines, 75% branches.
- [ ] Run `npm run verify:consumer:21` and `npm run verify:consumer:22`. These pack both libraries, inspect required files and peer ranges, install the tarballs in new apps, compile the package examples, and production build each app.
- [ ] Inspect `npm pack --dry-run` in each `dist/<library>` directory. Confirm LICENSE, README, CHANGELOG, declarations, bundle, and package manifest. The signals package must also contain EXAMPLES.md.
- [ ] Check the Linux and Windows CI logs for clean install and build results. npm 11 may skip optional dependency install scripts; approve only scripts that a failing CI job proves necessary.

## Publish by explicit release decision

- [ ] Review the tarballs and changelog dates, then approve the exact package versions for publication.
- [ ] Publish each approved package from its `dist/<library>` directory.
- [ ] Confirm the npm registry shows the intended version, peer range, and files.
