import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MarketService {
    static readonly COMMISSION_RATE = 0.05;

    static async listForSale(userId: number, inventoryId: string, priceTon: number) {
        return await prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findFirst({
                where: { id: inventoryId, userId: BigInt(userId) }
            });

            if (!item) throw new Error("Предмет не найден");

            const listing = await tx.marketplaceListing.create({
                data: {
                    sellerId: BigInt(userId),
                    itemId: item.itemId,
                    priceTon,
                    status: "ACTIVE"
                }
            });

            await tx.inventoryItem.delete({ where: { id: inventoryId } });
            return listing;
        });
    }

    static async processPurchase(buyerId: number, listingId: string) {
        return await prisma.$transaction(async (tx) => {
            const listing = await tx.marketplaceListing.findUnique({
                where: { id: listingId }
            });

            if (!listing || listing.status !== "ACTIVE") throw new Error("Лот недоступен");

            await tx.marketplaceListing.update({
                where: { id: listingId },
                data: { status: "SOLD" }
            });

            await tx.inventoryItem.create({
                data: {
                    userId: BigInt(buyerId),
                    itemId: listing.itemId
                }
            });

            return true;
        });
    }
}