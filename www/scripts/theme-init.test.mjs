import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { themeInitScript, themeStorageKey } from '../src/lib/theme-init.ts';

// Exercise the exact inline script without React or any application bundle.
for (const scenario of [
  {
    name: 'saved dark overrides a light system',
    stored: 'dark',
    systemDark: false,
    expected: 'dark',
    scheme: 'dark',
  },
  {
    name: 'saved light overrides a dark system',
    stored: 'light',
    systemDark: true,
    expected: 'light',
    scheme: 'light',
  },
  {
    name: 'no preference defaults to dark on a dark system',
    stored: null,
    systemDark: true,
    expected: 'dark',
    scheme: 'dark',
  },
  {
    name: 'invalid storage defaults to dark',
    stored: 'invalid',
    systemDark: false,
    expected: 'dark',
    scheme: 'dark',
  },
  {
    name: 'blocked storage defaults to dark on a light system',
    blocked: true,
    systemDark: false,
    expected: 'dark',
    scheme: 'dark',
  },
  {
    name: 'no preference defaults to dark on a light system',
    stored: null,
    systemDark: false,
    expected: 'dark',
    scheme: 'dark',
  },
  {
    name: 'unavailable system detection still defaults to dark',
    stored: null,
    detectionUnavailable: true,
    expected: 'dark',
    scheme: 'dark',
  },
]) {
  test(`theme before paint: ${scenario.name}`, () => {
    const root = { dataset: {}, style: {} };
    const meta = new Map();
    const context = {
      window: scenario.detectionUnavailable
        ? {}
        : { matchMedia: () => ({ matches: scenario.systemDark }) },
      localStorage: {
        getItem(key) {
          assert.equal(key, themeStorageKey);
          if (scenario.blocked) throw new Error('Storage is blocked');
          return scenario.stored;
        },
      },
      document: {
        documentElement: root,
        querySelector: (selector) => ({ setAttribute: (_, value) => meta.set(selector, value) }),
      },
    };
    vm.runInNewContext(themeInitScript, context);
    assert.equal(root.dataset.theme, scenario.expected);
    assert.equal(root.style.colorScheme, scenario.expected);
    assert.equal(meta.get('meta[name="color-scheme"]'), scenario.scheme);
    assert.equal(
      meta.get('meta[name="theme-color"]'),
      scenario.expected === 'dark' ? '#171717' : '#fafafa',
    );
  });
}
