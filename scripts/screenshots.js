/* Drive the exported web build in a phone-sized viewport and capture
 * Play Store screenshots. Run: node scripts/screenshots.js */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'store', 'screenshots');
const URL = 'http://localhost:8088';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, text, { last = false } = {}) {
  // Find the innermost matching element, scroll it into view, and return
  // its center so we can send a real (trusted) mouse click there.
  const point = await page.evaluate(
    (t, pickLast) => {
      let nodes = [...document.querySelectorAll('div, span')].filter(
        (el) => el.innerText && el.innerText.trim() === t && el.checkVisibility(),
      );
      nodes = nodes.filter((el) => !nodes.some((other) => other !== el && el.contains(other)));
      if (!nodes.length) return null;
      const el = pickLast ? nodes[nodes.length - 1] : nodes[0];
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    text,
    last,
  );
  if (!point) throw new Error(`clickText: "${text}" not found`);
  await page.mouse.click(point.x, point.y);
  await sleep(400);
}

async function typeInto(page, selector, value, index = 0) {
  const handles = await page.$$(selector);
  if (!handles[index]) throw new Error(`typeInto: ${selector}[${index}] not found`);
  await handles[index].click();
  await handles[index].type(value, { delay: 10 });
  await sleep(150);
}

async function waitForText(page, text, timeout = 10000) {
  await page.waitForFunction(
    (t) => document.body.textContent.includes(t),
    { timeout, polling: 200 },
    text,
  );
  await sleep(300);
}

async function shot(page, name) {
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, name) });
  console.log(`captured ${name}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(1500);

  // --- Home: set a sobriety date so the counter shows ---
  // (skipped when localStorage already has one from a previous run)
  if (await page.$('input')) {
    const soberDate = new Date(Date.now() - 127 * 86400000); // 127 days sober
    const iso = soberDate.toISOString().slice(0, 10);
    await typeInto(page, 'input', iso);
    await clickText(page, 'Save');
    await sleep(600);
  }

  // --- Steps: complete 1-3, working on 4 ---
  await clickText(page, 'Steps', { last: true });
  await waitForText(page, 'THE PROGRAM');
  for (const step of ['Honesty', 'Hope', 'Surrender']) {
    await clickText(page, step);
    await clickText(page, 'Complete', { last: true });
    await clickText(page, step); // collapse
  }
  await clickText(page, 'Courage');
  await clickText(page, 'Working on it', { last: true });
  await clickText(page, 'Courage');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '02-steps.png');

  // --- Journal: write two entries ---
  await clickText(page, 'Journal', { last: true });
  await waitForText(page, 'PRIVATE'); // kicker varies by platform (web vs native)
  const entries = [
    {
      prompt: 'What am I grateful for today?',
      mood: '😄',
      text: 'Day 127. Grateful for my morning walk, honest coffee with Mike, and that the cravings felt quieter today. Keeping it simple: one day at a time.',
    },
    {
      prompt: 'What is one thing I did well today?',
      mood: '🙂',
      text: 'I picked up the phone instead of isolating. Small win, big deal.',
    },
  ];
  for (const entry of entries) {
    const plusPoint = await page.evaluate(() => {
      // The + button is the only round 44x44 pressable in the title row
      const candidates = [...document.querySelectorAll('div')].filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          el.checkVisibility() &&
          Math.round(r.width) === 44 &&
          Math.round(r.height) === 44 &&
          r.top < 250
        );
      });
      const plus = candidates[candidates.length - 1];
      if (!plus) return null;
      const r = plus.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    if (!plusPoint) throw new Error('journal + button not found');
    await page.mouse.click(plusPoint.x, plusPoint.y);
    await sleep(500);
    if (!(await page.$('textarea'))) throw new Error('journal composer did not open');
    await clickText(page, entry.prompt);
    await clickText(page, entry.mood);
    await typeInto(page, 'textarea', entry.text);
    await clickText(page, 'Save entry');
    await sleep(600);
  }
  await shot(page, '03-journal.png');

  // --- Sponsor: add a contact ---
  await clickText(page, 'Sponsor', { last: true });
  await waitForText(page, 'MY PEOPLE');
  const addPoint = await page.evaluate(() => {
    // Icons render as font glyphs on web, so locate the add button
    // geometrically: it sits at the right edge of the MY PEOPLE header row.
    const label = [...document.querySelectorAll('div, span')].find(
      (el) => el.innerText && el.innerText.trim() === 'MY PEOPLE' && el.checkVisibility(),
    );
    if (!label) return null;
    let row = label.parentElement;
    while (row && row.getBoundingClientRect().width < 300) row = row.parentElement;
    if (!row) return null;
    label.scrollIntoView({ block: 'center', behavior: 'instant' });
    const glyph = [...row.querySelectorAll('*')].find(
      (el) =>
        el.children.length === 0 &&
        el.textContent.length === 1 &&
        el.textContent.charCodeAt(0) >= 0xe000,
    );
    if (!glyph) return null;
    const r = glyph.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (addPoint) {
    await page.mouse.click(addPoint.x, addPoint.y);
  }
  if (!addPoint) {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll('div')]
        .filter((el) => el.checkVisibility() && el.children.length === 0 && el.innerText)
        .map((el) => el.innerText.trim()),
    );
    await page.screenshot({ path: path.join(OUT, 'debug-sponsor.png') });
    throw new Error(`sponsor add button not found; visible: ${JSON.stringify(texts.slice(0, 40))}`);
  }
  try {
    await page.waitForSelector('input', { timeout: 5000 });
  } catch {
    await page.screenshot({ path: path.join(OUT, 'debug-sponsor-form.png') });
    throw new Error('sponsor form did not open (see debug-sponsor-form.png)');
  }
  await typeInto(page, 'input', 'Mike R.', 0);
  await typeInto(page, 'input', '555 0142', 1);
  await clickText(page, 'Add to circle');
  await sleep(600);
  await shot(page, '04-sponsor.png');

  // --- Home last, so the counter screenshot is the hero ---
  await clickText(page, 'Home', { last: true });
  await sleep(800);
  await shot(page, '01-home.png');

  await browser.close();
  console.log('all screenshots captured');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
