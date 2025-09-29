interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface RegistrationJwtPayload extends JwtPayload {
  type: 'registration';
}

export interface LoginJwtPayload extends JwtPayload {
  type: 'login';
}
