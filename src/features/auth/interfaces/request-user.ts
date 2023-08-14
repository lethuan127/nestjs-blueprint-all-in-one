import { IJwtPayload } from './jwt-payment';

export interface IRequestUser extends IJwtPayload {
  role: string;
  permissions: string[];
}
