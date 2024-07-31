import express, { Request, Response } from "express";
import { NotAuthorizedError, NotFoundError, requireAuth } from "@jbev/common";

import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    if (!req.params.orderId) {
      return res.status(400).send({ message: "orderId is required" });
    }

    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    return res.send(order);
  }
);

export { router as showOrderRouter };
