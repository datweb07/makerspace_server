import { getPool } from "./db/pool";
import { CreateDiyType, UpdateDiyType } from "../schemaValidation/workshops.schema";

class DiyModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `
        SELECT 
          w.*,
          COALESCE(SUM(b.participants), 0)::int as registered_participants
        FROM workshops.diy w
        LEFT JOIN registrations.workshop_bookings b 
          ON w.slug = b.workshop_id 
          AND b.workshop_type = 'diy' 
          AND b.status != 'cancelled'
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `
        SELECT 
          w.*,
          COALESCE(SUM(b.participants), 0)::int as registered_participants
        FROM workshops.diy w
        LEFT JOIN registrations.workshop_bookings b 
          ON w.slug = b.workshop_id 
          AND b.workshop_type = 'diy' 
          AND b.status != 'cancelled'
        WHERE w.id = $1
        GROUP BY w.id
      `,
      values: [id],
    });
  }

  async getBySlug(slug: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `
        SELECT 
          w.*,
          COALESCE(SUM(b.participants), 0)::int as registered_participants
        FROM workshops.diy w
        LEFT JOIN registrations.workshop_bookings b 
          ON w.slug = b.workshop_id 
          AND b.workshop_type = 'diy' 
          AND b.status != 'cancelled'
        WHERE w.slug = $1
        GROUP BY w.id
      `,
      values: [slug],
    });
  }

  async insert(data: CreateDiyType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO workshops.diy (title, slug, cover_image, content, difficulty, draft, start_time, end_time, location, max_participants) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      values: [
        data.title,
        data.slug,
        data.cover_image || null,
        data.content || null,
        data.difficulty || null,
        data.draft || false,
        data.start_time || null,
        data.end_time || null,
        data.location || null,
        data.max_participants || null,
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
