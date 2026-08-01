export interface DatabaseHealth { connected:boolean; provider:'mock'|'postgresql' }
export async function checkDatabase():Promise<DatabaseHealth>{ return {connected:true,provider:'mock'}; }
