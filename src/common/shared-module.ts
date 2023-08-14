import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from "../entities";
import { AuthorizeService } from './services/authorize.service';

const RepositoryModule = TypeOrmModule.forFeature(Object.values(entities))

@Global()
@Module({
    imports: [RepositoryModule],
    providers: [AuthorizeService],
    exports: [RepositoryModule, AuthorizeService]
})
export class SharedModule {}