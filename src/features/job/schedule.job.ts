import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SNAPSHOT_QUEUE_NAME } from './constant';

@Injectable()
export class ScheduleJob implements OnModuleInit {
  constructor(@InjectQueue(SNAPSHOT_QUEUE_NAME) private snapshotQueue: Queue) {}

  async onModuleInit() {
    await this.snapshotQueue.add(
      {},
      {
        repeat: {
          cron: '0 0 * * * *',
        },
        jobId: SNAPSHOT_QUEUE_NAME,
      },
    );
  }
}
