import mongoose, { Schema } from "mongoose";
import { Trade } from "../types/trade.js";

const tradeSchema = new Schema<Trade>(
  {
    id: { type: String, index: true, unique: true },
    date: { type: String, required: true },
    session: { type: String, required: true },
    pair: { type: String, required: true },
    trendMain: { type: String, required: true },
    trendSecondary: { type: String, required: true },
    tfBlock: { type: String, required: true },
    tfEntry: { type: String, required: true },
    tradeType: { type: String, required: true },
    rr: { type: String },
    result: { type: String, required: true },
    notes: { type: String },
    screenshotUrl: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const TradeModel =
  mongoose.models.Trade || mongoose.model<Trade>("Trade", tradeSchema);

export default TradeModel;


