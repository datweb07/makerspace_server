import { getPool } from "./db/pool";
import { CreateInternType, UpdateInternType } from "../schemaValidation/intern.schema";

class InternModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM people.interns ORDER BY display_order ASC, id DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM people.interns WHERE id = $1`,
      values: [id],
    });
  }

  async insert(data: CreateInternType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO people.interns (id, name, title, bio, cover_image, display_order, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [
        data.id,
        data.name,
        data.title || null,
        data.bio || null,
        data.cover_image,
        data.display_order ?? 0,
        data.draft ?? false,
      ],
    });
  }

  async update(id: string, data: UpdateInternType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE people.interns SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM people.interns WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new InternModel();
