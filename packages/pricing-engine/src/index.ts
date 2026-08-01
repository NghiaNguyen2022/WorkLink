import type { PriceQuote } from '@worklink/shared-types';
export interface PricingInput { basePrice:number; timeSurcharge?:number; locationSurcharge?:number; skillSurcharge?:number; urgencySurcharge?:number; workerPayoutRate?:number }
export function calculatePrice(i:PricingInput):PriceQuote {
 const surcharges=(i.timeSurcharge??0)+(i.locationSurcharge??0)+(i.skillSurcharge??0)+(i.urgencySurcharge??0);
 const customerTotal=Math.round(i.basePrice+surcharges);
 const workerPayout=Math.round(customerTotal*(i.workerPayoutRate??0.75));
 return {basePrice:i.basePrice,surcharges,customerTotal,workerPayout,platformGross:customerTotal-workerPayout,currency:'VND'};
}
