"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallback = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleAuthCallback = (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
};
exports.googleAuthCallback = googleAuthCallback;
