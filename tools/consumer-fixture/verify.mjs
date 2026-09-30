import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const major = process.argv[2];
if (!['21', '22'].includes(major)) {
  throw new Error('Usage: node tools/consumer-fixture/verify.mjs 21|22');
}

const nodeVersion = process.versions.node.split('.').map(Number);
const atLeast = (wantedMajor, minor, patch) =>
  nodeVersion[0] === wantedMajor &&
  (nodeVersion[1] > minor || (nodeVersion[1] === minor && nodeVersion[2] >= patch));
if (major === '22' && !(atLeast(22, 22, 3) || atLeast(24, 15, 0) || nodeVersion[0] === 26)) {
  throw new Error('Angular 22 consumer verification needs Node 22.22.3+, 24.15.0+, or 26+.');
}

const fixtureDir = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(fixtureDir, '..', '..');
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this through npm run verify:consumer:21 or verify:consumer:22.');
}

const scratchParent = join(root, 'tmp');
mkdirSync(scratchParent, { recursive: true });
const scratch = mkdtempSync(join(scratchParent, 'angular-packed-consumer-'));
const cache = join(scratch, 'npm-cache');
const packageDir = join(scratch, 'packages');
const appDir = join(scratch, 'app');
mkdirSync(packageDir);
cpSync(join(fixtureDir, 'template'), appDir, { recursive: true });

function npm(args, cwd, capture = false) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd,
    env: { ...process.env, npm_config_cache: cache },
    encoding: 'utf8',
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (${result.status})`);
  return result.stdout;
}

function packedPackage(name, outputDir) {
  const output = npm(['pack', join(root, 'dist', outputDir), '--json', '--pack-destination', packageDir], root, true);
  const [pack] = JSON.parse(output);
  const paths = new Set(pack.files.map(file => file.path));
  for (const expected of ['LICENSE', 'README.md', 'CHANGELOG.md', 'package.json']) {
    if (!paths.has(expected)) throw new Error(`${name} tarball lacks ${expected}`);
  }
  if (![...paths].some(path => path.endsWith('.d.ts'))) throw new Error(`${name} tarball lacks declarations`);
  if (![...paths].some(path => path.endsWith('.mjs'))) throw new Error(`${name} tarball lacks a module bundle`);
  const manifest = JSON.parse(readFileSync(join(root, 'dist', outputDir, 'package.json'), 'utf8'));
  const allowedRanges = major === '21'
    ? ['>=21.0.0 <22.0.0', '>=21.0.0 <23.0.0']
    : ['>=21.0.0 <23.0.0'];
  if (!allowedRanges.includes(manifest.peerDependencies['@angular/core'])) {
    throw new Error(`${name} @angular/core peer range is ${manifest.peerDependencies['@angular/core']}; expected ${allowedRanges.join(' or ')}`);
  }
  if ('@angular/common' in manifest.peerDependencies) {
    throw new Error(`${name} does not import @angular/common but still declares it as a peer`);
  }
  console.log(`${name}: ${pack.files.length} packed files, including LICENSE, README, CHANGELOG, declarations, and bundle`);
  return `file:../packages/${basename(pack.filename)}`;
}

try {
  console.log(`Building and packing libraries for Angular ${major} consumer verification`);
  npm(['run', 'build'], root);
  const directive = packedPackage('ng-tailwind-merge', 'ng-tailwind-merge');
  const signals = packedPackage('@sergeydus/ng-signals-utils', 'ng-signals-utils');
  const angularVersion = `^${major}.0.0`;
  const manifest = {
    name: `angular-${major}-packed-consumer`,
    version: '0.0.0',
    private: true,
    scripts: { build: 'ng build --configuration production' },
    dependencies: {
      '@angular/common': angularVersion,
      '@angular/compiler': angularVersion,
      '@angular/core': angularVersion,
      '@angular/platform-browser': angularVersion,
      '@sergeydus/ng-signals-utils': signals,
      clsx: '^2.1.1',
      'ng-tailwind-merge': directive,
      rxjs: '~7.8.0',
      'tailwind-merge': '^3.4.0',
      tslib: '^2.3.0',
    },
    devDependencies: {
      '@angular/build': angularVersion,
      '@angular/cli': angularVersion,
      '@angular/compiler-cli': angularVersion,
      typescript: major === '21' ? '~5.9.2' : '~6.0.0',
    },
  };
  writeFileSync(join(appDir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  npm(['install', '--no-audit', '--no-fund'], appDir);
  npm(['run', 'build'], appDir);
  console.log(`Angular ${major} packed consumer production build passed`);
  if (!resolve(scratch).startsWith(resolve(scratchParent) + sep)) {
    throw new Error(`Refusing to remove an unexpected fixture path: ${scratch}`);
  }
  rmSync(scratch, { recursive: true, force: true });
} catch (error) {
  console.error(`Consumer fixture retained for inspection: ${scratch}`);
  throw error;
}
