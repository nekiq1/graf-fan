import assert from "node:assert/strict";
import test from "node:test";
import { pendingMigrations } from "./migration-plan.mjs";

test("pendingMigrations sorts pending sql migrations and skips applied ones", () => {
  const result = pendingMigrations(
    ["/migrations/0003_quote_requests.sql", "/migrations/0002_newsletter.sql", "README.md"],
    ["0002_newsletter.sql"],
  );
  assert.deepEqual(result, [
    { name: "0003_quote_requests.sql", path: "/migrations/0003_quote_requests.sql" },
  ]);
});
