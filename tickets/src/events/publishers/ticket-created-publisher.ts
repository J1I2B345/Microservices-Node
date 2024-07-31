import { Publisher, Subjects, TicketCreatedEvent } from "@jbev/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
