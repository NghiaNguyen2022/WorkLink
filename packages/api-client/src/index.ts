import type { Job,Worker } from '@worklink/shared-types';
export class WorkLinkApiClient {
 constructor(private readonly baseUrl:string){}
 private async get<T>(path:string):Promise<T>{ const r=await fetch(`${this.baseUrl}${path}`); if(!r.ok) throw new Error(`API ${r.status}`); return r.json() as Promise<T>; }
 health(){return this.get<{status:string;service:string}>('/health')}
 jobs(){return this.get<Job[]>('/api/jobs')}
 workers(){return this.get<Worker[]>('/api/workers')}
}
