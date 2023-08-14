import { Injectable } from '@nestjs/common';
import * as APM from 'elastic-apm-node';

@Injectable()
export class ApmService {
  private readonly apm: APM.Agent;

  constructor() {
    this.apm = APM;
  }

  captureError(data: any): void {
    this.apm.captureError && this.apm.captureError(data);
  }

  startTransaction(name?: string, options?: APM.TransactionOptions): APM.Transaction | null {
    return this.apm.startTransaction(name, options);
  }

  setTransactionName(name: string): void {
    this.apm.setTransactionName(name);
  }

  startSpan(name?: string, options?: APM.SpanOptions): APM.Span | null {
    return this.apm.startSpan(name, options);
  }

  setCustomContext(context: Record<string, unknown>): void {
    this.apm.setCustomContext(context);
  }
}
