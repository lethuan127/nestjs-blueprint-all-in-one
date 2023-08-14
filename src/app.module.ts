import { Module, CacheModule, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
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
import { ClsModule } from 'nestjs-cls';
import { SharedModule } from './common/shared-module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from './config/typeorm';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
      inject: [ConfigService],
    }),
    SharedModule,
    ClsModule.forRoot({
      global: true,
    }),
    LoggerModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true, load: [typeorm] }),
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
    LoggerModule,
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
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
