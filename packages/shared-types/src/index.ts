export type JobStatus = 'DRAFT'|'PENDING_VERIFICATION'|'MATCHING'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED';
export interface GeoLocation { district:string; city:string; latitude?:number; longitude?:number }
export interface Job { id:string; title:string; category:string; status:JobStatus; startAt:string; endAt:string; location:GeoLocation; headcount:number; customerBudget:number; currency:'VND' }
export interface Worker { id:string; fullName:string; skills:string[]; verifiedLevel:'V0'|'V1'|'V2'|'V3'|'V4'|'V5'|'V6'; rating:number; completedJobs:number; serviceAreas:string[]; available:boolean }
export interface PriceQuote { basePrice:number; surcharges:number; customerTotal:number; workerPayout:number; platformGross:number; currency:'VND' }
export interface MatchResult { workerId:string; totalScore:number; reasons:string[]; warnings:string[] }
