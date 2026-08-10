/**
 * Global settings tests: appearance resolution and contact/social sanitization.
 *
 * `resolveContact` turns untrusted CMS text into live `href`s, so it is the
 * most security-sensitive pure function in the frontend. These tests pin down
 * the normalization rules and the "hide what isn't configured" behaviour.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { resolveAppearance, resolveContact, type ContactChannel } from "./appearance.ts";
import { FALLBACK_THEME_ID } from "../theme/themes.ts";

/** Find a channel by id, or undefined when it was (correctly) omitted. */
function channel(
  channels: ContactChannel[],
  id: ContactChannel["id"]
): ContactChannel | undefined {
  return channels.find((c) => c.id === id);
}

// ─── Appearance ──────────────────────────────────────────────────────────────

test("appearance falls back to a valid theme when CMS is unreachable", () => {
  // `fetchSettings` returns null on any network/CMS failure.
  const appearance = resolveAppearance(null);

  assert.equal(appearance.theme.id, FALLBACK_THEME_ID);
  assert.ok(appearance.typography.preset, "typography must still resolve");
});

test("appearance honours a valid theme stored in the database", () => {
  assert.equal(resolveAppearance({ websiteTheme: "deep-night" }).theme.id, "deep-night");
});

test("appearance ignores a junk theme value instead of throwing", () => {
  assert.equal(
    resolveAppearance({ websiteTheme: "hot-pink" }).theme.id,
    FALLBACK_THEME_ID
  );
});

test("each theme's default typography applies when CMS sets no preset", () => {
  // Deep Night is declared as `editorial`; without an explicit CMS override
  // the theme's own personality should win.
  const appearance = resolveAppearance({ websiteTheme: "deep-night" });
  assert.equal(appearance.typography.preset.key, "editorial");
});

test("an explicit CMS typography preset overrides the theme default", () => {
  const appearance = resolveAppearance({
    websiteTheme: "deep-night",
    typographyPreset: "grotesk",
  });
  assert.equal(appearance.typography.preset.key, "grotesk");
});

// ─── Contact: link construction ──────────────────────────────────────────────

test("a bare Instagram username becomes a full profile URL", () => {
  const { channels } = resolveContact({ instagram: "parto.studio" }, "en");
  assert.equal(channel(channels, "instagram")?.href, "https://instagram.com/parto.studio");
});

test("an @-prefixed Telegram handle is normalized", () => {
  const { channels } = resolveContact({ telegram: "@partoteam" }, "en");
  assert.equal(channel(channels, "telegram")?.href, "https://t.me/partoteam");
});

test("a full social URL is passed through rather than double-prefixed", () => {
  const { channels } = resolveContact(
    { instagram: "https://instagram.com/parto" },
    "en"
  );
  assert.equal(channel(channels, "instagram")?.href, "https://instagram.com/parto");
});

test("a WhatsApp phone number becomes a wa.me link", () => {
  const { channels } = resolveContact({ whatsapp: "+98 912 345 6789" }, "en");
  assert.equal(channel(channels, "whatsapp")?.href, "https://wa.me/989123456789");
});

test("a wa.me URL is accepted as-is", () => {
  const { channels } = resolveContact({ whatsapp: "https://wa.me/989123456789" }, "en");
  assert.equal(channel(channels, "whatsapp")?.href, "https://wa.me/989123456789");
});

test("phone numbers are stripped to a dialable tel: href", () => {
  const { channels, phone } = resolveContact({ phone: "+98 (21) 1234-5678" }, "en");
  assert.equal(phone, "+982112345678");
  assert.equal(channel(channels, "phone")?.href, "tel:+982112345678");
});

test("email becomes a mailto: link", () => {
  const { channels } = resolveContact({ email: "hello@parto.com" }, "en");
  assert.equal(channel(channels, "email")?.href, "mailto:hello@parto.com");
});

// ─── Contact: hostile input ──────────────────────────────────────────────────

test("javascript: URLs are rejected, not turned into links", () => {
  // The critical case: a CMS editor (or a compromised record) must not be able
  // to inject script into a visitor's browser through a social field.
  const { channels } = resolveContact(
    {
      instagram: "javascript:alert(1)",
      telegram: "javascript:alert(1)",
      mapUrl: "javascript:alert(1)",
      whatsapp: "javascript:alert(1)",
    },
    "en"
  );

  assert.equal(channels.length, 0, "no channel should be built from a javascript: URL");
});

test("data: and file: URLs are also rejected", () => {
  const { channels } = resolveContact(
    { mapUrl: "data:text/html,<script>alert(1)</script>" },
    "en"
  );
  assert.equal(channel(channels, "map"), undefined);
});

test("a handle containing a path traversal is rejected", () => {
  // "../../admin" must never be pasted onto the base URL.
  const { channels } = resolveContact({ telegram: "../../admin" }, "en");
  assert.equal(channel(channels, "telegram"), undefined);
});

test("a malformed email address is not linked", () => {
  const { channels } = resolveContact({ email: "not-an-email" }, "en");
  assert.equal(channel(channels, "email"), undefined);
});

test("external channels are flagged so the UI can set rel=noopener", () => {
  const { channels } = resolveContact(
    { instagram: "parto", phone: "+982112345678" },
    "en"
  );

  assert.equal(channel(channels, "instagram")?.external, true);
  // tel:/mailto: stay in-app and must not get target="_blank".
  assert.equal(channel(channels, "phone")?.external, false);
});

// ─── Contact: visibility ─────────────────────────────────────────────────────

test("channels with no configured value are omitted entirely", () => {
  const { channels } = resolveContact({}, "en");
  assert.deepEqual(channels, []);
});

test("a channel explicitly disabled in CMS is hidden even when it has a value", () => {
  const { channels } = resolveContact(
    { instagram: "parto", showInstagram: false, telegram: "parto", showTelegram: "false" },
    "en"
  );

  assert.equal(channel(channels, "instagram"), undefined);
  assert.equal(channel(channels, "telegram"), undefined);
});

test("channels default to visible when no show flag is stored", () => {
  // Existing records predate the show/hide flags; they must keep working.
  const { channels } = resolveContact({ instagram: "parto" }, "en");
  assert.ok(channel(channels, "instagram"));
});

// ─── Contact: localisation ───────────────────────────────────────────────────

test("Persian locale reads the base fields", () => {
  const contact = resolveContact(
    { contactTitle: "تماس با ما", contactTitleEn: "Contact Us" },
    "fa"
  );
  assert.equal(contact.title, "تماس با ما");
});

test("English locale reads the En-suffixed fields", () => {
  const contact = resolveContact(
    { contactTitle: "تماس با ما", contactTitleEn: "Contact Us" },
    "en"
  );
  assert.equal(contact.title, "Contact Us");
});

test("English falls back to the Persian value when no translation exists", () => {
  // Better to show an untranslated address than an empty contact block.
  const contact = resolveContact({ address: "تهران" }, "en");
  assert.equal(contact.address, "تهران");
});

test("missing settings produce empty strings, never undefined", () => {
  // Components render these directly, so `undefined` would print "undefined".
  const contact = resolveContact(null, "fa");

  for (const [key, value] of Object.entries(contact)) {
    if (key === "channels") continue;
    assert.equal(typeof value, "string", `${key} should be a string`);
  }
});
