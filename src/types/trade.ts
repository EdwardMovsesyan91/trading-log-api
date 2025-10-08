export type Session = "לונדון" | "ניו-יורק";
export type Pair = "EUR-USD" | "GBP-USD";
export type Trend = "מגמת עליות" | "מגמת ירידות";
export type TimeframeBlock = "4H" | "1H" | "30m" | "15m";
export type TimeframeEntry = "15m" | "5m" | "3m" | "1m";
export type TradeType = "לונג 🟢" | "שורט 🔴";
export type TradeResult = "TP ✅" | "SL ❌";

export interface Trade {
  _id?: string; // MongoDB-generated ID
  id: string; // to associate the trade with the user
  date: string;
  session: Session;
  pair: Pair;
  trendMain: Trend;
  trendSecondary: Trend;
  tfBlock: TimeframeBlock;
  tfEntry: TimeframeEntry;
  tradeType: TradeType;
  rr?: string;
  result: TradeResult;
  notes?: string;
  screenshotUrl?: string; // Cloudinary image URL
  screenshotId?: string; // Cloudinary public_id (for deletion)
  createdAt?: string;
  updatedAt?: string;
}
