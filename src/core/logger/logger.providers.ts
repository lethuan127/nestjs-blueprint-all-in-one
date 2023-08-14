import { Provider } from '@nestjs/common';
import { AppLogger } from './app-logger';
import { getLoggerToken } from './logger.utils';

function loggerFactory(logger: AppLogger, name: string) {
  if (name) {
    logger.setContext(name);
  }
  return logger;
}

function createLoggerProvider(name: string): Provider<AppLogger> {
  return {
    provide: getLoggerToken(name),
    useFactory: (logger) => loggerFactory(logger, name),
    inject: [AppLogger],
  };
}

/**
 * Creates Logger providers for each given name
 */
export function createLoggerProviders(names: string[]): Array<Provider<AppLogger>> {
  return names.map((name) => createLoggerProvider(name));
}
