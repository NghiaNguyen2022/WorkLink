export interface WorkerEligibilityInput { workerVerified:boolean; skillVerified:boolean; hasScheduleConflict:boolean; suspended:boolean }
export function canWorkerAcceptJob(i:WorkerEligibilityInput):boolean { return i.workerVerified&&i.skillVerified&&!i.hasScheduleConflict&&!i.suspended; }
export function canTransitionJob(from:string,to:string):boolean {
 const map:Record<string,string[]>={DRAFT:['PENDING_VERIFICATION'],PENDING_VERIFICATION:['MATCHING','CANCELLED'],MATCHING:['CONFIRMED','CANCELLED'],CONFIRMED:['IN_PROGRESS','CANCELLED'],IN_PROGRESS:['COMPLETED']};
 return map[from]?.includes(to)??false;
}
