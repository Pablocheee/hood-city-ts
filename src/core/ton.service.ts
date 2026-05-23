import { PrismaClient } from '@prisma/client';
import { ENV } from '../config';

const prisma = new PrismaClient();

export class TonService {
    // Генерируем безопасный комментарий (как в Python: id_предмета)
    static generateComment(userId: number, referenceId: string): string {
        return `HC_${userId}_${referenceId}`;
    }

    static async verifyPayment(userId: number, expectedAmountTon: number, expectedComment: string, purpose: string): Promise<boolean> {
        try {
            // Используем TonCenter API, точно как было в твоем оригинальном Python-коде!
            const url = `https://toncenter.com/api/v2/getTransactions?address=${ENV.RECEIVER_WALLET}&limit=20`;
            
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Ошибка API TonCenter:", response.statusText);
                return false;
            }

            const data = await response.json();
            const transactions = data.result || [];

            for (const tx of transactions) {
                const inMsg = tx.in_msg;
                if (!inMsg) continue;

                const comment = inMsg.message || '';
                const amountTon = Number(inMsg.value || 0) / 1e9;
                
                // Уникальный хэш транзакции (чтобы не выдать предмет дважды за один перевод)
                const hash = tx.transaction_id?.hash;
                if (!hash) continue;

                // Проверяем совпадение комментария и суммы (погрешность на газ)
                if (comment === expectedComment && Math.abs(amountTon - expectedAmountTon) < 0.001) {
                    
                    // Проверяем в нашей БД, не обрабатывали ли мы уже этот перевод
                    const existingTx = await prisma.processedTransaction.findUnique({
                        where: { hash: hash }
                    });

                    // Если транзакция уже есть в базе — пропускаем (защита от Double Spend)
                    if (existingTx) continue;

                    // Записываем транзакцию в базу как обработанную
                    await prisma.processedTransaction.create({
                        data: {
                            hash: hash,
                            amountTon,
                            userId: BigInt(userId),
                            purpose
                        }
                    });

                    return true; // Оплата подтверждена!
                }
            }
            return false;
        } catch (error) {
            console.error("Ошибка при проверке TON:", error);
            return false;
        }
    }
}