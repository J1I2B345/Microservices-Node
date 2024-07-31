import { Publisher, Subjects, TicketUpdatedEvent } from "@jbev/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
