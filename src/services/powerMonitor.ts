import { Client } from 'ssh2';
import {sendTelegramMessage} from "./telegramService";

interface MonitorTarget {
    name: string;
    ip: string;
}

const targets: MonitorTarget[] = JSON.parse(process.env.POWER_MONITORS_TARGET || '[]');
const statusMap = new Map<string, 'online' | 'offline'>();

const SSH_CONFIG = {
    host: process.env.ASUS_HOST,
    port: Number(process.env.ASUS_PORT) || 22,
    username: process.env.ASUS_USERNAME,
    password: process.env.ASUS_PASSWORD
};

async function checkAllTargets() {
    const conn = new Client();

    conn.on('ready', () => {
        let completed = 0;

        targets.forEach((target) => {
            conn.exec(`ping -c 1 -W 2 ${target.ip}`, (err, stream) => {
                if (err) {
                    updateStatus(target.name, 'offline');
                } else {
                    stream.on('close', (code: number) => {
                        updateStatus(target.name, code === 0 ? 'online' : 'offline');

                        completed++;
                        if (completed === targets.length) conn.end();
                    });
                }
            });
        });
    }).on('error', () => {
        targets.forEach(t => updateStatus(t.name, 'offline'));
    }).connect(SSH_CONFIG);
}

function updateStatus(name: string, currentStatus: 'online' | 'offline') {
    const previousStatus = statusMap.get(name);

    if (previousStatus !== undefined && previousStatus !== currentStatus) {
        const icon = currentStatus === 'online' ? '✅' : '❌';
        const action = currentStatus === 'online' ? 'відновлено' : 'відсутнє';
        const message = `${icon} ${name}: Електропостачання ${action}`;

        console.log(message);
        sendTelegramMessage(message);
    }

    statusMap.set(name, currentStatus);
}

setInterval(checkAllTargets, 120000);