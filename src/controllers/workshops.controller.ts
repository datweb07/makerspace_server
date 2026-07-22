import type { CreateWorkshopRegistrationInput, ListWorkshopsQuery } from "../schemaValidation/workshops.schema";
import { workshopsModel } from "../models/workshops.model";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import envConfig from "../config";

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
  async createRegistration(input: CreateWorkshopRegistrationInput) {
    // Lưu vào database hoặc file gốc nếu cần
    const dbResult = workshopsModel.createRegistration(input);
    const workshop = workshopsModel.list().find((w) => w.id === input.workshopId);
    const workshopName = workshop ? workshop.title : `Workshop ID: ${input.workshopId}`;

    // Lưu vào Google Sheets
    try {
      const email = envConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const key = envConfig.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const sheetId = envConfig.GOOGLE_SHEET_ID;

      if (email && key && sheetId) {
        const serviceAccountAuth = new JWT({
          email: email,
          key: key,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Format: Họ Tên, Số điện thoại, Email, Tên Workshop, Ngày đăng ký
        const registrationDate = new Date().toLocaleString("vi-VN");
        await sheet.addRow([
          input.fullName,
          input.phone,
          input.email,
          workshopName,
          registrationDate,
          input.participants,
          input.note || ""
        ]);
      } else {
        console.warn("Google Sheets configuration missing, skipping sheet update.");
      }
    } catch (error) {
      console.error("Lỗi khi ghi vào Google Sheets:", error);
      // We don't throw here to ensure the user still sees a success message if DB save succeeded
    }

    return dbResult;
  },
  listRegistrations() {
    return {
      data: workshopsModel.listRegistrations(),
    };
  },
};
