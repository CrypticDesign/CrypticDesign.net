import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:3100";
const outDir = process.argv[3] || "artifacts/CRY-496";
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base + "/professional/inquiry", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Continue to email" }).click();
assert.equal(await page.locator('input[name="name"]').evaluate(el => el.validity.valueMissing), true);
const values = { name: "QA & Design + 雪", email: "qa+design@example.com", organization: "QA / R&D?", message: "A workflow & prototype\nSecond line: # ? % +", stage: "Prototype #2", support: "UX & Interaction", timing: "Q4 / 2026", budget: "Scoped & bounded", link: "https://example.com/?one=1&two=2#proof" };
for (const [name,value] of Object.entries(values)) {
  const field = page.locator('[name="'+name+'"]');
  if (name === "support") await field.selectOption(value); else await field.fill(value);
}
assert.equal(await page.locator("form").evaluate(form => form.checkValidity()), true);
const focus = [];
await page.locator('[name="name"]').focus();
for(let i=0;i<11;i++) {
  const fact = await page.evaluate(()=>{
    const element=document.activeElement;
    const style=getComputedStyle(element);
    const rect=element.getBoundingClientRect();
    return {name:element.getAttribute("name")||element.textContent?.trim(),outline:style.outlineStyle,width:rect.width,height:rect.height};
  });
  assert.ok(fact.width>=44 && fact.height>=44, "undersized control: "+fact.name);
  assert.notEqual(fact.outline,"none","focus missing: "+fact.name);
  focus.push(fact);
  await page.keyboard.press("Tab");
}
const cdp = await page.context().newCDPSession(page);
await cdp.send("Page.enable");
const navigation = new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error("No mail-client navigation observed")),10000);
  cdp.on("Page.frameRequestedNavigation", event=>{
    if(event.url.startsWith("mailto:")) { clearTimeout(timer); resolve(event.url); }
  });
});
await page.getByRole("button", { name: "Continue to email" }).click();
const mail = new URL(await navigation);
assert.equal(mail.protocol,"mailto:");
assert.equal(mail.pathname,"robert.croft@crypticdesign.net");
assert.deepEqual([...mail.searchParams.keys()],["subject","body"]);
for(const value of Object.values(values)) assert.ok(mail.searchParams.get("body").includes(value));
const formText=await page.locator("form").innerText();
assert.doesNotMatch(formText,/Message Sent|Submitted|successfully sent/i);
assert.ok(await page.getByRole("link",{name:"robert.croft@crypticdesign.net"}).isVisible());
assert.equal(await page.locator('[name="message"]').inputValue(),values.message);
const evidence={base,browser:"chromium",version:browser.version(),width:390,generated:new Date().toISOString(),requiredValidation:true,encodedFields:Object.keys(values),mailClientNavigation:true,falseSuccessAbsent:true,fallbackVisible:true,formRetained:true,keyboard:focus,pass:true};
await writeFile(outDir+"/inquiry-e2e.json",JSON.stringify(evidence,null,2));
await browser.close();
console.log("Professional inquiry E2E: PASS; 9 encoded fields, required validation, 11 keyboard targets, truthful handoff and fallback.");
