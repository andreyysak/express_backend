import si from 'systeminformation';
import pm2 from 'pm2';
import { sendTelegramMessage } from '../services/telegramService';
import logger from '../logger';

const THRESHOLDS = {
    CPU_LOAD: 75,
    RAM_USAGE: 85,
    DISK_USAGE: 90
};

export const checkServerResources = async (isManualReport = false) => {
    try {
        const [cpu, mem, fs] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize()
        ]);

        const cpuLoad = Math.round(cpu.currentLoad);
        const ramUsage = Math.round((mem.active / mem.total) * 100);
        const rootFs = fs.find(f => f.mount === '/') || fs[0];
        const diskUsage = Math.round(rootFs.use);

        const statusIcon = (val: number, limit: number) => val > limit ? '⚠️' : '✅';

        const message = `🖥 **Статус Сервера Alibaba**\n\n` +
            `${statusIcon(cpuLoad, THRESHOLDS.CPU_LOAD)} **CPU:** ${cpuLoad}%\n` +
            `${statusIcon(ramUsage, THRESHOLDS.RAM_USAGE)} **RAM:** ${ramUsage}% (${(mem.active / 1024 / 1024 / 1024).toFixed(1)}GB)\n` +
            `${statusIcon(diskUsage, THRESHOLDS.DISK_USAGE)} **Disk:** ${diskUsage}% (${(rootFs.available / 1024 / 1024 / 1024).toFixed(1)}GB вільних)`;

        if (cpuLoad > THRESHOLDS.CPU_LOAD || ramUsage > THRESHOLDS.RAM_USAGE || diskUsage > THRESHOLDS.DISK_USAGE || isManualReport) {
            await sendTelegramMessage(message);
        }

        if (isManualReport) logger.info('Звіт про ресурси сервера надіслано');
    } catch (error: any) {
        logger.error(`Помилка моніторингу ресурсів: ${error.message}`);
    }
};

export const checkPm2Processes = async () => {
    pm2.connect((err) => {
        if (err) {
            logger.error(`PM2 Connect Error: ${err.message}`);
            return;
        }

        pm2.list(async (err, list) => {
            if (err) {
                logger.error(`PM2 List Error: ${err.message}`);
                pm2.disconnect();
                return;
            }

            const downProcesses = list.filter(p => p.pm2_env?.status !== 'online');

            if (downProcesses.length > 0) {
                const names = downProcesses.map(p => `❌ **${p.name}** [${p.pm2_env?.status}]`).join('\n');
                const message = `🚨 **Увага! Впав процес PM2!**\n\n${names}\n\n♻️ Спробую автоматично перезапустити...`;

                await sendTelegramMessage(message);

                downProcesses.forEach(p => {
                    if (p.name) {
                        pm2.restart(p.name, (err) => {
                            if (err) logger.error(`Не вдалося перезапустити ${p.name}: ${err.message}`);
                            else logger.info(`Процес ${p.name} успішно перезапущено монітором`);
                        });
                    }
                });
            }

            pm2.disconnect();
        });
    });
};