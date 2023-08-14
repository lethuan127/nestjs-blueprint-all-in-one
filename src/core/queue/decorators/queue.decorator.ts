import { InjectQueue } from '@nestjs/bull';
import { QueueModule } from '../queue.module';

export function Queue(name: string) {
  if (!QueueModule.queues.includes(name)) {
    QueueModule.queues.push(name);
  }
  return InjectQueue(name);
}
