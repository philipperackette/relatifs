/* global dDiag */
import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const URL_PAGE = pathToFileURL(resolve("index.html")).href;
const MOINS = "−";

// Lit « a + (b) » ou « a − (b) » tel qu'affiché dans les tableaux.
function evaluer(expr) {
  const m = expr.match(/^(-?\d+) ([+−]) \(?(-?\d+)\)?$/);
  expect(m, `expression illisible : ${expr}`).not.toBeNull();
  const a = Number(m[1]), b = Number(m[3]);
  return { a, b, moins: m[2] === MOINS, valeur: m[2] === MOINS ? a - b : a + b };
}

let erreurs;
test.beforeEach(async ({ page }) => {
  erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto(URL_PAGE);
});
test.afterEach(() => {
  expect(erreurs, "erreurs JavaScript").toEqual([]);
});

test("accueil : trois modules, pas de défilement horizontal", async ({ page }) => {
  await expect(page.locator("#titre-appli")).toHaveText("Relatifs — choisir un module");
  await expect(page.locator("#vue-accueil .choice")).toHaveCount(3);
  await expect(page.locator("#btnAccueil")).toBeHidden();
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(largeur).toBeLessThanOrEqual(0);
});

test("un seul calcul : la droite graduée est tracée", async ({ page }) => {
  await page.click("#goUn");
  await expect(page.locator("#vue-un")).toBeVisible();
  await expect(page.locator("#btnAccueil")).toBeVisible();
  await page.fill("#a", "3");
  await page.selectOption("#operateur", "-");
  await page.fill("#b", "-5");
  await page.click("#btnTracer");
  const pixels = await page.evaluate(() => {
    const c = document.getElementById("cadre");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
  expect(pixels).toBeGreaterThan(1000);
  await page.click("#btnEffacer");
  await expect(page.locator("#a")).toHaveValue("0");
  await page.click("#btnAccueil");
  await expect(page.locator("#vue-accueil")).toBeVisible();
});

test("plusieurs calculs : résultats et réécriture des soustractions", async ({ page }) => {
  await page.click("#goPlusieurs");
  await page.fill("#nb", "30");
  await page.click("#btnGenerer");
  const lignes = page.locator("#tbody tr");
  await expect(lignes).toHaveCount(30);
  await expect(page.locator("#tbody .result").first()).toHaveText("—");
  await page.click("#btnCalculer");
  for (let i = 0; i < 30; i++) {
    const cellules = lignes.nth(i).locator("td");
    const e = evaluer((await cellules.nth(1).innerText()).trim());
    expect(e.a).toBeGreaterThanOrEqual(-10);
    expect(e.a).toBeLessThanOrEqual(10);
    await expect(lignes.nth(i).locator(".result")).toHaveText(String(e.valeur));
    const attendu = e.moins ? `${e.a} + ${-e.b < 0 ? `(${-e.b})` : -e.b}` : "";
    await expect(cellules.nth(2)).toHaveText(attendu);
  }
  await expect(page.locator("#chrono")).not.toHaveText("00 min 00 s", { timeout: 3000 });
});

test("plusieurs calculs : « Flèches → » ouvre la droite puis revient à la liste", async ({ page }) => {
  await page.click("#goPlusieurs");
  await page.click("#btnGenerer");
  const e = evaluer((await page.locator("#tbody tr").first().locator("td").nth(1).innerText()).trim());
  await page.locator("#tbody .see-btn").first().click();
  await expect(page.locator("#vue-un")).toBeVisible();
  await expect(page.locator("#a")).toHaveValue(String(e.a));
  await expect(page.locator("#b")).toHaveValue(String(e.b));
  await expect(page.locator("#btnRetour")).toBeVisible();
  await page.click("#btnRetour");
  await expect(page.locator("#vue-plusieurs")).toBeVisible();
  await expect(page.locator("#tbody tr")).toHaveCount(10);
});

test("diagnostic : correction, bouton ± et solutions", async ({ page }) => {
  await page.click("#goDiagnostic");
  await page.click("#d-gen");
  const lignes = page.locator("#d-tbody tr");
  await expect(lignes).toHaveCount(8);

  const premiere = lignes.first();
  const e = evaluer((await premiere.locator("td").nth(1).innerText()).trim());
  await premiere.locator(".ans").fill(String(Math.abs(e.valeur)));
  if (e.valeur < 0) await premiere.locator(".btn-sign").click();
  await expect(premiere.locator(".ans")).toHaveValue(String(e.valeur));
  await page.click("#d-corr");
  await expect(premiere.locator(".diag")).toHaveText("✅ Correct");
  await expect(premiere.locator(".res")).toHaveText(String(e.valeur));
  await expect(page.locator("#d-ok")).toHaveText("1");
  await expect(page.locator("#d-bad")).toHaveText("7");
  await expect(lignes.nth(1).locator(".diag")).toHaveText("Aucune réponse saisie.");

  await page.click("#d-show");
  await expect(page.locator("#d-ok")).toHaveText("8");
  await expect(page.locator("#d-bad")).toHaveText("0");

  await page.click("#d-clear");
  await expect(lignes).toHaveCount(1);
  await expect(page.locator("#d-ok")).toHaveText("0");
});

test("diagnostic : erreurs typiques reconnues", async ({ page }) => {
  const cas = await page.evaluate(() => [
    dDiag(5, "-", 8, 3).text,      // b − a au lieu de a − b
    dDiag(4, "-", -3, 1).text,     // a − (−b) traité comme a − b
    dDiag(-7, "+", 3, -10).text,   // valeurs absolues additionnées
    dDiag(0, "+", -6, 6).text,     // 0 + (−b) = +|b|
    dDiag(6, "+", 7, 12).text,     // petit écart
    dDiag(6, "+", 7, 13).text,
  ]);
  expect(cas[0]).toContain("Inversion de la soustraction");
  expect(cas[1]).toContain("Double signe oublié");
  expect(cas[2]).toContain("signe du plus grand");
  expect(cas[3]).toContain("Erreur sur 0");
  expect(cas[4]).toContain("Glissade arithmétique");
  expect(cas[5]).toBe("✅ Correct");
});

test("diagnostic : saisie invalide signalée", async ({ page }) => {
  await page.click("#goDiagnostic");
  await page.click("#d-gen");
  const champ = page.locator("#d-tbody .ans").first();
  await champ.fill("3a");
  await expect(champ).toHaveClass(/invalid/);
  await champ.fill("-3");
  await expect(champ).not.toHaveClass(/invalid/);
});
