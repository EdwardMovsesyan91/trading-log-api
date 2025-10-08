import { z } from "zod";

// ==== Enums (as you had) ====
export const SessionEnum = z.enum(["לונדון", "ניו-יורק"]);
export const PairEnum = z.enum(["EUR-USD", "GBP-USD"]);
export const TrendEnum = z.enum(["מגמת עליות", "מגמת ירידות"]);
export const TimeframeBlockEnum = z.enum(["4H", "1H", "30m", "15m"]);
export const TimeframeEntryEnum = z.enum(["15m", "5m", "3m", "1m"]);
export const TradeTypeEnum = z.enum(["לונג 🟢", "שורט 🔴"]);
export const TradeResultEnum = z.enum(["TP ✅", "SL ❌"]);

// ==== Helpers ====
const isoDateString = z.preprocess(
  (v) => {
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "string") return v.trim();
    return v;
  },
  z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
);

const trimmed = (min = 0, max = 2000) =>
  z
    .string()
    .transform((s) => s.trim())
    .refine(
      (s) => s.length >= min && s.length <= max,
      `Must be ${min}-${max} chars`
    );

const rrRegex = /^(\d+(\.\d+)?)(:(\d+(\.\d+)?))?$/; // "2", "1:2", "1.5:3"
const rrField = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((s) => rrRegex.test(s), "Use formats like 2 or 1:2")
  .optional();

const publicIdRegex = /^[\w\-\/]+$/; // simple, safe public_id check

// ==== Base shape (create) ====
export const tradeBaseShape = {
  date: isoDateString, // ISO string
  session: SessionEnum,
  pair: PairEnum,
  trendMain: TrendEnum,
  trendSecondary: TrendEnum,
  tfBlock: TimeframeBlockEnum,
  tfEntry: TimeframeEntryEnum,
  tradeType: TradeTypeEnum,
  rr: rrField,
  result: TradeResultEnum,
  notes: trimmed(0, 2000).optional(),
  screenshotUrl: z.string().url().optional(),
  screenshotId: z.string().regex(publicIdRegex, "Invalid public_id").optional(),
} as const;

export const createTradeSchema = z.object(tradeBaseShape).strict();

// Partial update; ensure at least one field provided
export const updateTradeSchema = createTradeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
