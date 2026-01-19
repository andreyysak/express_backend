import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {prisma} from "../db";

export const addWishItem = async (req: Request, res: Response) => {
    try {
        const { url, category } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Unknown Item';
        const image = $('meta[property="og:image"]').attr('content') || '';

        const priceAmount = $('meta[property="product:price:amount"]').attr('content') ||
            $('meta[name="price"]').attr('content') || '0';

        const currency = $('meta[property="product:price:currency"]').attr('content') || 'UAH';

        const newItem = await prisma.wishList.create({
            data: {
                user_id: 1, // Твій локальний User ID
                url,
                title: title.trim(),
                image_url: image,
                price: parseFloat(priceAmount),
                category: category || 'General'
            }
        });

        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: `Failed to parse or save item: ${error.message}` });
    }
};

export const getWishList = async (req: Request, res: Response) => {
    try {
        const items = await prisma.wishList.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};