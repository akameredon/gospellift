import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'gospellift-mobile-smoke.png', fullPage: true });
  assert.match(await page.title(), /GospelLift/i);
  assert.equal(await page.locator('#brain').count(), 1);
  assert.equal(await page.locator('#artistForm').count(), 1);
  assert.equal(await page.locator('a[href="privacy.html"]').count(), 1);
  assert.equal(await page.locator('a[href="terms.html"]').count(), 1);

  // Responsive layout must not introduce horizontal overflow at a common phone width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, 'Mobile layout has horizontal overflow');

  await page.getByRole('button', { name: 'Genre', exact: true }).click();
  assert.match(await page.locator('#brainHelp').innerText(), /Genre describes/i);
  await page.locator('#artist').fill('Test Artist');
  await page.locator('#song').fill('Test Song');
  await page.getByRole('button', { name: 'Prepare my artist brief' }).click();
  assert.equal(await page.locator('#resultArea').isVisible(), true);
  assert.match(await page.locator('#bio').innerText(), /Test Artist/);
  assert.match(await page.locator('#caption').innerText(), /Test Song/);
  assert.deepEqual(errors, [], 'Browser JavaScript errors were detected');
  console.log('PASS: mobile viewport, Brain Activator, brief generation, links and browser console.');
} finally {
  await browser.close();
}
