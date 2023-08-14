import { Process, ProcessOptions } from '@nestjs/bull';

export interface ScheduleOption {
  name: string;
  queue: string;
  cron_expression: string;
}

export const ScheduleOptions: ScheduleOption[] = new Array<ScheduleOption>();

export function Schedule(options: { name: string; queue: string; cron_expression: string } & ProcessOptions) {
  ScheduleOptions.push({ ...options });
  return Process({ name: options.name, concurrency: options.concurrency });
}
