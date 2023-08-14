import { Processor } from '@nestjs/bull';
import { QueueModule } from '../queue.module';

export function Consumer(name: string) {
  if (!QueueModule.queues.includes(name)) {
    QueueModule.queues.push(name);
  }
  return Processor(name);
}
