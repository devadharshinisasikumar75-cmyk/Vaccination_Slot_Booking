import assert from "node:assert/strict";
import test from "node:test";

import { authenticatedFetch, clearAuthSession, saveAuthSession } from "../src/config/auth.js";

test("authenticated API requests include the saved bearer token", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  let requestOptions;
  globalThis.localStorage = {
    getItem: (key) => (key === "accessToken" ? "test-token" : null),
  };
  globalThis.fetch = async (_resource, options) => {
    requestOptions = options;
    return new Response(null, { status: 200 });
  };

  try {
    await authenticatedFetch("/api/users", {
      headers: { "Content-Type": "application/json" },
    });
    assert.equal(requestOptions.headers.get("Authorization"), "Bearer test-token");
    assert.equal(requestOptions.headers.get("Content-Type"), "application/json");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalStorage;
    }
  }
});

test("auth sessions store only the token and server-assigned user role", () => {
  const values = new Map();
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };

  try {
    saveAuthSession({
      token: "signed-token",
      user: { id: 12, name: "Test", email: "test@example.com", role: "USER" },
    });
    assert.equal(values.get("accessToken"), "signed-token");
    assert.equal(values.get("userRole"), "USER");
    assert.equal(values.has("selectedRole"), false);

    clearAuthSession();
    assert.equal(values.size, 0);
  } finally {
    if (originalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalStorage;
    }
  }
});
