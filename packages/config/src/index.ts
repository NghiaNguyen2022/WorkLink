export interface AppConfig { apiUrl:string; environment:'development'|'test'|'production' }
export function loadPublicConfig(env:Record<string,string|undefined>):AppConfig { return {apiUrl:env.API_URL??'http://localhost:4000',environment:(env.NODE_ENV as AppConfig['environment'])??'development'}; }
