import { Client } from 'ssh2';
import { sendTelegramMessage } from '../services/telegramService';
import logger from '../logger';

const powerStatusMap = new Map<string, 'online' | 'offline'>();

export const handlePowerStatusChange = async (name: string, currentStatus: 'online' | 'offline') => {
    const previousStatus = powerStatusMap.get(name);

    if (previousStatus !== undefined && previousStatus !== currentStatus) {
        const icon = currentStatus === 'online' ? '✅' : '❌';
        const action = currentStatus === 'online' ? 'відновлено' : 'відсутнє';
        const message = `${icon} **${name}**\nЕлектропостачання ${action}`;

        await sendTelegramMessage(message);
        logger.info(`Power status changed for ${name}: ${currentStatus}`);
    }
    powerStatusMap.set(name, currentStatus);
};

export const checkAsusPowerMonitors = async () => {
    const targetsStr = process.env.POWER_MONITORS_TARGET;
    if (!targetsStr) return;

    let targets;
    try {
        targets = JSON.parse(targetsStr);
    } catch (e) {
        logger.error('Failed to parse POWER_MONITORS_TARGET JSON');
        return;
    }

    const conn = new Client();

    conn.on('ready', () => {
        let completed = 0;
        targets.forEach((target: { name: string, ip: string }) => {
            conn.exec(`ping -c 1 -W 2 ${target.ip}`, (err, stream) => {
                if (err) {
                    handlePowerStatusChange(target.name, 'offline');
                    completed++;
                } else {
                    stream.on('close', (code: number) => {
                        handlePowerStatusChange(target.name, code === 0 ? 'online' : 'offline');
                        completed++;
                        if (completed === targets.length) conn.end();
                    });
                    stream.on('data', () => {});
                    stream.stderr.on('data', () => {});
                }
            });
        });
    }).on('error', (err) => {
        logger.error('Asus SSH Connection Error: ' + err.message);
        targets.forEach((t: any) => handlePowerStatusChange(t.name, 'offline'));
    }).connect({
        host: process.env.ASUS_HOST,
        port: Number(process.env.ASUS_PORT) || 22,
        username: process.env.ASUS_USERNAME,
        password: process.env.ASUS_PASSWORD,
        readyTimeout: 10000
    });
};