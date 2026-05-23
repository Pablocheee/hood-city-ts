import { Composer, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { STORY } from '../data/story';

const prisma = new PrismaClient();
export const gameHandler = new Composer();

// --- ГЛАВНОЕ МЕНЮ ---
gameHandler.callbackQuery('main_menu', async (ctx) => {
    if (!ctx.from) return;
    const user = await prisma.user.findUnique({ where: { id: BigInt(ctx.from.id) } });
    if (!user) return;

    const keyboard = new InlineKeyboard()
        .text('▶️ Продолжить сюжет', 'continue_game').row()
        .text('🏪 TON Маркетплейс', 'market_menu').row();

    const text = `📱 *Меню Hood City*\n\n👤 Игрок: ${user.name}\n🏆 Репутация: ${user.reputation}\n❤️ Здоровье: ${user.health}\n\nВыбери действие:`;
    await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard });
});

// --- ПРОДОЛЖЕНИЕ ИГРЫ И ТАЙМЕРЫ ---
gameHandler.callbackQuery('continue_game', async (ctx) => {
    if (!ctx.from) return;
    const user = await prisma.user.findUnique({ where: { id: BigInt(ctx.from.id) } });
    if (!user) return;

    const sceneId = user.scene || 'start';

    // Проверка таймера перед началом Дня 2
    if (sceneId === 'wait_day2') {
        if (!user.day1CompletedAt) return;
        const passedMs = Date.now() - user.day1CompletedAt.getTime();
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (passedMs < twoHours) {
            const leftMin = Math.ceil((twoHours - passedMs) / 60000);
            return ctx.answerCallbackQuery({ text: `⏰ День 2 будет доступен через ${leftMin} минут!`, show_alert: true });
        }
        // Если время прошло, переводим на День 2
        await prisma.user.update({ where: { id: user.id }, data: { scene: 'day2_start' } });
        return renderScene(ctx, 'day2_start', user);
    }

    // Проверка таймера перед началом Дня 3
    if (sceneId === 'wait_day3') {
        if (!user.day2CompletedAt) return;
        const passedMs = Date.now() - user.day2CompletedAt.getTime();
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (passedMs < twoHours) {
            const leftMin = Math.ceil((twoHours - passedMs) / 60000);
            return ctx.answerCallbackQuery({ text: `⏰ День 3 будет доступен через ${leftMin} минут!`, show_alert: true });
        }
        await prisma.user.update({ where: { id: user.id }, data: { scene: 'day3_start' } });
        return renderScene(ctx, 'day3_start', user);
    }

    await renderScene(ctx, sceneId, user);
});

// --- ОБРАБОТКА ВЫБОРОВ В СЮЖЕТЕ ---
gameHandler.callbackQuery(/^action_(.+)_(.+)$/, async (ctx) => {
    if (!ctx.from) return;
    const currentSceneId = ctx.match[1];
    const choiceIndex = parseInt(ctx.match[2]);
    const scene = STORY[currentSceneId];
    if (!scene) return;

    const choice = scene.choices[choiceIndex];
    if (choice.alertText) await ctx.answerCallbackQuery({ text: choice.alertText });
    else await ctx.answerCallbackQuery();

    const userId = BigInt(ctx.from.id);
    const updateData: any = {
        reputation: { increment: choice.repChange || 0 },
        health: { increment: choice.hpChange || 0 },
        scene: choice.nextScene
    };

    // Если игрок уходит в меню после конца дня - ставим таймер
    if (choice.nextScene === 'menu') {
        if (currentSceneId === 'end_day1') {
            updateData.scene = 'wait_day2';
            updateData.day1CompletedAt = new Date();
        } else if (['day2_success', 'day2_fail', 'day2_stay_home', 'day2_refuse_offer'].includes(currentSceneId)) {
            updateData.scene = 'wait_day3';
            updateData.day2CompletedAt = new Date();
        }
        
        // Сохраняем данные и показываем меню
        await prisma.user.update({ where: { id: userId }, data: updateData });
        ctx.match = ["", "main_menu"];
        return gameHandler.middleware()(ctx, async () => {});
    }

    // Сохраняем обычный выбор и рисуем следующую сцену
    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    await renderScene(ctx, choice.nextScene, updatedUser);
});

// --- ФУНКЦИЯ ОТРИСОВКИ ---
async function renderScene(ctx: any, sceneId: string, user: any) {
    const scene = STORY[sceneId];
    if (!scene) return;

    const keyboard = new InlineKeyboard();
    for (const choice of scene.choices) {
        keyboard.text(choice.text, `action_${sceneId}_${scene.choices.indexOf(choice)}`).row();
    }

    // Подставляем имя игрока в текст!
    const text = scene.text.replace(/{player_name}/g, user.name || 'Игрок');

    try { 
        await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard }); 
    } catch (e) { 
        await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard }); 
    }
}