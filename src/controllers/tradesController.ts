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
import { createDeleteSignature } from "../utils/extractPublicIdFromUrl.js";

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

/** Extract Cloudinary public_id from a secure URL, e.g. ".../upload/v123/trades/abcd123.webp" -> "trades/abcd123" */
function extractPublicIdFromUrl(url?: string | null) {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+\/[^/.]+)\.\w+$/);
  return match ? match[1] : null;
}

export async function updateTrade(req: Request, res: Response) {
  const existing = await tradesRepository.get(req.params.id);
  if (!existing) {
    throw createHttpError(404, "Trade not found");
  }

  // Validate incoming updates
  const updates = updateTradeSchema.parse(req.body);

  // Identify old and new Cloudinary public_ids
  const oldPublicId =
    existing.screenshotId || extractPublicIdFromUrl(existing.screenshotUrl);

  const newPublicIdCandidate =
    (typeof updates.screenshotId === "string" && updates.screenshotId.trim()) ||
    extractPublicIdFromUrl(updates.screenshotUrl) ||
    null;

  // Merge record (optionally stamp updatedAt if you keep it)
  const updated: Trade = {
    ...existing,
    ...updates,
    screenshotId: newPublicIdCandidate ?? existing.screenshotId,
    updatedAt: new Date().toISOString(),
  };

  // Persist first (never lose the new values if cleanup fails)
  await tradesRepository.upsert(updated);

  // If the image changed, delete the previous Cloudinary asset (best-effort)
  const shouldDeleteOld =
    oldPublicId && newPublicIdCandidate && oldPublicId !== newPublicIdCandidate;

  if (shouldDeleteOld) {
    try {
      const { signature, timestamp } = createDeleteSignature(oldPublicId);
      const form = new URLSearchParams();
      form.append("public_id", oldPublicId);
      form.append("timestamp", String(timestamp));
      form.append("api_key", process.env.CLOUDINARY_API_KEY!);
      form.append("signature", signature);

      await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: form,
        }
      );
    } catch (err) {
      // Don’t fail the update just because cleanup failed
      console.warn("Cloudinary delete (old image) failed:", err);
    }
  }

  res.json(updated);
}

export async function deleteTrade(req: any, res: any) {
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
