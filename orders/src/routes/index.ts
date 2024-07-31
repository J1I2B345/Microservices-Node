import { requireAuth } from "@jbev/common";
import express, { Request, Response } from "express";

import { Order } from "../models/order";

const router = express.Router();

router.get("/api/orders/health", (req: Request, res: Response) => {
  res.send({ status: "ok" });
});

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("ticket");

  res.send({ orders });
});

export { router as indexOrderRouter };
