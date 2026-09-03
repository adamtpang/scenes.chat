// The prototype has no accounts. If PROTO_PASSCODE is set, every write must
// carry it; if unset (local dev), writes are open. This keeps a public
// deployment from becoming an anonymous upload bucket.

export function passcodeRequired() {
  return Boolean(process.env.PROTO_PASSCODE);
}

export function passcodeOk(candidate: string | null | undefined) {
  const expected = process.env.PROTO_PASSCODE;
  if (!expected) return true;
  return typeof candidate === "string" && candidate === expected;
}

export function cleanAuthor(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ").slice(0, 40);
  return name.length > 0 ? name : null;
}
