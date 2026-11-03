import { test, expect } from '@playwright/test';
import { categories } from '../../src/lib/news-model';
import { mkdirSync } from 'node:fs';

for (const width of [1440, 390]) {
  test(`正式首页 ${width}px：顺序、四分类空态、无溢出和截图`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('开放计算系统研究');
    const positions = await page.locator('.hero, .home-about, .home-news, .site-footer').evaluateAll(els => els.map(e => e.getBoundingClientRect().top));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const category of categories) {
      await page.getByRole('tab', { name: category.name }).click();
      await expect(page.getByRole('tabpanel')).toHaveText('暂无已发布内容');
      await expect(page.locator('.news-more')).toHaveAttribute('href', `/news/${category.slug}/`);
      await expect(page).toHaveURL('http://127.0.0.1:4321/');
    }
    await page.getByRole('tab', { name: '院内动态' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      const tabs = await page.getByRole('tab').evaluateAll(els => els.map(e => e.getBoundingClientRect().top));
      expect(tabs[0]).toBe(tabs[1]); expect(tabs[2]).toBe(tabs[3]); expect(tabs[2]).toBeGreaterThan(tabs[0]);
    }
    mkdirSync('.local/screenshots', { recursive: true });
    await page.screenshot({ path: `.local/screenshots/home-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
  test(`预览稿 ${width}px：0/1/3/4 收合、最新三条、第四条与详情`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const heights: number[] = [];
    for (const count of [0, 1, 3, 4]) {
      await page.goto(`http://127.0.0.1:4322/preview/${count}/`);
      for (const category of categories) {
        await page.getByRole('tab', { name: category.name }).click();
        await expect(page.getByRole('tabpanel').locator('li')).toHaveCount(Math.min(count, 3));
        const dates = await page.getByRole('tabpanel').locator('time').allTextContents();
        expect(dates).toEqual([...dates].sort().reverse());
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      heights.push((await page.locator('.home-news').boundingBox())!.height);
    }
    expect(heights[1]).toBeGreaterThan(heights[0]);
    expect(heights[2]).toBeGreaterThan(heights[1]);
    expect(heights[3]).toBe(heights[2]);
    for (const category of categories) {
      await page.goto('http://127.0.0.1:4322/preview/4/');
      await page.getByRole('tab', { name: category.name }).click();
      await page.locator('.news-more').click();
      await expect(page).toHaveURL(`http://127.0.0.1:4322/news/${category.slug}/`);
      await expect(page.locator('.news-list li')).toHaveCount(4);
      await page.locator('.news-list li').nth(3).getByRole('link').click();
      await expect(page.locator('h1')).toContainText('第 4 条');
      await expect(page.locator('article')).toContainText('ISOC_PREVIEW_ONLY');
      if (category.slug === 'ai-monthly') await expect(page).toHaveURL('http://127.0.0.1:4322/news/ai-monthly/2026-07/');
      await page.getByRole('link', { name: `返回${category.name}` }).click();
      await expect(page.locator('.news-list li')).toHaveCount(4);
    }
  });
  test(`导航与内容页 ${width}px：链接、菜单和无横向溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/research/', '/about/', '/organization/', '/registration/', '/news/', ...categories.map(c => `/news/${c.slug}/`)]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const links = await page.locator('a[href^="/"]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('href')!))]);
      for (const link of links) {
        expect((await page.request.get(link)).status()).toBe(200);
        if (link.includes('#')) {
          const target = await page.request.get(link.split('#')[0]);
          expect(await target.text()).toContain(`id="${link.split('#')[1]}"`);
        }
      }
    }
    await page.goto('/');
    if (width === 390) {
      const toggle = page.locator('.menu-toggle');
      await toggle.focus(); await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Tab'); await expect(page.locator('#primary-nav a').first()).toBeFocused();
      await page.keyboard.press('Escape'); await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click(); await page.locator('#primary-nav').getByRole('link', { name: '研究方向' }).click();
      await expect(page).toHaveURL(/\/research\/$/);
    } else {
      await page.locator('#primary-nav').getByRole('link', { name: '研究方向' }).click();
      await expect(page).toHaveURL(/\/research\/$/);
    }
    await page.goto('/'); await page.locator('.home-about').getByRole('link').click();
    await expect(page).toHaveURL(/\/about\/$/);
  });
}
test('键盘新闻标签、跳至正文及未发布路由', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: '跳至正文' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('main')).toBeFocused();
  await page.getByRole('tab', { name: '院内动态' }).focus();
  await page.keyboard.press('ArrowRight'); await expect(page.getByRole('tab', { name: '科研进展' })).toBeFocused();
  await expect(page.getByRole('tab', { name: '科研进展' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End'); await expect(page.getByRole('tab', { name: 'AI 月报' })).toBeFocused();
  await page.keyboard.press('Home'); await expect(page.getByRole('tab', { name: '院内动态' })).toBeFocused();
  for (const path of ['/preview/0/', '/news/institute/preview-1/', '/news/ai-monthly/2026-10/', '/_reference/', '/.local/']) expect((await page.request.get(path)).status()).toBe(404);
});
test('不运行 JavaScript 仍可访问全部新闻分类', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('noscript a')).toHaveCount(4);
  await page.locator('noscript').getByRole('link', { name: 'AI 月报' }).click();
  await expect(page.locator('h1')).toHaveText('AI 月报');
  await context.close();
});
