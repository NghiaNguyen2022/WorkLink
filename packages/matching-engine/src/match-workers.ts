export interface MatchResult { workerId:string; totalScore:number; reasons:string[]; warnings:string[] }
export function rankMatches(items:MatchResult[]) { return [...items].sort((a,b)=>b.totalScore-a.totalScore); }
