import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from './entities';

const RepositoryModule = TypeOrmModule.forFeature(Object.values(entities));

@Global()
@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class SharedModule {}

