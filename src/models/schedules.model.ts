import { getPool } from "./db/pool";
import { CreateScheduleType, UpdateScheduleType } from "../schemaValidation/workshops.schema";

class SchedulesModel {
  async getAll(lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.schedules ORDER BY start_time DESC`,
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM workshops.schedules WHERE id = $1`,
      values: [id],
    });
  }

  async insert(data: CreateScheduleType, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO workshops.schedules (workshop_type, workshop_id, start_time, end_time, location, max_participants, draft) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [
        data.workshop_type,
        data.workshop_id,
        data.start_time,
        data.end_time,
        data.location,
        data.max_participants,
        data.draft || false,
      ],
    });
  }

  async update(id: string, data: UpdateScheduleType, lang: string = "vi") {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error("No data to update");

    let setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    setClause += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(id);
    const idIndex = values.length;

    return getPool(lang).query({
      text: `UPDATE workshops.schedules SET ${setClause} WHERE id = $${idIndex} RETURNING *`,
      values: [...values],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM workshops.schedules WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new SchedulesModel();
