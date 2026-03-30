'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { sign } = require('jsonwebtoken');

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.API_BASE_URL;
const ACCESS_TOKEN_SECRET = process.env.E2E_ACCESS_TOKEN_SECRET ?? process.env.ACCESS_TOKEN_SECRET;
const USER_ID = process.env.E2E_USER_ID;
const SAVE_SLOT = Number(process.env.E2E_SAVE_SLOT ?? '3');
const ACCESS_TOKEN_TTL = process.env.E2E_ACCESS_TOKEN_TTL ?? '15m';

function requireEnv(value, name) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  throw new Error(
    `Missing ${name}. Set ${name} before running the e2e suite. See docs/07-e2e-auth-combat-save-load.md.`,
  );
}

function createAccessToken() {
  return sign(
    {
      sub: requireEnv(USER_ID, 'E2E_USER_ID'),
      email: process.env.E2E_USER_EMAIL ?? 'e2e.runner@farm-rpg.local',
      displayName: process.env.E2E_USER_DISPLAY_NAME ?? 'E2E Runner',
    },
    requireEnv(ACCESS_TOKEN_SECRET, 'E2E_ACCESS_TOKEN_SECRET'),
    {
      expiresIn: ACCESS_TOKEN_TTL,
    },
  );
}

async function requestJson(path, options = {}) {
  const baseUrl = requireEnv(API_BASE_URL, 'E2E_API_BASE_URL');
  const token = createAccessToken();
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  let body = options.body;
  if (body !== undefined && typeof body !== 'string' && !(body instanceof Uint8Array)) {
    body = JSON.stringify(body);
  }

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  const text = await response.text();
  const payload = text.length > 0 ? safeParseJson(text) : null;

  if (!response.ok) {
    const message = payload && typeof payload === 'object' ? JSON.stringify(payload) : text || response.statusText;
    throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${message}`);
  }

  return payload;
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

test('e2e auth/me, combat/start, save capture, and save load all work together', async () => {
  assert.ok(Number.isInteger(SAVE_SLOT), 'E2E_SAVE_SLOT must be an integer');
  assert.ok(SAVE_SLOT >= 1 && SAVE_SLOT <= 3, 'E2E_SAVE_SLOT must be between 1 and 3');

  const me = await requestJson('/auth/me');
  assert.equal(me.status, 'ok');
  assert.equal(me.user.id, requireEnv(USER_ID, 'E2E_USER_ID'));

  const combatStart = await requestJson('/combat/start', { method: 'POST', body: {} });
  assert.equal(combatStart.status, 'ok');
  assert.ok(combatStart.encounter);
  assert.equal(combatStart.encounter.status, 'active');
  assert.equal(typeof combatStart.encounter.id, 'string');

  const currentCombat = await requestJson('/combat/current');
  assert.equal(currentCombat.status, 'ok');
  assert.ok(currentCombat.encounter);
  assert.equal(currentCombat.encounter.id, combatStart.encounter.id);

  const capturedSave = await requestJson(`/saves/${SAVE_SLOT}/capture`, { method: 'POST' });
  assert.equal(capturedSave.status, 'ok');
  assert.equal(capturedSave.save.slot, SAVE_SLOT);
  assert.equal(typeof capturedSave.save.version, 'number');
  assert.equal(typeof capturedSave.save.label, 'string');
  assert.equal(capturedSave.save.label.startsWith('Quick Save '), true);

  const storedSave = await requestJson(`/saves/${SAVE_SLOT}`);
  assert.equal(storedSave.status, 'ok');
  assert.equal(storedSave.save.slot, SAVE_SLOT);
  assert.equal(storedSave.save.label, capturedSave.save.label);

  const loadResult = await requestJson(`/saves/${SAVE_SLOT}/load`, { method: 'POST', body: {} });
  assert.equal(loadResult.status, 'ok');
  assert.equal(loadResult.save.slot, SAVE_SLOT);
  assert.equal(loadResult.save.label, capturedSave.save.label);

  const combatAfterLoad = await requestJson('/combat/current');
  assert.equal(combatAfterLoad.status, 'ok');
  assert.equal(combatAfterLoad.encounter, null);
});
