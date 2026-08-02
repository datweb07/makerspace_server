import { getPool } from "./db/pool";
import { CreateWorkshopRegistrationInput, UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";

class WorkshopBookingsModel {
  async getAll(lang: string = "vi") {
    // Join with workshops.diy to get the title
    return getPool(lang).query({
      text: `
        SELECT 
          wb.*,
          w.title as workshop_title
        FROM registrations.workshop_bookings wb
        LEFT JOIN workshops.diy w ON wb.workshop_id = w.slug
        ORDER BY wb.created_at DESC
      `,
    });
  }

  async getByEmail(email: string, lang: string = "vi") {
    // Join with workshops.diy and short_courses to get the title, date, time, location
    return getPool(lang).query({
      text: `
        SELECT 
          wb.*,
          COALESCE(w.title, s.title) as workshop_title,
          COALESCE(w.start_time, s.start_time) as workshop_start_time,
          COALESCE(w.location, s.location) as workshop_location,
          wb.id as ticket_code
        FROM registrations.workshop_bookings wb
        LEFT JOIN workshops.diy w ON wb.workshop_id = w.slug AND wb.workshop_type = 'diy'
        LEFT JOIN workshops.short_courses s ON wb.workshop_id = s.slug AND wb.workshop_type = 'short_course'
        WHERE wb.email = $1
        ORDER BY wb.created_at DESC
      `,
      values: [email]
    });
  }

  async getById(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `SELECT * FROM registrations.workshop_bookings WHERE id = $1`,
      values: [id],
    });
  }

  async insert(data: CreateWorkshopRegistrationInput, lang: string = "vi") {
    return getPool(lang).query({
      text: `INSERT INTO registrations.workshop_bookings 
             (workshop_id, workshop_type, name, email, phone, participants, note, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values: [
        data.workshop_id,
        data.workshop_type,
        data.name,
        data.email,
        data.phone,
        data.participants,
        data.note || null,
        "pending",
      ],
    });
  }

  async updateStatus(id: string, status: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `UPDATE registrations.workshop_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      values: [status, id],
    });
  }

  async delete(id: string, lang: string = "vi") {
    return getPool(lang).query({
      text: `DELETE FROM registrations.workshop_bookings WHERE id = $1 RETURNING *`,
      values: [id],
    });
  }
}

export default new WorkshopBookingsModel();
