export type AppRole='CUSTOMER'|'WORKER'|'OPERATOR'|'ADMIN'|'FINANCE';
export interface AuthUser { id:string; roles:AppRole[] }
export function hasRole(user:AuthUser,role:AppRole):boolean { return user.roles.includes(role); }
