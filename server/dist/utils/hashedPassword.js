"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.isPasswordCorrect = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const isPasswordCorrect = (plainPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compare(plainPassword, hashedPassword);
});
exports.isPasswordCorrect = isPasswordCorrect;
exports.prisma = new client_1.PrismaClient().$extends({
    model: {
        user: {
            hashPasswordAgain(data_1, newPassword_1) {
                return __awaiter(this, arguments, void 0, function* (data, newPassword, skipValidation = false) {
                    if (!skipValidation) {
                        let hashedPassword;
                        if (data) {
                            hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                        }
                        return yield exports.prisma.user.update({
                            where: { userId: data.userId },
                            data: Object.assign(Object.assign({}, data), { password: hashedPassword }),
                        });
                    }
                    return data;
                });
            },
        },
    },
});
