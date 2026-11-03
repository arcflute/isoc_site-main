import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { articleHref, categories, publishedNews, type NewsArticle } from '../src/lib/news-model';

const root = resolve('dist');
async function walk(directory: string): Promise<string[]> {
  const children = await readdir(directory);
  return (await Promise.all(children.map(async name => {
    const path = join(directory, name);
    return (await stat(path)).isDirectory() ? walk(path) : [path];
  }))).flat();
}
const raw = JSON.parse(await readFile('src/data/news.json', 'utf8')) as NewsArticle[];
const published = publishedNews(raw);
const pageRoutes = ['/', '/about/', '/research/', '/organization/', '/registration/', '/news/', ...categories.map(c => `/news/${c.slug}/`), ...published.map(articleHref)];
const allowedFiles = new Set(['404.html', 'brand/isoc-logo.jpeg', ...pageRoutes.map(route => `${route.slice(1)}index.html`), ...published.flatMap(a => a.attachments?.map(f => f.path.slice(1)) ?? [])]);
const publicAllowed = new Set(['brand/isoc-logo.jpeg', ...published.flatMap(a => a.attachments?.map(f => f.path.slice(1)) ?? [])]);
for (const file of await walk(resolve('public'))) {
  assert(publicAllowed.has(relative(resolve('public'), file).replaceAll('\\', '/')), `public 中存在未经核准的静态文件：${file}`);
}
const blockedStrings = ['ISOC_PREVIEW_ONLY', '【本地预览】', '本地交互验收', '_reference', '限内部交流用', '理事情况表', '证件类型', '政治面貌'];
for (const article of raw.filter(a => !published.includes(a))) {
  blockedStrings.push(article.title, article.summary, ...article.body, ...(article.attachments?.map(f => f.path) ?? []));
}
const files = await walk(root);
for (const file of files) {
  const path = relative(root, file).replaceAll('\\', '/');
  assert(allowedFiles.has(path) || /^_astro\/[\w.-]+\.(css|js)$/.test(path), `正式产物出现未允许文件：${path}`);
  if (/\.(html|css|js|json)$/.test(path)) {
    const content = await readFile(file, 'utf8');
    for (const marker of blockedStrings.filter(Boolean)) assert(!content.includes(marker), `${path} 含有非公开内容标记：${marker}`);
  }
}
for (const expected of allowedFiles) assert(files.some(file => relative(root, file).replaceAll('\\', '/') === expected), `缺少输出：${expected}`);
const hash = async (path: string) => createHash('sha256').update(await readFile(path)).digest('hex');
assert.equal(await hash('public/brand/isoc-logo.jpeg'), await hash('dist/brand/isoc-logo.jpeg'));
console.log(`正式产物检查通过：${pageRoutes.length + 1} 个页面，${published.length} 篇正式稿件，${files.length} 个文件；无测试稿、草稿、内部原件或未核准附件。`);
