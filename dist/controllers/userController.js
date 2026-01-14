"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = void 0;
const db_1 = require("../db");
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                email: true,
                telegram_name: true,
                image: true,
                country: true,
                city: true,
                created_at: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getMe = getMe;
