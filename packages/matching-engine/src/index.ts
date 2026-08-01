import type { MatchResult,Worker } from '@worklink/shared-types';
export interface MatchInput { requiredSkills:string[]; district:string; workers:Worker[] }
export function matchWorkers(i:MatchInput):MatchResult[] {
 return i.workers.filter(w=>w.available).map(w=>{
  const matched=i.requiredSkills.filter(s=>w.skills.includes(s)).length;
  const skillScore=i.requiredSkills.length?matched/i.requiredSkills.length*50:50;
  const locationScore=w.serviceAreas.includes(i.district)?25:0;
  const qualityScore=Math.min(25,w.rating/5*20+Math.min(5,w.completedJobs/20));
  const warnings:string[]=[]; if(w.verifiedLevel<'V3') warnings.push('Verification level is below V3');
  return {workerId:w.id,totalScore:Math.round(skillScore+locationScore+qualityScore),reasons:[`${matched}/${i.requiredSkills.length} required skills matched`,locationScore?'Service area matched':'Outside preferred service area'],warnings};
 }).sort((a,b)=>b.totalScore-a.totalScore);
}
