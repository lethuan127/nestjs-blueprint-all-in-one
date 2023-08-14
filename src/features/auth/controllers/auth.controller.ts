import { Controller, Request, Get } from '@nestjs/common';
import { AuthService } from 'src/features/auth/services/auth.service';
import { AUTH_BASE_ROUTE } from 'src/features/auth/constants/routes.const';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller(AUTH_BASE_ROUTE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @Get('me')
  public getMyInfo(@Request() request: Request) {
    return this.authService.getMyInfo(request.user);
  }
}
