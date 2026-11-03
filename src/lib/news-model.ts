export const categories = [
  { slug: 'institute', name: '院内动态', description: '研究院事务、交流与活动' },
  { slug: 'research', name: '科研进展', description: '项目进展与研究成果' },
  { slug: 'notices', name: '通知公告', description: '面向公众的正式通知与公告' },
  { slug: 'ai-monthly', name: 'AI 月报', description: '按年月归档的人工智能研究与技术观察' },
] as const;
export type Category = typeof categories[number]['slug'];
export interface NewsArticle {
  slug: string;
  category: Category;
  status: 'draft' | 'published' | 'preview';
  title: string;
  publishedAt: string;
  summary: string;
  body: string[];
  source: string;
  issue?: string;
  attachments?: { title: string; path: string; approved: boolean }[];
}
export const categoryHref = (category: Category) => `/news/${category}/`;
export const articleHref = (article: NewsArticle) => `${categoryHref(article.category)}${article.category === 'ai-monthly' ? article.issue : article.slug}/`;

export function validateNews(articles: NewsArticle[]): void {
  const paths = new Set<string>();
  for (const article of articles) {
    if (!categories.some(c => c.slug === article.category)) throw new Error('无效新闻分类');
    if (!['draft', 'published', 'preview'].includes(article.status)) throw new Error('必须明确发布状态');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error('无效稿件地址');
    if (!article.title?.trim() || !article.summary?.trim() || !article.source?.trim() || !article.body?.length) throw new Error('稿件字段不完整');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt) || Number.isNaN(Date.parse(article.publishedAt)) || new Date(article.publishedAt).toISOString().slice(0, 10) !== article.publishedAt) throw new Error('无效发布日期');
    if (article.category === 'ai-monthly' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(article.issue ?? '')) throw new Error('月报必须填写有效的 YYYY-MM 期号');
    const path = articleHref(article);
    if (paths.has(path)) throw new Error(`重复地址或月报期号：${path}`);
    paths.add(path);
    for (const file of article.attachments ?? []) {
      if (!file.approved || !/^\/attachments\/[a-z0-9][a-z0-9-]*\.pdf$/.test(file.path)) throw new Error('附件必须核准且使用规范的公开 PDF 地址');
    }
  }
}

export function publishedNews(articles: NewsArticle[], today = new Date().toISOString().slice(0, 10)): NewsArticle[] {
  const published = articles.filter(a => a.status === 'published' && a.publishedAt <= today);
  validateNews(published);
  return sortNews(published);
}
export function sortNews(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || articleHref(a).localeCompare(articleHref(b)));
}
export function categoryNews(articles: NewsArticle[], category: Category): NewsArticle[] {
  return sortNews(articles.filter(a => a.category === category));
}
export function latestNews(articles: NewsArticle[], category: Category): NewsArticle[] {
  return categoryNews(articles, category).slice(0, 3);
}
