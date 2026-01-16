"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUpdateSchema = exports.transactionSchema = exports.categorySchema = exports.accountSchema = exports.tripSchema = exports.maintenanceSchema = exports.fuelSchema = void 0;
const zod_1 = require("zod");
exports.fuelSchema = zod_1.z.object({
    body: zod_1.z.object({
        liters: zod_1.z.number().positive('Кількість літрів має бути більше 0'),
        price: zod_1.z.number().positive('Ціна має бути більше 0'),
        station: zod_1.z.string().min(1, 'Назва заправки обов’язкова').max(255),
    }),
});
exports.maintenanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: zod_1.z.string().datetime('Некоректний формат дати'),
        description: zod_1.z.string().min(1, 'Опис обов’язковий'),
        odometer: zod_1.z.number().int().nonnegative('Пробіг не може бути від’ємним'),
    }),
});
exports.tripSchema = zod_1.z.object({
    body: zod_1.z.object({
        kilometrs: zod_1.z.number().positive('Кілометраж має бути більше 0'),
        direction: zod_1.z.string().min(1, 'Напрямок обов’язковий'),
    }),
});
exports.accountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Назва рахунку обов’язкова'),
        currency: zod_1.z.string().length(3, 'Валюта має бути кодом із 3-х символів (напр. UAH)').default('UAH'),
        balance: zod_1.z.number().default(0),
    }),
});
exports.categorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Назва категорії обов’язкова'),
        type: zod_1.z.enum(['INCOME', 'EXPENSE'], 'Тип може бути тільки INCOME або EXPENSE'),
    }),
});
exports.transactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        account_id: zod_1.z.number().int(),
        category_id: zod_1.z.number().int(),
        amount: zod_1.z.number().refine(n => n !== 0, { message: "Сума не може бути 0" }),
        description: zod_1.z.string().optional(),
        date: zod_1.z.string().datetime().optional(),
    }),
});
exports.userUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Некоректний email').optional(),
        phone: zod_1.z.string().optional(),
        telegram_name: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        image: zod_1.z.string().url('Некоректне посилання на зображення').optional(),
    }),
});
