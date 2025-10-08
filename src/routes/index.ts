import { Router } from "express";
import healthRouter from "./health.js";
import tradesRouter from "./trades.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/trades", tradesRouter);

export default router;
