import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from "../db";

export const addWishItem = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const { url, category } = req.body;

        if (!url) return res.status(400).json({ error: 'URL is required' });

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const $ = cheerio.load(data);

        let title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content');

        if (!title) {
            const titleSelectors = [
                '#allproduct > div.wrapp-product__row > div.wrapp-product__row-info > div.top-product-info > h1',
                'h1.product__title',
                '.product-page__title',
                'h1'
            ];
            for (const selector of titleSelectors) {
                const text = $(selector).first().text().trim();
                if (text) {
                    title = text;
                    break;
                }
            }
        }
        title = title ? title.replace(/\s+/g, ' ') : 'Unknown Item';

        let image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('link[rel="image_src"]').attr('href');

        if (image && image.startsWith('/')) {
            const urlObj = new URL(url);
            image = `${urlObj.protocol}//${urlObj.hostname}${image}`;
        }

        let priceAmount: string | null = null;

        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((_, element) => {
            try {
                const json = JSON.parse($(element).html() || '{}');
                const objects = Array.isArray(json) ? json : [json];
                for (const obj of objects) {
                    const offers = obj.offers || (obj['@type'] === 'Product' && obj.offers);
                    if (offers) {
                        const price = Array.isArray(offers) ? offers[0].price : (offers.price || offers.lowPrice);
                        if (price) {
                            priceAmount = price.toString();
                            break;
                        }
                    }
                }
            } catch (e) {}
        });

        if (!priceAmount || priceAmount === '0') {
            priceAmount = $('meta[property="product:price:amount"]').attr('content') ||
                $('meta[name="price"]').attr('content') ||
                $('.product-price__big').first().text() ||
                $('.price-number').first().text();
        }

        const cleanPrice = priceAmount
            ? parseFloat(priceAmount.toString().replace(/[^\d.]/g, '').replace(',', '.'))
            : 0;

        const newItem = await prisma.wishList.create({
            data: {
                user_id: userId,
                url,
                title,
                image_url: image || '',
                price: cleanPrice,
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
        const userId = Number((req as any).user.userId);
        const items = await prisma.wishList.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateWishItem = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const id = Number(req.params.id);

        const updatedItem = await prisma.wishList.update({
            where: {
                wish_id: id,
                user_id: userId
            },
            data: req.body
        });

        res.json(updatedItem);
    } catch (error: any) {
        res.status(400).json({ error: 'Item not found or access denied' });
    }
};

export const deleteWishItem = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const id = Number(req.params.id);

        await prisma.wishList.delete({
            where: {
                wish_id: id,
                user_id: userId
            }
        });

        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: 'Item not found or access denied' });
    }
};