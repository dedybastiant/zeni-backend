import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface RegistrationJwtPayload {
  sessionId: string;
  type: 'registration';
  iat: number;
  exp: number;
}

interface RegistrationRequest extends Request {
  registrationPayload?: RegistrationJwtPayload;
}

@Injectable()
export class RegistrationTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RegistrationRequest>();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing token');

    const token = authHeader.replace('Bearer ', '');

    let payload: RegistrationJwtPayload;
    try {
      payload =
        await this.jwtService.verifyAsync<RegistrationJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired registration token');
    }

    if (payload.type !== 'registration') {
      throw new UnauthorizedException('Wrong token type');
    }

    req.registrationPayload = payload;
    return true;
  }
}
