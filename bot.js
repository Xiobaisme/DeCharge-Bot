const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { Telegraf } = require('telegraf');
chromium.use(stealth);

// --- CONFIG MENGGUNAKAN GITHUB SECRETS ---
const TELE_TOKEN = process.env.TELE_TOKEN; 
const CHAT_ID = process.env.CHAT_ID;
const PROXY_USER = process.env.PROXY_USER;
const PROXY_PASS = process.env.PROXY_PASS;

const bot = new Telegraf(TELE_TOKEN);

let isRunning = false;
let totalClicks = 0;
let currentCycle = 0;

const proxyList = [
    { server: 'http://31.59.20.176:6754' }, { server: 'http://31.56.127.193:7684' },
    { server: 'http://45.38.107.97:6014' }, { server: 'http://107.172.163.27:6543' },
    { server: 'http://198.23.243.226:6361' }, { server: 'http://216.10.27.159:6837' },
    { server: 'http://142.111.67.146:5611' }, { server: 'http://191.96.254.138:6185' },
    { server: 'http://31.58.9.4:6077' }, { server: 'http://23.229.19.94:8689' }
];

const targetLinks = [
    'https://bzz.link.chaingpt.org/52adbd17', 'https://bzz.link.chaingpt.org/75b9f374', 
    'https://bzz.link.chaingpt.org/f6a1b151', 'https://bzz.link.chaingpt.org/3ae710c1', 
    'https://bzz.link.chaingpt.org/3e8a083b', 'https://bzz.link.chaingpt.org/0921f62b', 
    'https://bzz.link.chaingpt.org/61311628'
];

async function runTask(url, index, proxy) {
    if (!isRunning) return;
    const browser = await chromium.launch({ 
        headless: true, 
        proxy: { server: proxy.server, username: PROXY_USER, password: PROXY_PASS } 
    });
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(15000); 
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(10000);
        totalClicks++;
        console.log(`✅ Berhasil: Link ${index + 1}`);
    } catch (err) {
        console.log(`❌ Gagal: Link ${index + 1}`);
    } finally {
        await browser.close();
    }
}

async function startLoop() {
    while (isRunning) {
        currentCycle++;
        await bot.telegram.sendMessage(CHAT_ID, `🚀 Memulai Siklus ke-${currentCycle}`);
        for (let i = 0; i < targetLinks.length; i++) {
            if (!isRunning) break;
            const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
            await runTask(targetLinks[i], i, randomProxy);
            await new Promise(res => setTimeout(res, 5000));
        }
        if (isRunning) {
            await bot.telegram.sendMessage(CHAT_ID, `💤 Siklus ${currentCycle} selesai. Istirahat 30 menit.`);
            await new Promise(res => setTimeout(res, 1800000));
        }
    }
}

bot.command('run', (ctx) => {
    if (isRunning) return ctx.reply('Bot sudah berjalan!');
    isRunning = true;
    ctx.reply('▶️ Bot dijalankan...');
    startLoop();
});

bot.command('stop', (ctx) => {
    isRunning = false;
    ctx.reply('⏹️ Bot dihentikan setelah tugas selesai.');
});

bot.command('status', (ctx) => {
    ctx.reply(`📊 Status: ${isRunning ? 'Running' : 'Stopped'}\n🔄 Siklus: ${currentCycle}`);
});

bot.command('klik', (ctx) => {
    ctx.reply(`🖱️ Total Klik Berhasil: ${totalClicks}`);
});

// Menangani error agar bot tidak crash di GitHub Actions
bot.catch((err) => console.error("Telegram Error:", err));
bot.launch();
console.log("Dashboard Telegram Aktif.");