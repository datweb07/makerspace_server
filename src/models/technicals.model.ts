import { getPool } from "./db/pool";
import { CreateTechnicalsType, UpdateTechnicalsType } from "../schemaValidation/technicals.schema";

class TechnicalsModel {
  async getAll(lang: string = "vi") {
    if (lang === "all") {
      const viRes = await getPool("vi").query({
        text: `SELECT * FROM people.technicals ORDER BY display_order ASC, id DESC`,
      });
      const enRes = await getPool("en").query({
        text: `SELECT * FROM people.technicals ORDER BY display_order ASC, id DESC`,
      });
      const viTechs = viRes.rows.map(s => ({ ...s, lang: "vi" }));
      const enTechs = enRes.rows.map(s => ({ ...s, lang: "en" }));
      return { rows: [...viTechs, ...enTechs].sort((a, b) => a.display_order - b.display_order || b.id.localeCompare(a.id)) };
    }
    
    const res = await getPool(lang).query({
      text: `SELECT * FROM people.technicals ORDER BY display_order ASC, id DESC`,
    });
    return { rows: res.rows.map(s => ({ ...s, lang })) };
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM people.technicals WHERE id = $1`,
      values: [id],
    });
  }

  async insert(data: CreateTechnicalsType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO people.technicals (id, name, title, bio, email, cover_image, display_order, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values: [
        data.id,
        data.name,
        data.title || null,
        data.bio || null,
        data.email || null,
        data.cover_image,
        data.display_order ?? 0,
        data.draft ?? false,
      ],
    });
  }

  async update(id: string, data: UpdateTechnicalsType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE people.technicals SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM people.technicals WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new TechnicalsModel();
