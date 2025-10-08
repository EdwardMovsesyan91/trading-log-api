import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";
import { tradesRepository } from "../repositories/tradesRepository.js";
import {
  createTradeSchema,
  updateTradeSchema,
} from "../validation/tradeSchemas.js";
import { Trade } from "../types/trade.js";

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

export async function deleteTrade(req: Request, res: Response) {
  const ok = await tradesRepository.remove(req.params.id);
  if (!ok) {
    throw createHttpError(404, "Trade not found");
  }
  res.status(204).send();
}

export default { listTrades, getTrade, createTrade, updateTrade, deleteTrade };
