/* eslint-disable @typescript-eslint/no-empty-function */
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SNAPSHOT_QUEUE_NAME } from '../constant';

@Processor(SNAPSHOT_QUEUE_NAME)
export class SnapshotConsumer {
  private readonly logger = new Logger(SnapshotConsumer.name);

  @OnQueueActive()
  onActive(job: Job<unknown>) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<unknown>) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  handler(_job: Job, error: Error) {
    this.logger.error(error.message);
  }

  @Process()
  async snapshot(_job: Job) {}
}
