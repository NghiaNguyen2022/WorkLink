export function calculatePrice(base:number, surcharges:number[] = []) { return base + surcharges.reduce((a,b)=>a+b,0); }
