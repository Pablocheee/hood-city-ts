export interface ShopItem {
    id: string;
    name: string;
    price: number;
    supply: number;
    emoji: string;
    description: string;
    collection: string;
    limitedInfo: string;
}

// Твоя Premium Fashion v1 коллекция
export const LIMITED_COLLECTION: Record<string, ShopItem> = {
    "supreme_cap": {
        id: "supreme_cap",
        name: "Бейсболка Supreme",
        price: 0.15,
        supply: 30,
        emoji: "🧢",
        description: "Культовая бейсболка красного цвета с белым логотипом",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 30/30"
    },
    "armani_glasses": {
        id: "armani_glasses",
        name: "Очки Armani",
        price: 0.4,
        supply: 20,
        emoji: "🕶️",
        description: "Элегантные очки от Armani - статус и стиль",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 20/20"
    },
    "gucci_chain": {
        id: "gucci_chain",
        name: "Цепочка Gucci",
        price: 0.45,
        supply: 5,
        emoji: "📿",
        description: "Роскошная цепочка Gucci",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 5/5"
    },
    "stone_island_tshirt": {
        id: "stone_island_tshirt",
        name: "Футболка Stone Island",
        price: 0.3,
        supply: 7,
        emoji: "👕",
        description: "Новая злая Stone Island",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 7/7"
    },
    "burberry_coat": {
        id: "burberry_coat",
        name: "Пальто Burberry",
        price: 0.45,
        supply: 15,
        emoji: "🧥",
        description: "Классическое пальто с знаменитым узором",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 15/15"
    },
    "adidas_yeezy": {
        id: "adidas_yeezy",
        name: "Кроссовки Adidas Yeezy",
        price: 0.35,
        supply: 25,
        emoji: "👟",
        description: "Легендарные кроссовки от Канье Уэста",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 25/25"
    },
    "nike_jordan": {
        id: "nike_jordan",
        name: "Кроссовки Nike Jordan",
        price: 0.25,
        supply: 30,
        emoji: "👟",
        description: "Легендарные кроссовки для настоящих ценителей",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 30/30"
    },
    "gucci_bag": {
        id: "gucci_bag",
        name: "Сумка Gucci",
        price: 0.4,
        supply: 10,
        emoji: "👜",
        description: "Роскошная сумка с фирменным логотипом",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 10/10"
    },
    "supreme_hoodie": {
        id: "supreme_hoodie",
        name: "Худи Supreme",
        price: 0.2,
        supply: 15,
        emoji: "👕",
        description: "Культовый бренд уличной моды",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 15/15"
    },
    "rolex_watch": {
        id: "rolex_watch",
        name: "Часы Rolex",
        price: 0.5,
        supply: 10,
        emoji: "⌚️",
        description: "Статусные часы для успешных людей",
        collection: "Premium Fashion v1",
        limitedInfo: "Ограниченный выпуск: 10/10"
    }
};