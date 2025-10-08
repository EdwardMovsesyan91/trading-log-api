import mongoose from "mongoose";
import { Trade } from "../types/trade.js";
import TradeModel from "../models/TradeModel.js";
import { tradesStore } from "../store/tradesStore.js";

function dbReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export const tradesRepository = {
  async list(): Promise<Trade[]> {
    if (dbReady()) {
      const docs = await TradeModel.find().lean();
      return docs as any;
    }
    return tradesStore.list();
  },

  async get(id: string): Promise<Trade | undefined> {
    if (dbReady()) {
      const doc = await TradeModel.findOne({ id }).lean();
      return (doc as Trade | null) || undefined;
    }
    return tradesStore.get(id);
  },

  async upsert(trade: Trade): Promise<Trade> {
    if (dbReady()) {
      await TradeModel.updateOne({ id: trade.id }, trade, { upsert: true });
      return trade;
    }
    return tradesStore.upsert(trade);
  },

  async remove(id: string): Promise<boolean> {
    if (dbReady()) {
      const res = await TradeModel.deleteOne({ id });
      return res.deletedCount === 1;
    }
    return tradesStore.remove(id);
  },
};

export default tradesRepository;
