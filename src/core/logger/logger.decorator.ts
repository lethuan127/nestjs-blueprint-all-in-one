import { Inject } from '@nestjs/common';
import { getLoggerToken } from './logger.utils';
import { LoggerModule } from './logger.module';

export function Logger(name: string) {
  if (!LoggerModule.nameForLoggers.includes(name)) {
    LoggerModule.nameForLoggers.push(name);
  }
  return Inject(getLoggerToken(name));
}
