import { getPool } from "./db/pool";
import { CreateShortCourseType, UpdateShortCourseType } from "../schemaValidation/workshops.schema";

class ShortCoursesModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.short_courses ORDER BY created_at DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.short_courses WHERE id = $1`,
      values: [id],
    });
  }

  async getBySlug(slug: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.short_courses WHERE slug = $1`,
      values: [slug],
    });
  }

  async insert(data: CreateShortCourseType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO workshops.short_courses (title, slug, cover_image, description, content, duration, price, location, language, level, experience_requirements, objectives, structure, offer_by, summarize, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      values: [
        data.title,
        data.slug,

        data.cover_image || null,
        data.description || null,
        data.content || null,
        data.duration || null,
        data.price || null,
        data.location || null,
        data.language || null,
        data.level || null,
        data.experience_requirements || null,
        data.objectives || null,
        data.structure || null,
        data.offer_by || null,
        data.summarize || null,
        data.draft || false,
      ],
    });
  }

  async update(id: string, data: UpdateShortCourseType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    setClause += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE workshops.short_courses SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM workshops.short_courses WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new ShortCoursesModel();
