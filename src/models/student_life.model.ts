import { getPool } from "./db/pool";
import { CreateStudentLifeType, UpdateStudentLifeType } from "../schemaValidation/student_life.schema";

class StudentLifeModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.student_life ORDER BY publish_date DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.student_life WHERE id = $1`,
      values: [id],
    });
  }

  async getBySlug(slug: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM posts.student_life WHERE slug = $1`,
      values: [slug],
    });
  }

  async insert(data: CreateStudentLifeType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO posts.student_life (title, slug, seo_title, cover_image, description, content, author, publish_date, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      values: [
        data.title,
        data.slug,
        data.seo_title,
        data.cover_image,
        data.description || null,
        data.content,
        data.author,
        data.publish_date,
        data.draft ?? false
      ],
    });
  }

  async update(id: string, data: UpdateStudentLifeType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    setClause += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE posts.student_life SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM posts.student_life WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new StudentLifeModel();
