import type {Job,Worker} from '@worklink/shared-types';
export const jobs:Job[]=[{id:'job_001',title:'Lễ tân sự kiện khai trương',category:'event_reception',status:'PENDING_VERIFICATION',startAt:'2026-08-15T07:00:00+07:00',endAt:'2026-08-15T17:00:00+07:00',location:{district:'Quận 7',city:'TP.HCM'},headcount:4,customerBudget:600000,currency:'VND'}];
export const workers:Worker[]=[{id:'wrk_001',fullName:'Nguyễn Thị Lan',skills:['housekeeping','event_reception'],verifiedLevel:'V4',rating:4.8,completedJobs:126,serviceAreas:['Quận 7','Nhà Bè'],available:true}];
