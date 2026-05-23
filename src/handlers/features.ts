import { Composer, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { LIMITED_COLLECTION } from '../data/collection';

const prisma = new PrismaClient();
export const featuresHandler = new Composer();

// --- ИНВЕНТАРЬ ---
featuresHandler.callbackQuery('inventory', async (ctx) => {
    if (!ctx.from) return;
    const userId = BigInt(ctx.from.id);
    
    const items = await prisma.inventoryItem.findMany({ where: { userId } });
    
    if (items.length === 0) {
        const keyboard = new InlineKeyboard()
            .text('🛒 В магазин', 'shop_menu').row()
            .text('🔙 В меню', 'main_menu');
        return ctx.editMessageText('📦 *Твой инвентарь*\n\nПока здесь пусто...', { parse_mode: 'Markdown', reply_markup: keyboard });
    }

    let text = '📦 *Твой инвентарь*\n\n';
    for (const dbItem of items) {
        const itemInfo = LIMITED_COLLECTION[dbItem.itemId];
        if (itemInfo) {
            text += `${itemInfo.emoji} *${itemInfo.name}*\n ${itemInfo.description}\n🏷️ ${itemInfo.limitedInfo}\n\n`;
        }
    }

    const keyboard = new InlineKeyboard()
        .text('💰 Продать на маркетплейсе', 'market_sell').row()
        .text('🔙 Назад в меню', 'main_menu');

    await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard });
});

featuresHandler.callbackQuery('shop_menu', async (ctx) => {
    ctx.match = ["", "shop"];
    return featuresHandler.middleware()(ctx, async () => {}); 
});

// --- РЕЙТИНГ ---
featuresHandler.callbackQuery('rating', async (ctx) => {
    const topPlayers = await prisma.user.findMany({
        orderBy: { reputation: 'desc' },
        take: 10
    });

    let text = '🏆 *Топ 10 игроков Hood City*\n\n';
    topPlayers.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
        text += `${medal} *${index + 1}.* ${player.name} - \`${player.reputation}\` репутации\n`;
    });

    const keyboard = new InlineKeyboard().text('🔙 Назад в меню', 'main_menu');
    await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard });
});

// --- СПОРТЗАЛ ---
featuresHandler.callbackQuery('gym', async (ctx) => {
    const keyboard = new InlineKeyboard()
        .text('💪 Качать бицепс (+10 ХП)', 'gym_biceps').row()
        .text('🦵 Приседать (+15 ХП)', 'gym_squat').row()
        .text('🔙 В меню', 'main_menu');

    const text = `🏋️ *Спортзал 'Стальные Мышцы'*\n\nВыбери тренировку:`;
    await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard });
});

featuresHandler.callbackQuery(/^gym_(biceps|squat)$/, async (ctx) => {
    if (!ctx.from) return;
    const type = ctx.match[1];
    const hpGain = type === 'biceps' ? 10 : 15;
    const actionName = type === 'biceps' ? 'Бицепс' : 'Приседания';

    await prisma.user.update({
        where: { id: BigInt(ctx.from.id) },
        data: { health: { increment: hpGain } }
    });

    await ctx.answerCallbackQuery({ text: `💪 ${actionName}: +${hpGain} ХП!`, show_alert: true });
});