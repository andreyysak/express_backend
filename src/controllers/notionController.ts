import { Request, Response } from 'express';
import axios from 'axios';

const NOTION_SECRET = process.env.NOTION_SECRET;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_VERSION = '2022-06-28';

const notionApi = axios.create({
    baseURL: 'https://api.notion.com/v1',
    headers: {
        'Authorization': `Bearer ${NOTION_SECRET}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
    },
});

export const getTasks = async (req: Request, res: Response) => {
    try {
        let tasks: any[] = [];
        let cursor: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
            const response: any = await notionApi.post(`/databases/${DATABASE_ID}/query`, {
                start_cursor: cursor,
                page_size: 100,
            });

            const { results, has_more, next_cursor } = response.data;

            const mappedTasks = results.map((page: any) => {
                const p = page.properties;
                return {
                    id: page.id,
                    title: p.Name?.title?.[0]?.plain_text || 'Без назви',
                    status: p.Status?.status?.name || p.Status?.select?.name || 'Без статусу',
                    project: p.Project?.select?.name || 'Без проекту',
                    category: p.Category?.select?.name || 'Інше',
                    priority: p.Priority?.select?.name || 'Не вказано',
                    link: p.Link?.url || null,
                };
            });

            tasks = [...tasks, ...mappedTasks];
            hasMore = has_more;
            cursor = next_cursor;
        }

        res.json(tasks);
    } catch (error: any) {
        if (error.response) {
            console.error('NOTION ERROR DATA:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(400).json({
            error: error.message,
            details: error.response?.data?.message || 'Check terminal'
        });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const task = req.body;
        const properties: any = {
            Name: { title: [{ text: { content: task.title || 'Нова задача' } }] }
        };

        if (task.status) properties.Status = { select: { name: task.status } };
        if (task.project) properties.Project = { select: { name: task.project } };
        if (task.category) properties.Category = { select: { name: task.category } };
        if (task.priority) properties.Priority = { select: { name: task.priority } };
        if (task.link) properties.Link = { url: task.link };

        const response = await notionApi.post('/pages', {
            parent: { database_id: DATABASE_ID },
            properties
        });

        res.json({ id: response.data.id, ...task });
    } catch (error: any) {
        if (error.response) {
            console.error('NOTION CREATE ERROR:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(400).json({ error: error.message, details: error.response?.data?.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const task = req.body;
        const properties: any = {};

        if (task.title) {
            properties.Name = { title: [{ text: { content: task.title } }] };
        }
        if (task.status) {
            properties.Status = { select: { name: task.status } };
        }
        if (task.project) {
            properties.Project = { select: { name: task.project } };
        }
        if (task.category) {
            properties.Category = { select: { name: task.category } };
        }
        if (task.priority) {
            properties.Priority = { select: { name: task.priority } };
        }
        if (task.link) {
            properties.Link = { url: task.link };
        }

        const response = await notionApi.patch(`/pages/${id}`, {
            properties
        });

        res.json({ success: true, id: response.data.id, updatedFields: task });
    } catch (error: any) {
        if (error.response) {
            console.error('NOTION UPDATE ERROR:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(400).json({
            error: error.message,
            details: error.response?.data?.message || 'Check terminal'
        });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notionApi.patch(`/pages/${id}`, { archived: true });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};