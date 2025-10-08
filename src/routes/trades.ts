import { Router } from "express";
import {
  listTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
  getCloudinarySignature,
} from "../controllers/tradesController.js";

const router = Router();

router.get("/signature", getCloudinarySignature);
router.get("/", listTrades);
router.get("/:id", getTrade);
router.post("/", createTrade);
router.patch("/:id", updateTrade);
router.delete("/:id", deleteTrade);

export default router;
