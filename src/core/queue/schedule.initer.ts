import { getQueueToken } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bull';
import _ from 'lodash';
import { AppLogger, Logger } from '../logger';
import { ScheduleOptions } from './decorators/schedule.decorator';

@Injectable()
export class ScheduleIniter implements OnModuleInit {
  constructor(private readonly moduleRef: ModuleRef, @Logger(ScheduleIniter.name) private readonly logger: AppLogger) {}

  async onModuleInit() {
    const group = _.groupBy(ScheduleOptions, (o) => o.queue);
    for (const queueName in group) {
      try {
        const queue = this.getBullQueue(queueName);
        const repeatableJobs = await queue.getRepeatableJobs();
        const jobsOptions = group[queueName];
        const jobIds = jobsOptions.map((x) => `${x.name}-${x.cron_expression}`);
        const jobsToRemove = repeatableJobs.filter((job) => !jobIds.includes(job.id));
        for (const job of jobsToRemove) {
          await queue.removeRepeatableByKey(job.key);
        }
        for (const options of jobsOptions) {
          const jobId = `${options.name}-${options.cron_expression}`;
          const existJob = repeatableJobs.find((job) => job.id === jobId);
          if (existJob != undefined) continue;
          this.logger.log(`Add job ${jobId}`);
          await queue.add(
            options.name,
            {},
            {
              repeat: {
                cron: options.cron_expression,
              },
              jobId,
            },
          );
        }
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private getBullQueue(queueName: string): Queue {
    const queueToken = getQueueToken(queueName);
    return this.moduleRef.get<Queue>(queueToken, { strict: false });
  }
}
