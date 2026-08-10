import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchCMS,
  getClientName,
  getLocalizedField,
  getLocalizedOptional,
  getSettings,
  mapSettings,
  mapProject,
} from "./data.ts";

test("CMS reads use no-store and settings map the public flat response", async () => {
  const originalFetch = globalThis.fetch;
  let options: RequestInit | undefined;
  globalThis.fetch = (async (_input, init) => {
    options = init;
    return {
      ok: true,
      json: async () => ({
        siteName: "Parto FA",
        siteNameEn: "Parto",
        tagline: "Tagline FA",
        taglineEn: "Lasting",
        logo: "https://example.com/logo.svg",
        instagram: "https://instagram.com/parto",
      }),
    } as Response;
  }) as typeof fetch;

  try {
    await fetchCMS("/projects");
    assert.equal(options?.cache, "no-store");

    const settings = await getSettings("en");
    assert.equal(settings?.siteName, "Parto");
    assert.equal(settings?.tagline, "Lasting");
    assert.equal(settings?.logo, "https://example.com/logo.svg");
    assert.equal(settings?.socialLinks.instagram, "https://instagram.com/parto");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("settings mapping localizes English values with base-field fallback", () => {
  const raw = {
    siteName: "Parto FA",
    siteNameEn: "Parto",
    tagline: "Tagline FA",
    address: "Tehran FA",
    addressEn: "Tehran",
  };
  assert.equal(mapSettings(raw, "fa").siteName, "Parto FA");
  assert.equal(mapSettings(raw, "en").siteName, "Parto");
  assert.equal(mapSettings(raw, "en").tagline, "Tagline FA");
  assert.equal(mapSettings(raw, "en").address, "Tehran");
});

test("Client name localization uses name/englishName with the documented English fallback", () => {
  const client = { name: "نام فارسی", englishName: "English name" };
  assert.equal(getClientName(client, "fa"), "نام فارسی");
  assert.equal(getClientName(client, "en"), "English name");
  assert.equal(getClientName({ ...client, englishName: null }, "en"), "نام فارسی");
});

test("localized description and location use Persian values with English fallback", () => {
  const item = {
    descriptionEn: "English description",
    descriptionFa: "توضیحات فارسی",
    locationEn: "Tehran",
    locationFa: null,
  };
  assert.equal(getLocalizedOptional(item, "description", "fa"), "توضیحات فارسی");
  assert.equal(getLocalizedOptional(item, "description", "en"), "English description");
  assert.equal(getLocalizedOptional(item, "location", "fa"), "Tehran");
  assert.equal(getLocalizedOptional(item, "location", "en"), "Tehran");
});

test("Service and Team canonical localized fields map without aliases", () => {
  assert.equal(getLocalizedField({ titleEn: "Design", titleFa: "طراحی" }, "title", "fa"), "طراحی");
  assert.equal(getLocalizedField({ nameEn: "Member", nameFa: "عضو" }, "name", "en"), "Member");
  assert.equal(getLocalizedOptional({ biographyEn: "Bio", biographyFa: "زندگینامه" }, "biography", "fa"), "زندگینامه");
});

test("Project mapper consumes the public clients relation", () => {
  const client = {
    id: "client-1", slug: "client", name: "مشتری", englishName: "Client",
    descriptionEn: null, descriptionFa: null, logoId: null, coverImageId: null,
    website: null, locationEn: null, locationFa: null, featured: false,
    displayOrder: 0, status: "PUBLISHED",
  };
  const project = {
    id: "project-1", slug: "project", titleEn: "Project", titleFa: null,
    descriptionEn: null, descriptionFa: null, thumbnailId: null, coverImageId: null,
    isFeatured: false, status: "PUBLISHED", year: null, locationEn: null,
    locationFa: null, clients: [client],
  };

  assert.equal(mapProject(project, "en").clients[0].name, "Client");
});
