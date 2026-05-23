import { Bot, webhookCallback } from 'grammy';
import { ENV } from '../src/config';
import { marketplaceHandler } from '../src/handlers/marketplace';
import { gameHandler } from '../src/handlers/game';
import { shopHandler } from '../src/handlers/shop';
import { featuresHandler } from '../src/handlers/features';
import { PrismaClient } from '@prisma/client';

// Используем глобальный инстанс для Prisma, чтобы Vercel не съел все соединения
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const bot = new Bot(ENV.BOT_TOKEN);

// Отслеживаем каждое сообщение
bot.use(async (ctx, next) => {
    if (ctx.from && !ctx.from.is_bot) {
        try {
            const userId = BigInt(ctx.from.id);
            await prisma.user.upsert({
                where: { id: userId },
                update: { username: ctx.from.username, name: ctx.from.first_name },
                create: {
                    id: userId,
                    username: ctx.from.username || '',
                    name: ctx.from.first_name || 'Игрок',
                }
            });
        } catch (e) {
            console.error(`[DATABASE] ❌ ОШИБКА:`, e);
        }
    }
    return next();
});

// Подключаем модули
bot.use(gameHandler);
bot.use(marketplaceHandler);
bot.use(shopHandler);
bot.use(featuresHandler);

// Команда /start
bot.command('start', async (ctx) => {
    if (!ctx.from) return;
    const userId = BigInt(ctx.from.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return;

    const keyboard = new InlineKeyboard()
        .text('▶️ Продолжить сюжет', 'continue_game').row()
        .text('🏪 TON Маркетплейс', 'market_menu').row()
        .text('🏋️ Спортзал', 'gym').row()
        .text('👑 Рейтинг', 'rating');

    const text = `🌃 *Добро пожаловать в Hood City!*\n\n` +
                 `👤 Игрок: ${user.name}\n` +
                 `🏆 Репутация: ${user.reputation}\n` +
                 `❤️ Здоровье: ${user.health}\n\n` +
                 `Выбери действие:`;
    
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard });
});

// ВАЖНО: Вместо bot.start() используем webhookCallback
export default webhookCallback(bot, 'http');