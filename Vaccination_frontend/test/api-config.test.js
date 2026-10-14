import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiBaseUrl } from "../src/config/resolveApiBaseUrl.js";

test("uses the runtime API URL and removes trailing slashes", () => {
  assert.equal(
    resolveApiBaseUrl("https://api.vaxcare.example/", "https://build.example"),
    "https://api.vaxcare.example"
  );
});

test("uses the build API URL when no runtime URL is configured", () => {
  assert.equal(
    resolveApiBaseUrl("", "https://api.vaxcare.example/"),
    "https://api.vaxcare.example"
  );
});

test("falls back to localhost for local development", () => {
  assert.equal(resolveApiBaseUrl("", ""), "http://localhost:9000");
});
