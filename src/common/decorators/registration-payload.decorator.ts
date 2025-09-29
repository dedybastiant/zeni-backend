import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RegistrationJwtPayload } from '../interfaces/jwt-payload.interface';

interface RegistrationRequest extends Request {
  registrationPayload?: RegistrationJwtPayload;
}

export const RegistrationPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RegistrationRequest>();
    return req.registrationPayload;
  },
);
