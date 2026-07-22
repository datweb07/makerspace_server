import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import envConfig from "../config";
import z from "zod";

export const RegistrationBody = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  workshopName: z.string().min(1, "Tên Workshop là bắt buộc"),
  registrationDate: z.string().min(1, "Ngày đăng ký là bắt buộc"),
});

export async function registerWorkshop(
  request: FastifyRequest<{ Body: z.infer<typeof RegistrationBody> }>,
  reply: FastifyReply
) {
  try {
    const data = request.body;
    
    const email = envConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = envConfig.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = envConfig.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
      console.error("Google Sheets configuration is missing!");
      return reply.status(500).send({ message: "Chưa cấu hình Google Sheets API" });
    }

    const serviceAccountAuth = new JWT({
      email: email,
      key: key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    // Tải thông tin sheet
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Ghi vào trang tính đầu tiên
    
    // Thêm dòng mới (Các key này phải khớp với dòng tiêu đề đầu tiên trong Google Sheet, 
    // hoặc google-spreadsheet tự động thêm dựa vào object mapping nếu cấu hình header đúng).
    // Ở đây ta ghi theo mảng (row-based) để không phụ thuộc vào Header Name.
    await sheet.addRow([
      data.fullName,
      data.phone,
      data.email,
      data.workshopName,
      data.registrationDate
    ]);

    return reply.status(201).send({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi ghi Google Sheets:", error);
    return reply.status(500).send({ message: "Đã xảy ra lỗi khi đăng ký Workshop" });
  }
}
