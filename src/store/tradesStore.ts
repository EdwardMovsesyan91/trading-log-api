import { Trade } from "../types/trade.js";

const trades = new Map<string, Trade>();

export const tradesStore = {
  list(): Trade[] {
    return Array.from(trades.values());
  },
  get(id: string): Trade | undefined {
    return trades.get(id);
  },
  upsert(trade: Trade): Trade {
    trades.set(trade.id, trade);
    return trade;
  },
  remove(id: string): boolean {
    return trades.delete(id);
  },
};

export default tradesStore;


