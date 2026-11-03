import rawNews from '../data/news.json';
import { publishedNews, sortNews, validateNews, type NewsArticle } from './news-model';

// 双重开关：生产构建无论环境变量如何均排除本地预览稿。
export const isFixturePreview = import.meta.env.DEV && process.env.ISOC_PREVIEW === '1';
export async function getNews(): Promise<NewsArticle[]> {
  if (isFixturePreview) {
    const { fixtureNews } = await import('../../tests/fixtures/news');
    validateNews(fixtureNews);
    return sortNews(fixtureNews);
  }
  return publishedNews(rawNews as NewsArticle[]);
}
