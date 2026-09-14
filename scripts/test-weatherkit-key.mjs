import { generateKeyPairSync } from "node:crypto";
import { importPKCS8 } from "jose";
import { normalizePrivateKey } from "../functions/_lib/weatherkit.js";

const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const pem = privateKey.export({ type: "pkcs8", format: "pem" });

const smashed = pem.replace(/\n/g, " ");
const quoted = `"${pem.replace(/\n/g, "\\n")}"`;

for (const [label, value] of [
  ["normal", pem],
  ["one-line spaces", smashed],
  ["quoted escaped newlines", quoted],
]) {
  const normalized = normalizePrivateKey(value);
  await importPKCS8(normalized, "ES256");
  if (!normalized.includes("BEGIN PRIVATE KEY") || !normalized.includes("\n")) {
    throw new Error(`${label}: missing PEM wrapping`);
  }
  console.log("ok", label);
}

console.log("weatherkit key normalize tests passed");
