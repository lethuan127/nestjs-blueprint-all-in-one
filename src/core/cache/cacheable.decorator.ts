/* eslint-disable prefer-rest-params */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JsonValue } from 'src/types';

const logger = new Logger(Cacheable.name);

export function Cacheable({ key, ttl = 10 }: { key?: string; ttl?: number }) {
  const cacheInjection = Inject(CACHE_MANAGER);

  return function (
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<JsonValue>>,
  ) {
    cacheInjection(target, '__cache');
    const method = descriptor.value;

    descriptor.value = async function () {
      const entryKey = `${key ?? propertyKey}[${[...arguments].map((a) => JSON.stringify(a)).join(',')}]`;
      const { __cache: cache } = this as { __cache: Cache };
      let res;
      res = await cache.get(entryKey);
      if (typeof res == undefined || res == null) {
        res = await method.apply(this, arguments);
        await cache.set(entryKey, res, { ttl });
      } else {
        logger.debug(`${key ?? propertyKey} return with cache ${entryKey}, ${JSON.stringify(res)}`);
      }
      return res;
    };
  };
}
