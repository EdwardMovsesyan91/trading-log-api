import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";
import { tradesRepository } from "../repositories/tradesRepository.js";
import {
  createTradeSchema,
  updateTradeSchema,
} from "../validation/tradeSchemas.js";
import { Trade } from "../types/trade.js";
import crypto from "crypto";
import {
  createDeleteSignature,
  extractPublicIdFromUrl,
} from "../utils/extractPublicIdFromUrl.js";

export async function listTrades(_req: Request, res: Response) {
  const items = await tradesRepository.list();
  res.json(items);
}

export async function getTrade(req: Request, res: Response) {
  const trade = await tradesRepository.get(req.params.id);
  if (!trade) {
    throw createHttpError(404, "Trade not found");
  }
  res.json(trade);
}

export async function createTrade(req: Request, res: Response) {
  const parsed = createTradeSchema.parse(req.body);
  const trade: Trade = { id: uuid(), ...parsed };
  await tradesRepository.upsert(trade);
  res.status(201).json(trade);
}

export async function updateTrade(req: Request, res: Response) {
  const existing = await tradesRepository.get(req.params.id);
  if (!existing) {
    throw createHttpError(404, "Trade not found");
  }
  const updates = updateTradeSchema.parse(req.body);
  const updated: Trade = { ...existing, ...updates };
  await tradesRepository.upsert(updated);
  res.json(updated);
}

export async function deleteTrade(req, res) {
  const id = req.params.id;

  const trade = await tradesRepository.get(id);
  if (!trade) return res.status(404).json({ message: "Trade not found" });

  // delete DB record first
  await tradesRepository.remove(id);

  // if there’s an image, delete it from Cloudinary manually
  if (trade.screenshotUrl) {
    const match = trade.screenshotUrl.match(
      /\/upload\/(?:v\d+\/)?([^/.]+\/[^/.]+)\.\w+$/
    );
    const publicId = match ? match[1] : null; // e.g. "trades/abcd123"
    if (publicId) {
      const { signature, timestamp } = createDeleteSignature(publicId);

      const form = new URLSearchParams();
      form.append("public_id", publicId);
      form.append("timestamp", timestamp.toString());
      form.append("api_key", process.env.CLOUDINARY_API_KEY!);
      form.append("signature", signature);

      await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: form,
        }
      ).catch((err) => console.error("Cloudinary delete failed:", err));
    }
  }

  res.sendStatus(204);
}

export function getCloudinarySignature(req: Request, res: Response) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = (req.query.folder as string) || "trades";

  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + process.env.CLOUDINARY_API_SECRET!)
    .digest("hex");

  res.json({
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}

export default {
  listTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
  getCloudinarySignature,
};
