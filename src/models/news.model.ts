import { getPool } from "./db/pool";
import { CreateNewsType, UpdateNewsType } from "../schemaValidation/news.schema";

class NewsModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.news ORDER BY publish_date DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.news WHERE id = $1`,
      values: [id],
    });
  }

  async getBySlug(slug: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.news WHERE slug = $1`,
      values: [slug],
    });
  }

  async insert(data: CreateNewsType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO posts.news (title, slug, cover_image, description, content, author, publish_date, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values: [
        data.title,
        data.slug,

        data.cover_image,
        data.description || null,
        data.content,
        data.author,
        data.publish_date,
        data.draft ?? false
      ],
    });
  }

  async update(id: string, data: UpdateNewsType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    setClause += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE posts.news SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM posts.news WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new NewsModel();

