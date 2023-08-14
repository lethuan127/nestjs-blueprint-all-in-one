import { DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class QueueModule {
  static queues: string[] = new Array<string>();

  static forRoot(): DynamicModule {
    const queuesModule = BullModule.registerQueue(
      ...this.queues.map((x) => ({
        name: x,
        defaultJobOptions: {
          removeOnComplete: true,
        },
      })),
    );
    return {
      imports: [
        queuesModule,
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
      ],
      module: QueueModule,
      exports: [queuesModule],
      global: true,
    };
  }
}
