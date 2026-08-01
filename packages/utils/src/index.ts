export function formatVnd(value:number):string { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(value); }
export function assertNever(value:never):never { throw new Error(`Unexpected value: ${String(value)}`); }
