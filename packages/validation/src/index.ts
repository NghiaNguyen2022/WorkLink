import type { Job } from '@worklink/shared-types';
export type ValidationResult={valid:true}|{valid:false;errors:string[]};
export function validateJob(input:Partial<Job>):ValidationResult {
 const errors:string[]=[];
 if(!input.title?.trim()) errors.push('Job title is required');
 if(!input.startAt||!input.endAt) errors.push('Start and end time are required');
 if((input.headcount??0)<1) errors.push('Headcount must be at least 1');
 if((input.customerBudget??0)<=0) errors.push('Customer budget must be positive');
 return errors.length?{valid:false,errors}:{valid:true};
}
