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
  const verifyLink = `${envConfig.CORS_ORIGIN}/makerspace/vi/dang-nhap?verify=${token}`;

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
