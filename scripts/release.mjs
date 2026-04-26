import { execFileSync } from 'node:child_process';

const version = process.argv[2];

if (!version) {
  console.error('Usage: pnpm release v0.0.1');
  process.exit(1);
}

if (!/^v\d+\.\d+\.\d+$/.test(version)) {
  console.error('Version must look like v1.2.3');
  process.exit(1);
}

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
}

const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch !== 'main') {
  console.error('Releases must be created from main');
  process.exit(1);
}

const status = git(['status', '--porcelain']);
if (status) {
  console.error('Working tree must be clean before releasing');
  process.exit(1);
}

const existingTag = git(['tag', '--list', version]);
if (existingTag) {
  console.error(`Tag already exists: ${version}`);
  process.exit(1);
}

execFileSync('git', ['tag', '-a', version, '-m', `Release ${version}`], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', version], { stdio: 'inherit' });

execFileSync('gh', ['release', 'create', version, '--title', version, '--generate-notes', '--latest'], {
  stdio: 'inherit',
});
