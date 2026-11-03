import { categories, type NewsArticle } from '../../src/lib/news-model';

export const fixtureNews: NewsArticle[] = categories.flatMap(category => [1, 2, 3, 4].map(n => ({
  category: category.slug,
  status: 'preview' as const,
  slug: `preview-${n}`,
  title: n === 1 ? `【本地预览】${category.name}长标题排版与换行验证：开放计算系统的研究协作、技术交流与应用实践` : `【本地预览】${category.name}第 ${n} 条排版样例`,
  publishedAt: `2026-${String(11 - n).padStart(2, '0')}-20`,
  summary: '仅用于本地验证列表、详情和链接，不代表真实新闻或研究成果。',
  source: '本地交互验收',
  body: ['ISOC_PREVIEW_ONLY：此内容是界面验收数据，正式构建不会包含本稿件。', '用于验证首页最多显示三条、分类页保留第四条，以及手机端长标题自然换行。'],
  ...(category.slug === 'ai-monthly' ? { issue: `2026-${String(11 - n).padStart(2, '0')}` } : {}),
})));
