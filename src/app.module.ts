import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisStore from 'cache-manager-redis-store';
import { UserModule } from 'src/features/user/user.module';
import { AuthModule } from 'src/features/auth/auth.module';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { JobModule } from 'src/features/job/job.module';
import { GatewayModule } from 'src/features/gateway/gateway.module';
import { JwtModule } from '@nestjs/jwt';
import { ApmModule } from '@core/apm';
import { LoggerMiddleware, LoggerModule } from '@core/logger';
import { SharedModule } from './common/shared-module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from './config/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AsyncLocalStorage } from 'async_hooks';
import { QueueModule } from '@core/queue/queue.module';
import { EventModule } from '@core/event/event.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true, load: [typeorm] }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
      inject: [ConfigService],
    }),
    SharedModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
        username: configService.get('REDIS_USERNAME'),
        password: configService.get('REDIS_PASSWORD'),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
    QueueModule.forRoot(),
    EventModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '360d' },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    JobModule,
    GatewayModule,
    ApmModule.register(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly als: AsyncLocalStorage<{ userId: string }>) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply((req, res, next) => {
        // populate the store with some default values
        // based on the request,
        const store = {
          userId: req.headers['x-user-id'],
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      // and register it for all routes (in case of Fastify use '(.*)')
      .forRoutes('*');
  }
}
