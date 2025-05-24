export interface DecodedToken {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}