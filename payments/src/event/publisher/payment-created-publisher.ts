import { Subjects, Publisher, PaymentCreatedEvent } from '@jbev/common';
import { Stan } from 'node-nats-streaming';


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}