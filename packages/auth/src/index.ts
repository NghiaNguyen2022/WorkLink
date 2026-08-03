export type AppRole =
  | 'CUSTOMER'
  | 'WORKER'
  | 'CALL_CENTER'
  | 'OPERATOR'
  | 'VERIFIER'
  | 'TRAINER'
  | 'FINANCE'
  | 'RISK_MANAGER'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
}

export function hasRole(user: AuthUser, role: AppRole): boolean {
  return user.role === role;
}

export function hasAnyRole(user: AuthUser, roles: AppRole[]): boolean {
  return roles.includes(user.role);
}
