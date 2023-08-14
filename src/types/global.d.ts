import type { Request as ERequest, Response as EResponse, NextFunction as ENextFunction } from 'express';
import { UserDto } from 'src/common/services/authorize.service';

declare global {
  export type Request = ERequest & {
    user?: UserDto
  };

  export type Response = EResponse;

  export type NextFunction = ENextFunction;
}
