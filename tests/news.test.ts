import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categories, latestNews, categoryNews, publishedNews, validateNews, articleHref, type NewsArticle } from '../src/lib/news-model';
import { fixtureNews } from './fixtures/news';

for (const category of categories) {
  for (const count of [0, 1, 3, 4]) {
    test(`${category.name} ${count} 条：倒序、上限和完整列表`, () => {
      const records = categoryNews(fixtureNews, category.slug).slice(0, count).reverse();
      const latest = latestNews(records, category.slug);
      assert.equal(latest.length, Math.min(count, 3));
      assert.equal(categoryNews(records, category.slug).length, count);
      assert.deepEqual(latest.map(a => a.publishedAt), latest.map(a => a.publishedAt).sort().reverse());
      if (count === 4) assert(!latest.some(a => articleHref(a) === articleHref(categoryNews(records, category.slug)[3])));
    });
  }
}
test('正式内容排除预览、草稿及未来稿件', () => {
  const published: NewsArticle = { ...fixtureNews[0], status: 'published' };
  const draft: NewsArticle = { ...fixtureNews[1], status: 'draft', attachments: [{ title: '内部稿', path: '/private.pdf', approved: false }] };
  const future: NewsArticle = { ...fixtureNews[2], status: 'published', publishedAt: '2099-01-01' };
  assert.deepEqual(publishedNews([published, draft, future, ...fixtureNews.slice(1)], '2026-11-03'), [published]);
});
test('同月重复期号无法发布，月报地址取期号', () => {
  const monthly = fixtureNews.find(a => a.category === 'ai-monthly')!;
  assert.equal(articleHref(monthly), '/news/ai-monthly/2026-10/');
  assert.throws(() => validateNews([monthly, { ...monthly, slug: 'different-slug' }]), /重复地址或月报期号/);
  assert.throws(() => validateNews([{ ...monthly, issue: '2026-13' }]), /有效的 YYYY-MM/);
});
test('无效日期、未核准附件和路径穿越被拒绝', () => {
  assert.throws(() => validateNews([{ ...fixtureNews[0], publishedAt: '2026-02-31' }]), /无效发布日期/);
  assert.throws(() => validateNews([{ ...fixtureNews[0], attachments: [{ title: '内部', path: '/attachments/draft.pdf', approved: false }] }]), /附件必须核准/);
  assert.throws(() => validateNews([{ ...fixtureNews[0], attachments: [{ title: '内部', path: '/attachments/../private.pdf', approved: true }] }]), /附件必须核准/);
});
