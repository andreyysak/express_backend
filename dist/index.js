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
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
require("./config/passport");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const fuel_1 = __importDefault(require("./routes/fuel"));
const trip_1 = __importDefault(require("./routes/trip"));
const notion_1 = __importDefault(require("./routes/notion"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const account_1 = __importDefault(require("./routes/account"));
const category_1 = __importDefault(require("./routes/category"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const weather_1 = __importDefault(require("./routes/weather"));
const monoRoutes_1 = __importDefault(require("./routes/monoRoutes"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const AppError_1 = require("./class/AppError");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
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
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(passport_1.default.initialize());
app.use(express_1.default.static('public'));
app.get('/docs', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/docs.html'));
});
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.use('/api/mono', monoRoutes_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/notion', notion_1.default);
app.use('/api/weather', weather_1.default);
app.use('/api/', limiter);
app.use('/api/users', authMiddleware_1.authMiddleware, user_1.default);
app.use('/api/fuel', authMiddleware_1.authMiddleware, fuel_1.default);
app.use('/api/trip', authMiddleware_1.authMiddleware, trip_1.default);
app.use('/api/maintenance', authMiddleware_1.authMiddleware, maintenance_1.default);
app.use('/api/finance/account', account_1.default);
app.use('/api/finance/category', category_1.default);
app.use('/api/finance/transaction', transaction_1.default);
app.all(/.*s*/, (req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorMiddleware_1.globalErrorHandler);
app.listen(PORT, () => {
    logger_1.default.info(`Server started on port ${PORT}`);
});
