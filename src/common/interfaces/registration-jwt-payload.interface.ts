export interface RegistrationJwtPayload {
  sub: string;
  type: 'registration';
  iat: number;
  exp: number;
}
