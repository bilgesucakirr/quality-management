import {jwtDecode} from "jwt-decode";
import type { DecodedToken } from "../types/DecodedToken";

export const decodeToken = (token: string): DecodedToken => {
  return jwtDecode(token);
};
