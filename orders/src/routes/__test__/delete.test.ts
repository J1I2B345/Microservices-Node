import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@jbev/common";

import { natsWrapper } from "../../nats-wrapper";
import { createMongooseId } from "../../test/utils";

it("deletes order of a particular user", async () => {
  const ticketOne = Ticket.build({
    id: createMongooseId(),
    title: "concert",
    price: 20,
  });
  await ticketOne.save();

  const userOne = global.signin();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete("/api/orders/" + orderOne.id)
    .set("Cookie", userOne)
    .expect(204);

  const { body } = await request(app)
    .get("/api/orders")
    .set("Cookie", userOne)
    .expect(200);
  expect(body.orders.length).toEqual(1);
  expect(body.orders[0].id).toEqual(orderOne.id);
  expect(body.orders[0].status).toEqual(OrderStatus.Cancelled);
});

it("returns 404 if order is not found", async () => {
  await request(app)
    .delete("/api/orders/5f4b7a4c5f2a8b001e7b4b4a")
    .set("Cookie", global.signin())
    .expect(404);
});

it("returns 401 if user is requesting order of another user", async () => {
  const ticketOne = Ticket.build({
    id: createMongooseId(),
    title: "concert",
    price: 20,
  });
  await ticketOne.save();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: orderFromUserOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete("/api/orders/" + orderFromUserOne.id)
    .set("Cookie", userTwo)
    .expect(401);
});

it("emits an order cancelled event", async () => {
  const ticketOne = Ticket.build({
    id: createMongooseId(),
    title: "concert",
    price: 20,
  });
  await ticketOne.save();

  const userOne = global.signin();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete("/api/orders/" + orderOne.id)
    .set("Cookie", userOne)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
