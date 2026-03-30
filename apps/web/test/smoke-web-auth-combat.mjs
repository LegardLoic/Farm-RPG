import { chromium } from 'playwright';

const baseUrl = process.env.E2E_WEB_BASE_URL?.trim() ?? '';
const expectedAuthStatus = process.env.E2E_WEB_EXPECTED_AUTH_STATUS?.trim() || 'Non connecte';
const pendingAuthStatus = process.env.E2E_WEB_PENDING_AUTH_STATUS?.trim() || 'Verification...';
const timeoutMs = Number.parseInt(process.env.E2E_WEB_TIMEOUT_MS ?? '30000', 10);
const idleWaitMs = Number.parseInt(process.env.E2E_WEB_IDLE_WAIT_MS ?? '1200', 10);
const allowPendingAuthStatus = (process.env.E2E_WEB_ALLOW_PENDING_AUTH_STATUS ?? 'true') !== 'false';

if (!baseUrl) {
  console.error('Missing E2E_WEB_BASE_URL for web smoke test.');
  process.exit(1);
}

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  let combatStartRequestCount = 0;
  page.on('request', (request) => {
    const isCombatStart =
      request.method() === 'POST' && request.url().includes('/combat/start');
    if (isCombatStart) {
      combatStartRequestCount += 1;
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('#hud-root .hud-panel', { timeout: timeoutMs });
    await page.waitForSelector('[data-hud="authStatus"]', { timeout: timeoutMs });
    await page.waitForSelector('[data-combat-action="start"]', { timeout: timeoutMs });
    let authResolved = false;
    try {
      await page.waitForFunction(
        ({ selector, pending }) => {
          const element = document.querySelector(selector);
          if (!(element instanceof HTMLElement)) {
            return false;
          }
          const value = element.textContent ?? '';
          return value.trim().length > 0 && value.trim().toLowerCase() !== pending.toLowerCase();
        },
        { selector: '[data-hud="authStatus"]', pending: pendingAuthStatus },
        { timeout: timeoutMs },
      );
      authResolved = true;
    } catch {
      authResolved = false;
    }

    const authStatus = normalize(await page.textContent('[data-hud="authStatus"]'));
    const authStatusIsPending = authStatus.toLowerCase() === pendingAuthStatus.toLowerCase();
    if (authStatusIsPending && !allowPendingAuthStatus) {
      throw new Error(`Auth status still pending after timeout: "${authStatus}".`);
    }
    if (!authStatusIsPending && !authStatus.toLowerCase().includes(expectedAuthStatus.toLowerCase())) {
      throw new Error(`Unexpected auth status "${authStatus}" (expected contains "${expectedAuthStatus}").`);
    }

    const startButtonDisabled = await page.isDisabled('[data-combat-action="start"]');
    if (!startButtonDisabled) {
      throw new Error('Expected start combat button to be disabled while unauthenticated.');
    }

    await page.waitForTimeout(Math.max(200, idleWaitMs));

    const combatError = normalize(await page.textContent('[data-hud="combatError"]'));
    const combatErrorVisible = await page.isVisible('[data-hud="combatError"]');
    if (combatStartRequestCount > 0) {
      throw new Error(`Unexpected /combat/start request count: ${combatStartRequestCount}.`);
    }
    if (combatErrorVisible && combatError.length > 0) {
      throw new Error(`Unexpected visible combat error while idle: "${combatError}".`);
    }

    const summary = {
      baseUrl,
      authStatus,
      authResolved,
      authStatusIsPending,
      startButtonDisabled,
      combatError,
      combatStartRequestCount,
      result: 'passed',
    };
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Web smoke failed: ${message}`);
  process.exit(1);
});
