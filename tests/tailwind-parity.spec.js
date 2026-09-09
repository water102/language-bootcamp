import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// Captured from the React application before enabling Preflight, not from a reimplementation.
const baselinePath = 'tests/fixtures/preflight-baseline.json';
const routes = ['dashboard','roadmap','schedule','lessons','speaking','writing','flashcards','grammar','pronunciation','assessment','ai-tutor','error-log'];
test('Tailwind preserves all study views and native IPA dialog', async ({ page }) => {
  test.setTimeout(120000);
  await page.clock.setFixedTime(new Date('2026-09-09T05:00:00Z'));
  const results = {};
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/#/dashboard');
    await page.addStyleTag({content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }'});
    await page.evaluate(() => document.fonts.ready);
    for (const route of routes) {
      await page.evaluate(route => { location.hash = '/' + route; }, route);
      await expect(page.locator(`#view-${route}`)).toHaveClass(/active/);
      const capture = async key => {
        results[`${width}/${key}`] = await page.evaluate(() => {
          const properties = ['display','fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderRadius','padding','margin','gap','textAlign','listStyleType','verticalAlign'];
          const root = document.querySelector('dialog[open]') || document.querySelector('.page-view.active');
          const nodes = [root, ...root.querySelectorAll('*')].filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height);
          // Stable content-based sampling: adding utility classes must not change sample identity.
          const seen = new Set();
          return nodes.filter(el => {
            const key = el.tagName + ':' + el.id + ':' + el.textContent.slice(0,40) + ':' + el.parentElement?.tagName;
            if (seen.has(key)) return false;
            seen.add(key); return true;
          }).map(el => {
            const css = getComputedStyle(el), rect = el.getBoundingClientRect();
            return { tag: el.tagName, id: el.id, box: [rect.x,rect.y,rect.width,rect.height].map(v => Math.round(v * 10) / 10), style: properties.map(p => css[p]) };
          });
        });
      };
      await capture(route);
      if (route === 'pronunciation') {
        await page.locator('[data-lesson="ipa-1"]').click();
        await capture('ipa-dialog');
        await page.locator('#ipa-lesson [data-close]').click();
      }
    }
  }
  if (process.env.CAPTURE_STYLE_BASELINE === '1') {
    fs.mkdirSync('tests/fixtures', {recursive: true});
    fs.writeFileSync(baselinePath, JSON.stringify(results));
  } else {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const differences = [];
    for (const [view, nodes] of Object.entries(baseline)) {
      const actual = results[view];
      if (actual.length !== nodes.length) differences.push({view, counts: [nodes.length, actual.length]});
      nodes.forEach((node, i) => {
        if (JSON.stringify(node) !== JSON.stringify(actual[i])) differences.push({view, index: i, expected: node, actual: actual[i]});
      });
    }
    fs.mkdirSync('test-results', {recursive: true});
    fs.writeFileSync('test-results/tailwind-style-diff.json', JSON.stringify(differences, null, 2));
    expect(differences.slice(0, 6), `${differences.length} differences (see test-results/tailwind-style-diff.json)`).toEqual([]);
  }
});

test('Preflight border normalization and utility overrides are active', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const element = document.createElement('div');
    element.className = 'glass-card p-[12px]';
    document.body.appendChild(element);
    const cardPadding = getComputedStyle(element).padding;
    element.className = '';
    element.style.borderTopWidth = '1px';
    const style = getComputedStyle(element);
    const border = [style.borderTopWidth, style.borderTopStyle];
    element.remove();
    return {cardPadding, border};
  });
  expect(result).toEqual({cardPadding: '12px', border: ['1px','solid']});
});
