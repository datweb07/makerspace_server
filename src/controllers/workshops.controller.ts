import type { CreateWorkshopRegistrationInput, ListWorkshopsQuery, UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";
import { workshopsModel } from "../models/workshops.model";
import workshopBookingsModel from "../models/workshop_bookings.model";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import envConfig from "../config";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import diyModel from "../models/diy.model";
import shortCoursesModel from "../models/short_courses.model";
import { sendBookingReceivedEmail, sendBookingApprovedEmail, sendBookingCancelledEmail } from "../utils/mail";

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
    const booking = dbResult.rows[0];

    // Send email
    try {
      let workshopName = input.workshop_id;
      if (input.workshop_type === 'diy') {
        const wsRes = await diyModel.getBySlug(input.workshop_id, lang);
        if (wsRes.rows.length > 0) workshopName = wsRes.rows[0].title;
      } else if (input.workshop_type === 'short_course') {
        const wsRes = await shortCoursesModel.getBySlug(input.workshop_id, lang);
        if (wsRes.rows.length > 0) workshopName = wsRes.rows[0].title;
      }

      await sendBookingReceivedEmail(
        booking.email,
        booking.name,
        workshopName,
        booking.participants
      );
    } catch (error) {
      console.error("Failed to send booking received email:", error);
    }

    return booking;
  },
  async listRegistrations(lang: string = "vi") {
    const res = await workshopBookingsModel.getAll(lang);
    return {
      data: res.rows,
    };
  },
  async findRegistration(email: string, phone: string, workshop_id: string, workshop_type: string, lang: string = "vi") {
    const res = await workshopBookingsModel.findByContact(email, phone, workshop_id, workshop_type, lang);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  },
  async addAbsenceRequest(id: string, requestData: { date: string, reason: string }, lang: string = "vi") {
    const dataWithTime = { ...requestData, submitted_at: new Date().toISOString() };
    const res = await workshopBookingsModel.addAbsenceRequest(id, dataWithTime, lang);
    return res.rows[0];
  },
  async listMyRegistrations(email: string, lang: string = "vi") {
    const res = await workshopBookingsModel.getByEmail(email, lang);
    return {
      data: res.rows,
    };
  },
  async deleteRegistration(id: string, lang: string = "vi") {
    const res = await workshopBookingsModel.delete(id, lang);
    if (res.rowCount === 0) throw new Error("Booking not found");
    return { message: "Deleted successfully" };
  },
  async updateBookingStatus(id: string, input: UpdateBookingStatusInput, lang: string = "vi") {
    const res = await workshopBookingsModel.updateStatus(id, input.status, lang);
    if (res.rowCount === 0) throw new Error("Booking not found");
    const booking = res.rows[0];

    // Send email on status change
    try {
      if (input.status === "approved" || input.status === "cancelled") {
        let workshopName = booking.workshop_id;
        let startTime = "Đang cập nhật";
        let location = "Đang cập nhật";

        if (booking.workshop_type === 'diy') {
          const wsRes = await diyModel.getBySlug(booking.workshop_id, lang);
          if (wsRes.rows.length > 0) {
            const ws = wsRes.rows[0];
            workshopName = ws.title;
            location = ws.location || location;
            if (ws.start_time) startTime = dayjs(ws.start_time).format('HH:mm DD/MM/YYYY');
          }
        } else if (booking.workshop_type === 'short_course') {
          const wsRes = await shortCoursesModel.getBySlug(booking.workshop_id, lang);
          if (wsRes.rows.length > 0) {
            const ws = wsRes.rows[0];
            workshopName = ws.title;
            // Short courses might not have explicit start_time/location in the same way, adapt as needed
            // Assuming we use duration or similar if start_time is missing
          }
        }

        if (input.status === "approved") {
          await sendBookingApprovedEmail(
            booking.email,
            booking.name,
            workshopName,
            booking.participants,
            startTime,
            location
          );
        } else if (input.status === "cancelled") {
          await sendBookingCancelledEmail(
            booking.email,
            booking.name,
            workshopName
          );
        }
      }
    } catch (error) {
      console.error("Failed to send booking status email:", error);
    }

    return booking;
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

    bookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    let currentMonth = '';

    bookings.forEach((booking) => {
      const monthStr = dayjs(booking.created_at).format('MM/YYYY');
      if (monthStr !== currentMonth) {
        currentMonth = monthStr;
        const headerRow = worksheet.addRow({ id: `Tháng ${currentMonth}` });

        try {
          worksheet.mergeCells(headerRow.number, 1, headerRow.number, 9);
          headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
          headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        } catch (e) {
          console.error("Merge cell error:", e);
        }
      }

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
