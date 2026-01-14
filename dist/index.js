"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = require("express-rate-limit");
const passport_1 = __importDefault(require("passport"));
const logger_1 = __importDefault(require("./logger"));
require("./config/passport");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const fuel_1 = __importDefault(require("./routes/fuel"));
const trip_1 = __importDefault(require("./routes/trip"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use('/api/', limiter);
app.use(passport_1.default.initialize());
app.use(express_1.default.static('public'));
app.get('/docs', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/docs.html'));
});
app.use('/api/auth', auth_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
app.use('/api/users', authMiddleware_1.authMiddleware, user_1.default);
app.use('/api/fuel', authMiddleware_1.authMiddleware, fuel_1.default);
app.use('/api/trip', authMiddleware_1.authMiddleware, trip_1.default);
app.use('/api/maintenance', authMiddleware_1.authMiddleware, maintenance_1.default);
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(PORT, () => {
    logger_1.default.info(`Server started on port ${PORT}`);
});
