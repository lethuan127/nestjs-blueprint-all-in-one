/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NOTIFICATION_QUEUE_NAME, SNAPSHOT_QUEUE_NAME } from './constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleJob } from './schedule.job';
import { GatewayModule } from 'src/features/gateway/gateway.module';

const queueModule = BullModule.registerQueue(
  {
    name: NOTIFICATION_QUEUE_NAME,
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
  {
    name: SNAPSHOT_QUEUE_NAME,
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
);
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          db: 2,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USERNAME'),
          password: configService.get('REDIS_PASSWORD'),
        },
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    queueModule,
    GatewayModule,
  ],
  providers: [ScheduleJob],
  exports: [queueModule],
})
export class JobModule {}
