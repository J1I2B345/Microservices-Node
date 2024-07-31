import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { createMongooseId } from "../../test/utils";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: createMongooseId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it("fetches order of a particular user", async () => {
  const ticketOne = await buildTicket();

  const userOne = global.signin();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .get("/api/orders/" + orderOne.id)
    .set("Cookie", userOne)
    .expect(200);
});

it("returns 404 if order is not found", async () => {
  await request(app)
    .get("/api/orders/5f4b7a4c5f2a8b001e7b4b4a")
    .set("Cookie", global.signin())
    .expect(404);
});

it("returns 401 if user is requesting order of another user", async () => {
  const ticketOne = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: orderFromUserOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .get("/api/orders/" + orderFromUserOne.id)
    .set("Cookie", userTwo)
    .expect(401);
});
