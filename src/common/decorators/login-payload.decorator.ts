import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { LoginJwtPayload } from '../interfaces/jwt-payload.interface';

interface LoginRequest extends Request {
  loginPayload?: LoginJwtPayload;
}

export const LoginPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<LoginRequest>();
    return req.loginPayload;
  },
);
