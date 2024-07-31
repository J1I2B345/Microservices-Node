import { Subjects, Publisher, OrderCancelledEvent } from "@jbev/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
