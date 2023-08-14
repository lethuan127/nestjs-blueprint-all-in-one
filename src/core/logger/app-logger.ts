/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Scope } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import { SyslogConfigSetLevels } from 'winston/lib/winston/config';
import { LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import apmAgent from 'elastic-apm-node';
import { apm } from '../apm';
import { HttpHeaders } from '../constants/http-headers';
import { ConfigService } from '@nestjs/config';
import ecsFormat from '@elastic/ecs-winston-format';
import { ElasticsearchTransport, ElasticsearchTransportOptions } from 'winston-elasticsearch';
import { utilities } from './logger.utils';

const defaultMeta = {
  env: process.env['NODE' + '_ENV'], // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
  service: 'nexg-api',
};

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger: Logger;
  private context?: string;

  constructor(configService: ConfigService) {
    this.logger = createLogger({
      level: configService.get('LOG_LEVEL', 'info'),
      levels: {
        debug: 10,
        verbose: 9,
        http: 8,
        info: 7,
        notice: 6,
        note: 5,
        warn: 4,
        warning: 4,
        error: 3,
        crit: 2,
        alert: 1,
        emerg: 0,
      } as SyslogConfigSetLevels,
      defaultMeta,
      transports: [],
    });

    if (process.env['NODE' + '_ENV'] == 'development') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.timestamp(), utilities.format.nestLike()),
        }),
      );
    }

    if (configService.get('ELASTIC_HOST')) {
      const esTransportOpts: ElasticsearchTransportOptions = {
        apm,
        level: configService.get('LOG_LEVEL', 'info'),
        dataStream: true,
        source: 'nexg-api',
        transformer: (logData) => {
          const transformed: any = {};
          const fields: any = {};
          transformed['@timestamp'] = logData.timestamp ? logData.timestamp : new Date().toISOString();
          transformed.message = `${logData.message}\n${JSON.stringify(logData.meta, null, 2)}`;
          transformed.severity = logData.level;
          transformed.fields = fields;

          if (logData.meta['name']) fields.name = logData.meta['name'];
          if (logData.meta['service']) fields.service = logData.meta['service'];
          if (logData.meta['hostname']) fields.hostname = logData.meta['hostname'];
          if (logData.meta['env']) fields.env = logData.meta['env'];

          if (logData.meta['transaction.id']) transformed.transaction = { id: logData.meta['transaction.id'] };
          if (logData.meta['trace.id']) transformed.trace = { id: logData.meta['trace.id'] };
          if (logData.meta['span.id']) transformed.span = { id: logData.meta['span.id'] };

          return transformed;
        },
        format: format.combine(
          format((info, _opts?: any) => {
            if (typeof info.message == 'object') {
              info.message = JSON.stringify(info.message);
            }
            return info;
          })(),
          ecsFormat({ convertReqRes: true }),
        ),
        clientOpts: {
          node: configService.get('ELASTIC_HOST'),
          auth: {
            username: configService.get('ELASTIC_USERNAME'),
            password: configService.get('ELASTIC_PASSWORD'),
          },
          maxRetries: 1,
        },
        bufferLimit: 20,
        retryLimit: 1,
        indexPrefix: 'logs-nexg-api',
      };
      const esTransport = new ElasticsearchTransport(esTransportOpts);
      this.logger.on('error', (error) => {
        console.error('Error in logger caught', error);
      });
      esTransport.on('error', (error) => {
        console.error('Error in logger caught', error);
      });
      this.logger.add(esTransport);
    }
  }

  public setContext(context: string) {
    this.context = context;
  }

  public log(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && 'object' === typeof message) {
      const { message: msg, level = 'info', ...meta } = message;

      return this.logger.log(level, msg as string, { context, ...meta });
    }

    return this.logger.info(message, {
      context,
      [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
      [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
    });
  }

  public error(message: any, trace?: string, context?: string): any {
    context = context || this.context;

    if (message instanceof Error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { message: msg, name, stack, ...meta } = message;

      return this.logger.error(msg, {
        context,
        stack: [trace || message.stack],
        error: message,
        ...meta,
        [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
        [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
      });
    }

    if (!!message && 'object' === typeof message) {
      const { message: msg, ...meta } = message;

      return this.logger.error(msg as string, {
        context,
        stack: [trace],
        ...meta,
        [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
        [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
      });
    }

    return this.logger.error(message, {
      context,
      stack: [trace],
      [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
      [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
    });
  }

  public warn(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && 'object' === typeof message) {
      const { message: msg, ...meta } = message;

      return this.logger.warn(msg as string, {
        context,
        ...meta,
        [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
        [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
      });
    }

    return this.logger.warn(message, {
      context,
      [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
      [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
    });
  }

  public debug?(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && 'object' === typeof message) {
      const { message: msg, ...meta } = message;

      return this.logger.debug(msg as string, {
        context,
        ...meta,
        [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
        [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
      });
    }

    return this.logger.debug(message, {
      context,
      [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
      [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
    });
  }

  public verbose?(message: any, context?: string): any {
    context = context || this.context;

    if (!!message && 'object' === typeof message) {
      const { message: msg, ...meta } = message;

      return this.logger.verbose(msg as string, {
        context,
        ...meta,
        [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
        [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
      });
    }

    return this.logger.verbose(message, {
      context,
      [HttpHeaders.TRANSACTION_ID]: apmAgent.currentTraceIds['transaction.id'],
      [HttpHeaders.TRACE_ID]: apmAgent.currentTraceIds['trace.id'],
    });
  }
}
