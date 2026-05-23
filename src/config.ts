import { config } from 'dotenv';
config();

export const ENV = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    DATABASE_URL: process.env.DATABASE_URL || '',
    TONAPI_KEY: process.env.TONAPI_KEY || '',
    RECEIVER_WALLET: process.env.RECEIVER_WALLET || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
};