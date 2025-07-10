import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

export const isPasswordCorrect = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async hashPasswordAgain(
        data: any,
        newPassword: string,
        skipValidation = false
      ) {
        if (!skipValidation) {
          let hashedPassword;
          if (data) {
            hashedPassword = await bcrypt.hash(newPassword, 10);
          }
          return await prisma.user.update({
            where: { userId: data.userId },
            data: {
              ...data,
              password: hashedPassword,
            },
          });
        }
        return data;
      },
    },
  },
});
