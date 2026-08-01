export interface NotificationMessage { recipientId:string; title:string; body:string; channel:'push'|'sms'|'email' }
export function createJobOfferNotification(recipientId:string,jobTitle:string):NotificationMessage { return {recipientId,title:'Công việc phù hợp',body:`Bạn có đề xuất mới: ${jobTitle}`,channel:'push'}; }
