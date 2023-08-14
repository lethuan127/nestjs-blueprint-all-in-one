import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_METADATA } from './event.constant';

@Injectable()
export class EventEmitter {
  constructor(private eventEmitter: EventEmitter2, private reflector: Reflector) {}

  emit(event: symbol | string | (symbol | string)[] | object, ...values: any[]) {
    if (typeof event == 'object') {
      const eventName = this.reflector.get(EVENT_METADATA, event.constructor) ?? event.constructor.name;
      return this.eventEmitter.emit(eventName, event);
    }
    return this.eventEmitter.emit(event, ...values);
  }
}
