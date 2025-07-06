import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Password hashing middleware
prisma.$use(async (params, next) => {
  if (params.model === "User") {
    if (params.action === "create" || params.action === "update") {
      const userData = params.args.data;

      // Only hash if password is being modified
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
    }
  }
  return next(params);
});

export default prisma;
