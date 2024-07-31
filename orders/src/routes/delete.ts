import express, { Request, Response } from "express";
import {
  requireAuth,
  OrderStatus,
  NotFoundError,
  NotAuthorizedError,
} from "@jbev/common";

import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
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
    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    return res.status(204).send({ order });
  }
);

export { router as deleteOrderRouter };
