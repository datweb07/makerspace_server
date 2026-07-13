import { getPool } from "./db/pool";
import { CreateDiyType, UpdateDiyType } from "../schemaValidation/workshops.schema";

class DiyModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.diy ORDER BY created_at DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.diy WHERE id = $1`,
      values: [id],
    });
  }

  async getBySlug(slug: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.diy WHERE slug = $1`,
      values: [slug],
    });
  }

  async insert(data: CreateDiyType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO workshops.diy (title, slug, cover_image, description, content, duration, difficulty, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values: [
        data.title,
        data.slug,

        data.cover_image || null,
        data.description || null,
        data.content || null,
        data.duration || null,
        data.difficulty || null,
        data.draft || false,
      ],
    });
  }

  async update(id: string, data: UpdateDiyType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    setClause += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE workshops.diy SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM workshops.diy WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new DiyModel();
