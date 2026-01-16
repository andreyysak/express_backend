import { z } from 'zod';

export const fuelSchema = z.object({
    body: z.object({
        liters: z.number().positive('Кількість літрів має бути більше 0'),
        price: z.number().positive('Ціна має бути більше 0'),
        station: z.string().min(1, 'Назва заправки обов’язкова').max(255),
    }),
});

export const maintenanceSchema = z.object({
    body: z.object({
        date: z.string().datetime('Некоректний формат дати'),
        description: z.string().min(1, 'Опис обов’язковий'),
        odometer: z.number().int().nonnegative('Пробіг не може бути від’ємним'),
    }),
});

export const tripSchema = z.object({
    body: z.object({
        kilometrs: z.number().positive('Кілометраж має бути більше 0'),
        direction: z.string().min(1, 'Напрямок обов’язковий'),
    }),
});

export const accountSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Назва рахунку обов’язкова'),
        currency: z.string().length(3, 'Валюта має бути кодом із 3-х символів (напр. UAH)').default('UAH'),
        balance: z.number().default(0),
    }),
});

export const categorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Назва категорії обов’язкова'),
        type: z.enum(['INCOME', 'EXPENSE'], 'Тип може бути тільки INCOME або EXPENSE'),
    }),
});

export const transactionSchema = z.object({
    body: z.object({
        account_id: z.number().int(),
        category_id: z.number().int(),
        amount: z.number().refine(n => n !== 0, { message: "Сума не може бути 0" }),
        description: z.string().optional(),
        date: z.string().datetime().optional(),
    }),
});

export const userUpdateSchema = z.object({
    body: z.object({
        email: z.string().email('Некоректний email').optional(),
        phone: z.string().optional(),
        telegram_name: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        image: z.string().url('Некоректне посилання на зображення').optional(),
    }),
});