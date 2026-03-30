import { chromium } from 'playwright';

const baseUrl = process.env.E2E_WEB_BASE_URL?.trim() ?? '';
const apiBaseUrl =
  process.env.E2E_WEB_API_BASE_URL?.trim() ||
  process.env.E2E_API_BASE_URL?.trim() ||
  '';
const authCookieName = process.env.E2E_WEB_AUTH_COOKIE_NAME?.trim() || 'farm_rpg_at';
const authToken =
  process.env.E2E_WEB_AUTH_ACCESS_TOKEN?.trim() ||
  process.env.E2E_WEB_AUTH_COOKIE_VALUE?.trim() ||
  '';
const smokeMode = authToken ? 'auth' : 'guest';
const expectedAuthStatus =
  process.env.E2E_WEB_EXPECTED_AUTH_STATUS?.trim() || (smokeMode === 'auth' ? 'Connecte' : 'Non connecte');
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

function hasWindowText(text, fragments) {
  const normalized = normalize(text).toLowerCase();
  return fragments.some((fragment) => normalized.includes(fragment.toLowerCase()));
}

async function readCurrentCombatId(request, apiBaseUrl) {
  const response = await request.get(new URL('/combat/current', apiBaseUrl).toString());
  if (!response.ok()) {
    throw new Error(`Failed to read current combat status during cleanup (HTTP ${response.status()}).`);
  }

  const payload = await response.json();
  return normalize(payload?.encounter?.id);
}

async function cleanupAuthCombat(context, apiBaseUrl, encounterId) {
  const request = context.request;
  const forfeitUrl = new URL(`/combat/${encounterId}/forfeit`, apiBaseUrl).toString();

  const response = await request.post(forfeitUrl, {
    headers: {
      Accept: 'application/json',
    },
    data: {},
  });

  if (!response.ok()) {
    throw new Error(`Combat forfeit failed during cleanup (HTTP ${response.status()}).`);
  }

  const payload = await response.json();
  const forfeitedStatus = normalize(payload?.encounter?.status);
  if (forfeitedStatus && forfeitedStatus !== 'fled') {
    throw new Error(`Unexpected combat status after cleanup forfeit: "${forfeitedStatus}".`);
  }

  const deadline = Date.now() + Math.max(2000, timeoutMs / 2);
  let lastObservedCombatId = '';
  while (Date.now() < deadline) {
    lastObservedCombatId = await readCurrentCombatId(request, apiBaseUrl);
    if (!lastObservedCombatId) {
      return { forfeitedStatus, cleaned: true };
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Combat cleanup did not clear the active encounter (current=${lastObservedCombatId || 'none'}).`);
}

async function prepareAuthFixture(context) {
  if (!authToken) {
    return false;
  }

  if (!apiBaseUrl) {
    throw new Error('Missing API base URL for authenticated web smoke mode.');
  }

  await context.addCookies([
    {
      name: authCookieName,
      value: authToken,
      url: apiBaseUrl,
      path: '/',
      httpOnly: true,
      secure: apiBaseUrl.startsWith('https://'),
      sameSite: 'Lax',
    },
  ]);

  return true;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const authFixtureApplied = await prepareAuthFixture(context);
  const page = await context.newPage();
  let combatEncounterId = '';
  let cleanupError = null;
  let primaryError = null;

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
    if (!authStatusIsPending && !hasWindowText(authStatus, [expectedAuthStatus])) {
      throw new Error(`Unexpected auth status "${authStatus}" (expected contains "${expectedAuthStatus}").`);
    }

    const startButtonDisabled = await page.isDisabled('[data-combat-action="start"]');
    if (smokeMode === 'guest') {
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
        mode: smokeMode,
        authFixtureApplied,
        authStatus,
        authResolved,
        authStatusIsPending,
        startButtonDisabled,
        combatError,
        combatStartRequestCount,
        result: 'passed',
      };
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    if (startButtonDisabled) {
      throw new Error('Expected start combat button to be enabled while authenticated.');
    }

    await page.click('[data-combat-action="start"]', { timeout: timeoutMs });

    await page.waitForFunction(
      () => {
        const element = document.querySelector('[data-hud="combatEncounterId"]');
        if (!(element instanceof HTMLElement)) {
          return false;
        }
        const value = (element.textContent ?? '').trim();
        return value.length > 0 && value !== '-';
      },
      { timeout: timeoutMs },
    );

    await page.waitForFunction(
      () => {
        const element = document.querySelector('[data-hud="combatStatus"]');
        if (!(element instanceof HTMLElement)) {
          return false;
        }
        const value = (element.textContent ?? '').trim();
        return value.length > 0 && value !== 'Inactif' && value !== 'Chargement';
      },
      { timeout: timeoutMs },
    );

    combatEncounterId = normalize(await page.textContent('[data-hud="combatEncounterId"]'));
    const combatStatus = normalize(await page.textContent('[data-hud="combatStatus"]'));
    const combatResult = normalize(await page.textContent('[data-hud="combatResult"]'));
    const combatError = normalize(await page.textContent('[data-hud="combatError"]'));
    const combatErrorVisible = await page.isVisible('[data-hud="combatError"]');

    if (combatStartRequestCount === 0) {
      throw new Error('Expected /combat/start request to be emitted in authenticated mode.');
    }
    if (combatEncounterId === '-' || combatEncounterId.length === 0) {
      throw new Error('Expected combat encounter id to be populated after start combat.');
    }
    if (!combatStatus.toLowerCase().includes('cours')) {
      throw new Error(`Unexpected combat status after start: "${combatStatus}".`);
    }
    if (combatErrorVisible && combatError.length > 0) {
      throw new Error(`Unexpected visible combat error after auth start: "${combatError}".`);
    }

    const summary = {
      baseUrl,
      mode: smokeMode,
      authFixtureApplied,
      authStatus,
      authResolved,
      authStatusIsPending,
      startButtonDisabled,
      combatEncounterId,
      combatStatus,
      combatResult,
      combatError,
      combatStartRequestCount,
      result: 'passed',
    };
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    if (smokeMode === 'auth' && combatEncounterId) {
      try {
        const cleanupResult = await cleanupAuthCombat(context, apiBaseUrl, combatEncounterId);
        console.log(JSON.stringify({
          cleanup: {
            encounterId: combatEncounterId,
            status: cleanupResult.forfeitedStatus,
            cleaned: cleanupResult.cleaned,
          },
        }));
      } catch (error) {
        cleanupError = error;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Auth combat cleanup warning: ${message}`);
      }
    }
    await context.close();
    await browser.close();
    if (cleanupError && !primaryError) {
      throw cleanupError;
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Web smoke failed: ${message}`);
  process.exit(1);
});
