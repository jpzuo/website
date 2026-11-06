import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const base = import.meta.env.BASE_URL;

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  const sortedPosts = blog.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'ZUO · 思考与工程',
    description: '全栈工程师的技术主页与数字花园。专注于系统架构、分布式工程与现代 Web 排版美学。',
    site: context.site || 'https://jpzuo.github.io',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `${base}blog/${post.id}/`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
