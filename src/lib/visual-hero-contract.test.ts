import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const singularisStyles = readFileSync("src/app/singularis.css", "utf8");
const singularisGamespace = readFileSync("src/components/SingularisGamespace.tsx", "utf8");
const productPage = readFileSync("src/app/products/[slug]/page.tsx", "utf8");

test("global hero artwork covers every container boundary at every breakpoint", () => {
  assert.match(globals, /\.visual-hero__image\{position:absolute;inset:0;width:100%;height:100%\}/);
  assert.match(globals, /\.visual-hero__image img\{width:100%;height:100%;object-fit:cover\}/);
  assert.doesNotMatch(globals, /\.visual-hero__image\{height:360px\}/);
});

test("Lifa uses its approved full-width franchise artwork", () => {
  assert.match(productPage, /product\.slug === "lifa"[\s\S]*?className="lifa-page__hero"[\s\S]*?src="\/images\/lifa-marketing-intro-01\.png"/);
  assert.match(globals, /\.lifa-page__hero,\.singularis-page__hero\{[^}]*width:100%;[^}]*height:clamp\(220px,28vw,390px\);[^}]*overflow:hidden/);
  assert.match(globals, /\.lifa-page__hero img,\.singularis-page__hero img\{width:100%;height:100%;object-fit:cover;object-position:center\}/);
});

test("Singularis public discovery includes full-width franchise artwork and product information", () => {
  assert.match(productPage, /product\.slug === "singularis"[\s\S]*?className="singularis-page__hero"[\s\S]*?src="\/images\/singularis\/SIN_IMG_OrbitalCarrierAndEscort_v01\.webp"/);
  assert.match(productPage, /className="singularis-page__heading"[\s\S]*?\{product\.description\}/);
  assert.match(productPage, /className="panel singularis-page__introduction"[\s\S]*?\{product\.summary\}/);
  assert.match(productPage, /className="singularis-page__world"[\s\S]*?The future opened\. Coordination did not keep pace\./);
  assert.match(productPage, /className="singularis-page__media"[\s\S]*?Game[\s\S]*?Animation[\s\S]*?Music/);
  assert.match(productPage, /SIN_IMG_OrbitalRingConstruction_v01\.webp[\s\S]*?SIN_IMG_CommandHallBriefing_v01\.webp[\s\S]*?SIN_IMG_CityLaunchSpectators_v01\.webp/);
  assert.match(globals, /\.lifa-page__hero,\.singularis-page__hero\{[^}]*width:100%;[^}]*height:clamp\(220px,28vw,390px\);[^}]*overflow:hidden/);
});

test("Singularis first-contact artwork sits outside the constrained content rail", () => {
  assert.match(singularisGamespace, /<section className=\{`sin-cgs[\s\S]*?\{state\.phase === "arrival" && <div className="sin-cgs__hero-art">[\s\S]*?<div className="sin-cgs__wrap">/);
  assert.doesNotMatch(singularisGamespace, /<div className="sin-cgs__wrap">[\s\S]*?<header className="sin-cgs__heading">\s*\{state\.phase === "arrival" && <div className="sin-cgs__hero-art">/);
  assert.match(singularisStyles, /\.sin-cgs__hero-art\{[^}]*width:100%;[^}]*margin:0 0 24px;[^}]*border-block:1px solid #1a2737/);
});
