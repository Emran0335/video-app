import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";


export const isPasswordCorrect = async(plainPassword: string,hashedPassword: string):Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword)
}


// // // Password hashing middleware
// // prisma.$use(async (params, next) => {
// //   if (params.model === "User") {
// //     if (params.action === "create" || params.action === "update") {
// //       const userData = params.args.data;

// //       // Only hash if password is being modified
// //       if (userData.password) {
// //         userData.password = await bcrypt.hash(userData.password, 10);
// //       }
// //     }
// //   }
// //   return next(params);
// // });
// const prisma = new PrismaClient().$extends({
//   model: {
//     user: {
//       async isPasswordCorrect(params: {
//         where: { userId: number };
//         data: any;
//         skipValidation?: boolean;
//       }) {
//         if(!params.skipValidation) {
//             const userData = params.data;
//             if(userData.password) {
//                 userData.password = await bcrypt.hash(userData.password, 10)
//             }
//         }
//         return prisma.user.update({
//             where: params.where,
//             data: params.data
//         })
//       },
//     },
//   },
// });
// export default prisma;
