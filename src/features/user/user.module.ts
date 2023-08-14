import { Module } from '@nestjs/common';
import { UserService } from 'src/features/user/services/user.service';
import { UserController } from 'src/features/user/controllers/user.controller';
import { JobModule } from 'src/features/job/job.module';
@Module({
  imports: [JobModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
