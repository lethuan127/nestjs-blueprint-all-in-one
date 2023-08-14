import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from './app-logger';
import { createLoggerProviders } from './logger.providers';

export class LoggerModule {
  static nameForLoggers: string[] = new Array<string>();
  static forRoot(): DynamicModule {
    const nameLoggerProviders = createLoggerProviders(this.nameForLoggers);
    return {
      imports: [ConfigModule],
      module: LoggerModule,
      providers: [AppLogger, ...nameLoggerProviders],
      exports: [AppLogger, ...nameLoggerProviders],
      global: true,
    };
  }
}
