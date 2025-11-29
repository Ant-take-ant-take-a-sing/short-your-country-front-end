// types/derivativeNews.ts

export interface DerivativeNews {
    id: string;
    title: string;
    summary: string;
    symbol: string;     // e.g. "BTCUSD", "XAUUSD"
    source?: string;
    time?: string;
    imageUrl?: string;
}
