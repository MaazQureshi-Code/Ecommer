import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("Admin does not mutate Seller-owned Store operational status", () => {
  const service = read("src/api/adminStoreService.js");
  const manage = read("src/pages/admin/ManageSellersPage.jsx");
  const modal = read("src/components/admin/SellerDetailsModal.jsx");
  const alerts = read("src/components/admin/AdminAccountAlerts.jsx");
  const verification = read("src/pages/admin/SellerVerificationPage.jsx");

  assert.doesNotMatch(service, /\/api\/Admin\/stores\/[^\n]*\/status/i);

  for (const source of [manage, modal, alerts]) {
    assert.doesNotMatch(
      source,
      /activateAdminStore|suspendAdminStore|deactivateAdminStore|closeAdminStore|updateAdminStoreStatus/,
    );
  }

  assert.doesNotMatch(verification, /become\s+ACTIVE/i);
  assert.match(
    `${manage}\n${modal}\n${alerts}`,
    /Seller controls|Seller-controlled|controlled by the Seller/i,
  );
});
