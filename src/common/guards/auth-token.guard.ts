import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  RegistrationJwtPayload,
  LoginJwtPayload,
} from '../interfaces/jwt-payload.interface';

interface RegistrationRequest extends Request {
  registrationPayload?: RegistrationJwtPayload;
}

interface LoginRequest extends Request {
  loginPayload?: LoginJwtPayload;
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

@Injectable()
export class LoginTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<LoginRequest>();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing token');

    const token = authHeader.replace('Bearer ', '');

    let payload: LoginJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<LoginJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired registration token');
    }

    if (payload.type !== 'login') {
      throw new UnauthorizedException('Wrong token type');
    }

    req.loginPayload = payload;
    return true;
  }
}
