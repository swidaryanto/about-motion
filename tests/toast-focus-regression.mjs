import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const root = cwd();
const baseCss = readFileSync(join(root, 'styles/base.css'), 'utf8');
const toastCss = readFileSync(join(root, 'styles/toast.css'), 'utf8');

const compact = (css) => css.replace(/\s+/g, ' ').trim();
const base = compact(baseCss);
const toast = compact(toastCss);

const assertIncludes = (source, expected, message) => {
  if (!source.includes(expected)) {
    throw new Error(`${message}\nMissing: ${expected}`);
  }
};

const assertNotIncludes = (source, unexpected, message) => {
  if (source.includes(unexpected)) {
    throw new Error(`${message}\nUnexpected: ${unexpected}`);
  }
};

assertIncludes(base, '--focus-ring: #2563eb;', 'Focus ring token must stay blue.');
assertIncludes(toast, '.toast-control { --mx: 0px; --my: 0px; height: 36px; min-width: 96px; padding: 0 10px; border: 1px solid var(--panel-line);', 'Toast control default border must stay grey.');
assertIncludes(toast, 'outline: 1.5px solid var(--focus-ring);', 'Keyboard focus-visible outline must use the focus ring token.');
assertIncludes(toast, 'outline-offset: 4px;', 'Keyboard focus-visible outline must stay visibly separated.');
assertNotIncludes(toast, 'border: 1px solid var(--focus-ring);', 'Toast control default border must not use the blue focus token.');
assertNotIncludes(base, '--control-line: #2563eb;', 'Legacy blue default border token must not return.');
assertNotIncludes(base, '--control-line-hover: #1d4ed8;', 'Legacy blue hover border token must not return.');

console.log('toast focus regression checks passed');
