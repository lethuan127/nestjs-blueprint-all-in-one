import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from '@core/exceptions/all-exception.filter';
import { RedisIoAdapter } from 'src/features/gateway/redis-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { apmMiddleware } from '@core/apm';
import { AppLogger } from '@core/logger';

declare const module: any;

async function bootstrap() {
  BigInt.prototype['toJSON'] = function () {
    return parseInt(this);
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  const configService = app.get(ConfigService);

  const port = configService.get('LOCAL_PORT');

  app.use(apmMiddleware);
  const logger = new AppLogger(configService);
  logger.setContext('Nest');
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nextg inventory API')
    .setDescription('Nextg inventory API')
    .setBasePath(configService.get('BASE_URL'))
    .setVersion('1.0')
    .addBearerAuth({
      type: 'apiKey',
      in: 'header',
      scheme: 'bearer',
      description: `>-
      Login to get token, enter the token with the \`Bearer: \` prefix, e.g. "Bearer abcde12345".`,
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService);
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT || port, () => {
    console.log(`Server started with port ${process.env.PORT || port}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
