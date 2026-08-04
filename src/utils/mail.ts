import nodemailer from "nodemailer";
import envConfig from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.EMAIL_APP_USERNAME,
    pass: envConfig.EMAIL_APP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyLink = `${envConfig.CORS_ORIGIN}/vi/login?verify=${token}`;

  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to,
    subject: "[UEH - MakerSpace] Xác thực tài khoản",
    html: `
      <h2>Chào mừng bạn đến với UEH - MakerSpace!</h2>
      <p>Vui lòng nhấn vào đường link bên dưới để xác thực tài khoản của bạn:</p>
      <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;color:white;background-color:#4CAF50;text-decoration:none;border-radius:5px;">Kích hoạt tài khoản</a>
      <br/><br/>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendBookingReceivedEmail = async (to: string, name: string, workshopName: string, participants: number, workshopType: string = "diy") => {
  const isCourse = workshopType === "short_course";
  const label = isCourse ? "Khóa học" : "Workshop";

  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to,
    subject: `[UEH - MakerSpace] Xác nhận yêu cầu đặt chỗ ${label}`,
    html: `
      <h2>Chào ${name},</h2>
      <p>Cảm ơn bạn đã đăng ký tham gia ${label} <strong>${workshopName}</strong> tại UEH - MakerSpace.</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt chỗ cho <strong>${participants}</strong> người tham gia.</p>
      <p>Vui lòng đợi thông báo xác nhận chính thức từ Admin sau khi đơn đăng ký của bạn được duyệt. Nếu số lượng đã đầy, chúng tôi cũng sẽ thông báo cho bạn.</p>
      <br/>
      <p>Trân trọng,<br/>Đội ngũ UEH - MakerSpace</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendBookingApprovedEmail = async (to: string, name: string, workshopName: string, participants: number, startTime: string, location: string, workshopType: string = "diy") => {
  const isCourse = workshopType === "short_course";
  const label = isCourse ? "Khóa học" : "Workshop";

  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to,
    subject: `[UEH - MakerSpace] Đăng ký thành công ${label}!`,
    html: `
      <h2>Chào ${name},</h2>
      <p>Chúc mừng bạn! Yêu cầu đăng ký tham gia ${label} <strong>${workshopName}</strong> của bạn đã được <strong>duyệt thành công</strong>.</p>
      <p>Dưới đây là thông tin chi tiết về ${label}:</p>
      <ul>
        <li><strong>Số lượng tham gia:</strong> ${participants} người</li>
        <li><strong>Thời gian:</strong> ${startTime}</li>
        <li><strong>Địa điểm:</strong> ${location}</li>
      </ul>
      <p>Vui lòng có mặt đúng giờ để quá trình check-in diễn ra thuận lợi nhé.</p>
      <br/>
      <p>Hẹn gặp lại bạn tại sự kiện!<br/>Đội ngũ UEH - MakerSpace</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendBookingCancelledEmail = async (to: string, name: string, workshopName: string, workshopType: string = "diy") => {
  const isCourse = workshopType === "short_course";
  const label = isCourse ? "Khóa học" : "Workshop";

  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to,
    subject: `[UEH - MakerSpace] Cập nhật trạng thái đăng ký ${label}`,
    html: `
      <h2>Chào ${name},</h2>
      <p>Rất tiếc phải thông báo rằng yêu cầu đăng ký tham gia ${label} <strong>${workshopName}</strong> của bạn đã bị <strong>hủy</strong>.</p>
      <p>Nguyên nhân có thể do ${label} đã đạt đủ số lượng người tham gia tối đa hoặc do một số thay đổi trong lịch trình tổ chức.</p>
      <p>Chúng tôi rất mong được đón tiếp bạn ở các sự kiện ${label} lần sau tại MakerSpace. Bạn có thể theo dõi trang chủ để cập nhật các ${label} mới nhất nhé.</p>
      <br/>
      <p>Trân trọng,<br/>Đội ngũ UEH - MakerSpace</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendServiceQuoteEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to,
    subject: `[UEH - MakerSpace] Xác nhận Yêu cầu Báo giá Dịch vụ`,
    html: `
      <h2>Chào ${name},</h2>
      <p>Cảm ơn bạn đã gửi Yêu cầu Báo giá Dịch vụ đến UEH - MakerSpace.</p>
      <p>Hệ thống đã ghi nhận thông tin của bạn. Đội ngũ chuyên viên của chúng tôi sẽ sớm liên hệ lại với bạn để tư vấn chi tiết về các giải pháp và báo giá cụ thể.</p>
      <br/>
      <p>Trân trọng,<br/>Đội ngũ UEH - MakerSpace</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendServiceQuoteAdminEmail = async (data: any) => {
  const mailOptions = {
    from: `"UEH - MakerSpace" <${envConfig.EMAIL_APP_USERNAME}>`,
    to: envConfig.EMAIL_RECEIVER,
    subject: `[UEH - MakerSpace] Yêu cầu Báo giá Dịch vụ mới từ ${data.fullName}`,
    html: `
      <h2>Có một yêu cầu báo giá dịch vụ mới!</h2>
      <p>Dưới đây là thông tin chi tiết:</p>
      <ul>
        <li><strong>Người liên hệ:</strong> ${data.fullName}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Số điện thoại:</strong> ${data.phone}</li>
        <li><strong>Công ty / Tổ chức:</strong> ${data.companyName || "Không có"}</li>
      </ul>
      <h3>Mô tả yêu cầu:</h3>
      <p>${data.description}</p>
      <br/>
      <p>Vui lòng đăng nhập vào trang Admin để xem và quản lý yêu cầu này.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
