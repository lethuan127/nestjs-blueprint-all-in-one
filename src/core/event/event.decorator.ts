import { SetMetadata } from '@nestjs/common';
import { EVENT_METADATA } from './event.constant';

export function Event(name: string) {
  return SetMetadata(EVENT_METADATA, name);
}
