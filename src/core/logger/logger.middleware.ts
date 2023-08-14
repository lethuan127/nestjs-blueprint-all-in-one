import { Injectable, NestMiddleware } from '@nestjs/common';
import morgan, { StreamOptions } from 'morgan';
import { AppLogger, Logger } from '.';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private middleware: (req: Request, res: Response, next: (error?: Error | any) => void) => any;
  constructor(@Logger('AppService') logger: AppLogger) {
    const stream: StreamOptions = {
      write: (message: any) => logger.verbose(message),
    };
    this.middleware = morgan(':method :url :status :res[content-length] - :response-time ms', { stream });
  }
  use(req: Request, res: Response, next: NextFunction) {
    this.middleware(req, res, next);
  }
}
