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

            const mappedTasks = results.map((page: any) => ({
                id: page.id,
                title: page.properties.Name.title[0]?.plain_text || 'Без назви',
                status: page.properties.Status.select?.name || 'Без статусу',
                project: page.properties.Project.select?.name || 'Без проекту',
                category: page.properties.Category.select?.name || 'Інше',
                priority: page.properties.Priority.select?.name || 'Не вказано',
                link: page.properties.Link.url,
            }));

            tasks = [...tasks, ...mappedTasks];
            hasMore = has_more;
            cursor = next_cursor;
        }

        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const task = req.body;
        const response = await notionApi.post('/pages', {
            parent: { database_id: DATABASE_ID },
            properties: {
                Name: { title: [{ text: { content: task.title } }] },
                Status: { select: { name: task.status } },
                Project: { select: { name: task.project } },
                Category: { select: { name: task.category } },
                Priority: { select: { name: task.priority } },
            },
        });
        res.json({ ...task, id: response.data.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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