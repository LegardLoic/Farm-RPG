import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const gateStartAt = new Date().toISOString();
const includeE2E =
  process.env.MVP_GATE_INCLUDE_E2E === '1' ||
  process.env.MVP_GATE_INCLUDE_E2E === 'true' ||
  process.env.MVP_GATE_INCLUDE_E2E === 'yes';

const steps = [
  {
    key: 'lint',
    title: 'Lint',
    command: 'npm',
    args: ['run', 'lint', '--if-present'],
  },
  {
    key: 'typecheck',
    title: 'Typecheck',
    command: 'npm',
    args: ['run', 'typecheck', '--if-present'],
  },
  {
    key: 'build',
    title: 'Build',
    command: 'npm',
    args: ['run', 'build', '--if-present'],
  },
  {
    key: 'api_tests',
    title: 'API tests',
    command: 'npm',
    args: ['run', 'test', '--workspace', '@farm-rpg/api', '--if-present'],
  },
  {
    key: 'web_tests',
    title: 'Web UI regression',
    command: 'npm',
    args: ['run', 'test', '--workspace', '@farm-rpg/web', '--if-present'],
  },
];

if (includeE2E) {
  steps.push(
    {
      key: 'api_e2e',
      title: 'API e2e',
      command: 'npm',
      args: ['run', 'test:e2e', '--workspace', '@farm-rpg/api', '--if-present'],
    },
    {
      key: 'web_smoke',
      title: 'Web smoke',
      command: 'npm',
      args: ['run', 'test:smoke', '--workspace', '@farm-rpg/web', '--if-present'],
    },
  );
}

function runStep(step) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const command = process.platform === 'win32' ? `${step.command} ${step.args.join(' ')}` : step.command;
    const args = process.platform === 'win32' ? [] : step.args;
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.once('close', (code, signal) => {
      const durationMs = Date.now() - startedAt;
      const success = code === 0;
      resolve({
        ...step,
        success,
        code: code ?? -1,
        signal: signal ?? '',
        durationMs,
      });
    });
  });
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return '0.0s';
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}

function buildMarkdown(results) {
  const passed = results.filter((entry) => entry.success).length;
  const failed = results.length - passed;
  const lines = [
    '# MVP Gate Report',
    '',
    `- Started at (UTC): ${gateStartAt}`,
    `- Include e2e: ${includeE2E ? 'yes' : 'no'}`,
    `- Passed steps: ${passed}/${results.length}`,
    `- Failed steps: ${failed}`,
    '',
    '| Step | Status | Exit code | Duration |',
    '| --- | --- | --- | --- |',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.title} | ${result.success ? 'pass' : 'fail'} | ${result.code} | ${formatDuration(result.durationMs)} |`,
    );
  }

  lines.push('');
  lines.push('## Re-run');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run qa:gate:mvp');
  lines.push('MVP_GATE_INCLUDE_E2E=1 npm run qa:gate:mvp');
  lines.push('```');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

async function main() {
  const results = [];
  for (const step of steps) {
    // Keep a compact marker before each command in CI/local logs.
    process.stdout.write(`\n=== [MVP Gate] ${step.title} ===\n`);
    const result = await runStep(step);
    results.push(result);
    if (!result.success) {
      break;
    }
  }

  const artifactDir = join(rootDir, 'artifacts', 'qa-gate');
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(join(artifactDir, 'mvp-gate-report.md'), buildMarkdown(results), 'utf8');

  const failed = results.some((entry) => !entry.success);
  if (failed) {
    process.exitCode = 1;
  }
}

await main();
