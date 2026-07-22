import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { AccountModel } from "../models/account.model";
import { signSessionToken, verifySessionToken } from "../utils/jwt";
import { LoginBodyType } from "../schemaValidation/auth.schema";
import { sendVerificationEmail } from "../utils/mail";

export async function loginUser(
  request: FastifyRequest<{ Body: LoginBodyType }>,
  reply: FastifyReply
) {
  try {
    const { username, password, auth_provider } = request.body;
    const accountModel = new AccountModel();

    if (auth_provider === "google") {
      // Member Login (Google Whitelist)
      const member = await accountModel.findMemberByEmail(username, request.lang);
      if (!member) {
        return reply.status(404).send({ message: "Email chưa được cấp quyền truy cập." });
      }

      const tokenPayload = {
        userId: member.id,
        username: member.username,
        role: member.role || "member",
      };

      const token = signSessionToken(tokenPayload);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      return reply.status(200).send({
        message: "Đăng nhập thành công",
        data: { token, expires },
      });
    } else {
      // Guest Login (Username / Password)
      if (!password) {
        return reply.status(400).send({ message: "Vui lòng nhập mật khẩu" });
      }

      const guest = await accountModel.findGuestByUsername(username, request.lang);
      if (!guest) {
        return reply.status(404).send({ message: "Tài khoản không tồn tại" });
      }

      const isMatch = await bcrypt.compare(password, guest.password);
      if (!isMatch) {
        return reply.status(401).send({ message: "Mật khẩu không đúng" });
      }

      const tokenPayload = {
        userId: guest.id,
        username: guest.username,
        role: guest.role || "guest",
      };

      const token = signSessionToken(tokenPayload);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      return reply.status(200).send({
        message: "Đăng nhập thành công",
        data: { token, expires },
      });
    }
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function registerGuest(
  request: FastifyRequest<{ Body: LoginBodyType }>,
  reply: FastifyReply
) {
  try {
    const { username, password } = request.body;
    if (!password) {
      return reply.status(400).send({ message: "Vui lòng nhập mật khẩu" });
    }

    const accountModel = new AccountModel();

    // Check if exists in either guests or members concurrently to optimize performance
    const [existingGuest, existingMember] = await Promise.all([
      accountModel.findGuestByUsername(username, request.lang),
      accountModel.findMemberByEmail(username, request.lang)
    ]);

    if (existingGuest || existingMember) {
      return reply.status(409).send({ message: "Email này đã được đăng ký" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // JWT contains username and passwordHash (which is secure enough for short-lived token)
    const tokenPayload = { username, passwordHash };
    const verifyToken = signSessionToken(tokenPayload); // Reuse for signing

    await sendVerificationEmail(username, verifyToken);

    return reply.status(201).send({
      message: "Vui lòng kiểm tra email để kích hoạt tài khoản",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function verifyGuest(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  try {
    const { token } = request.body;
    if (!token) {
      return reply.status(400).send({ message: "Token is required" });
    }

    const decoded = verifySessionToken(token) as any;
    if (!decoded || !decoded.username || !decoded.passwordHash) {
      return reply.status(400).send({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const accountModel = new AccountModel();
    const existingGuest = await accountModel.findGuestByUsername(decoded.username, request.lang);
    if (existingGuest) {
      return reply.status(409).send({ message: "Tài khoản đã được kích hoạt trước đó" });
    }

    await accountModel.insertGuest(decoded.username, decoded.passwordHash, request.lang);

    return reply.status(200).send({
      message: "Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

