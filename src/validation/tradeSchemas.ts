import { z } from "zod";

export const SessionEnum = z.enum(["לונדון", "ניו-יורק"]);
export const PairEnum = z.enum(["EUR-USD", "GBP-USD"]);
export const TrendEnum = z.enum(["מגמת עליות", "מגמת ירידות"]);
export const TimeframeBlockEnum = z.enum(["4H", "1H", "30m", "15m"]);
export const TimeframeEntryEnum = z.enum(["15m", "5m", "3m", "1m"]);
export const TradeTypeEnum = z.enum(["לונג 🟢", "שורט 🔴"]);
export const TradeResultEnum = z.enum(["TP ✅", "SL ❌"]);

export const tradeBaseShape = {
  date: z.string().min(1),
  session: SessionEnum,
  pair: PairEnum,
  trendMain: TrendEnum,
  trendSecondary: TrendEnum,
  tfBlock: TimeframeBlockEnum,
  tfEntry: TimeframeEntryEnum,
  tradeType: TradeTypeEnum,
  rr: z.string().optional(),
  result: TradeResultEnum,
  notes: z.string().optional(),
  screenshotUrl: z.string().url().optional(),
};

export const createTradeSchema = z.object(tradeBaseShape);

export const updateTradeSchema = z.object({
  ...Object.fromEntries(
    Object.entries(tradeBaseShape).map(([k, v]) => [
      k,
      (v as z.ZodTypeAny).optional(),
    ])
  ),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;


