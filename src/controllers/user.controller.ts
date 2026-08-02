import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { AccountModel } from "../models/account.model";
import { signSessionToken, verifySessionToken } from "../utils/jwt";
import { LoginBodyType, RegisterBodyType } from "../schemaValidation/auth.schema";
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
      // Guest & Admin Login (Username / Password)
      if (!password) {
        return reply.status(400).send({ message: "Vui lòng nhập mật khẩu" });
      }

      // Admin (member) might log in using password, so check members table first
      let account = await accountModel.findMemberByEmail(username, request.lang);

      // If not found in members, check guests table
      if (!account) {
        account = await accountModel.findGuestByUsername(username, request.lang);
      }

      if (!account) {
        return reply.status(404).send({ message: "Tài khoản không tồn tại" });
      }

      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        return reply.status(401).send({ message: "Mật khẩu không đúng" });
      }

      const tokenPayload = {
        userId: account.id,
        username: account.username,
        role: account.role || "guest",
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
  request: FastifyRequest<{ Body: RegisterBodyType }>,
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

export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const sessionToken = request.headers.authorization || "";
    if (!sessionToken) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const decoded = verifySessionToken(sessionToken) as any;
    const accountModel = new AccountModel();
    let account = await accountModel.findGuestByUsername(decoded.username, request.lang);
    if (!account) {
      account = await accountModel.findMemberByEmail(decoded.username, request.lang);
    }
    if (!account) {
      return reply.status(404).send({ message: "Account not found" });
    }

    // Exclude password
    const { password, ...profile } = account;
    return reply.status(200).send({ data: profile });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function updateProfile(
  request: FastifyRequest<{ Body: { fullname: string; phone: string } }>,
  reply: FastifyReply
) {
  try {
    const sessionToken = request.headers.authorization || "";
    if (!sessionToken) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const decoded = verifySessionToken(sessionToken) as any;
    const { fullname, phone } = request.body;

    const accountModel = new AccountModel();
    // For now, assume we only update guests, as members are managed elsewhere
    let account = await accountModel.findGuestByUsername(decoded.username, request.lang);
    
    if (account) {
      await accountModel.updateGuestProfile(decoded.username, fullname, phone, request.lang);
      return reply.status(200).send({ message: "Profile updated successfully" });
    } else {
      // If it's a member or doesn't exist in guests
      return reply.status(403).send({ message: "Members cannot update profile here or account not found" });
    }
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
