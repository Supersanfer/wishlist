import assert from "node:assert/strict";
import { test } from "node:test";

import {
  generateImageFilename,
  imageExtension,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "./image-validation.ts";

function file(name: string, type: string): File {
  return new File(["x"], name, { type });
}

function sizedFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

test("validateImageFile: acepta JPG, PNG y WebP", () => {
  assert.strictEqual(validateImageFile(file("foto.jpg", "image/jpeg")).ok, true);
  assert.strictEqual(validateImageFile(file("foto.png", "image/png")).ok, true);
  assert.strictEqual(validateImageFile(file("foto.webp", "image/webp")).ok, true);
});

test("validateImageFile: rechaza formatos no permitidos", () => {
  const result = validateImageFile(file("foto.gif", "image/gif"));
  assert.strictEqual(result.ok, false);
  if (!result.ok) assert.strictEqual(result.error, "invalid-type");
});

test("validateImageFile: rechaza archivos demasiado grandes", () => {
  const result = validateImageFile(sizedFile("foto.jpg", "image/jpeg", MAX_IMAGE_SIZE_BYTES + 1));
  assert.strictEqual(result.ok, false);
  if (!result.ok) assert.strictEqual(result.error, "too-large");
});

test("validateImageFile: acepta archivos justo en el limite", () => {
  const result = validateImageFile(sizedFile("foto.jpg", "image/jpeg", MAX_IMAGE_SIZE_BYTES));
  assert.strictEqual(result.ok, true);
});

test("validateImageFile: rechaza fichero vacio o nulo", () => {
  assert.strictEqual(validateImageFile(null).error, "missing");
  assert.strictEqual(validateImageFile(undefined).error, "missing");
  assert.strictEqual(validateImageFile(new File([], "empty.jpg", { type: "image/jpeg" })).error, "missing");
});

test("imageExtension: reconoce extensiones validas", () => {
  assert.strictEqual(imageExtension("foto.jpg"), "jpeg");
  assert.strictEqual(imageExtension("foto.jpeg"), "jpeg");
  assert.strictEqual(imageExtension("foto.png"), "png");
  assert.strictEqual(imageExtension("foto.webp"), "webp");
  assert.strictEqual(imageExtension("foto.gif"), null);
});

test("generateImageFilename: genera nombre con extension y UUID", () => {
  const name = generateImageFilename("mi foto.JPEG");
  assert.ok(name);
  assert.match(name, /^[0-9a-f-]+\.jpeg$/);
});

test("generateImageFilename: devuelve null para extension no valida", () => {
  assert.strictEqual(generateImageFilename("foto.gif"), null);
});
