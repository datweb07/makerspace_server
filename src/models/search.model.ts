import { getPool } from "./db/pool";

class SearchModel {
  async globalSearch(query: string, lang: string = "vi") {
    const searchTerm = `%${query}%`;
    const dbQuery = `
      SELECT id, title, slug, cover_image, description, 'news' as type, created_at
      FROM posts.news
      WHERE title ILIKE $1 OR description ILIKE $1
      
      UNION ALL
      
      SELECT id, title, slug, cover_image, description, 'events' as type, created_at
      FROM posts.events
      WHERE title ILIKE $1 OR description ILIKE $1
      

      UNION ALL
      
      SELECT id, title, slug, cover_image, description, 'student_life' as type, created_at
      FROM posts.student_life
      WHERE title ILIKE $1 OR description ILIKE $1
      
      UNION ALL
      
      SELECT id, title, slug, cover_image, description, 'short_courses' as type, created_at
      FROM workshops.short_courses
      WHERE title ILIKE $1 OR description ILIKE $1
      
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    return getPool(lang).query({
      text: dbQuery,
      values: [searchTerm],
    });
  }
}

export default new SearchModel();

