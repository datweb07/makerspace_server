import type { CreateWorkshopRegistrationInput, ListWorkshopsQuery, UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";
import { workshopsModel } from "../models/workshops.model";
import workshopBookingsModel from "../models/workshop_bookings.model";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import envConfig from "../config";
import ExcelJS from "exceljs";
import dayjs from "dayjs";

export const workshopsController = {
  listWorkshops(query?: ListWorkshopsQuery) {
    const workshops = workshopsModel.list();
    const filtered = query?.tag ? workshops.filter((workshop) => workshop.tag === query.tag) : workshops;

    return {
      data: filtered,
      total: filtered.length,
    };
  },
  listFeaturedWorkshops() {
    return {
      data: workshopsModel.listFeatured(),
    };
  },
  async createRegistration(input: CreateWorkshopRegistrationInput, lang: string = "vi") {
    // Save to Postgres
    const dbResult = await workshopBookingsModel.insert(input, lang);
    
    // Legacy Google Sheets logic can be kept if needed, but omitted for now to prioritize Postgres.
    // If you want to keep Google Sheets, you can re-enable it.
    
    return dbResult.rows[0];
  },
  async listRegistrations(lang: string = "vi") {
    const res = await workshopBookingsModel.getAll(lang);
    return {
      data: res.rows,
    };
  },
  async updateBookingStatus(id: string, input: UpdateBookingStatusInput, lang: string = "vi") {
    const res = await workshopBookingsModel.updateStatus(id, input.status, lang);
    if (res.rowCount === 0) throw new Error("Booking not found");
    return res.rows[0];
  },
  async exportBookingsExcel(lang: string = "vi") {
    const res = await workshopBookingsModel.getAll(lang);
    const bookings = res.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Workshop Bookings');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Họ và tên', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Tên Workshop', key: 'workshop_title', width: 40 },
      { header: 'Số lượng tham gia', key: 'participants', width: 20 },
      { header: 'Ghi chú', key: 'note', width: 40 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày đăng ký', key: 'created_at', width: 25 },
    ];

    bookings.forEach((booking) => {
      worksheet.addRow({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        workshop_title: booking.workshop_title || booking.workshop_id,
        participants: booking.participants,
        note: booking.note,
        status: booking.status,
        created_at: dayjs(booking.created_at).format('DD/MM/YYYY HH:mm:ss'),
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
};
