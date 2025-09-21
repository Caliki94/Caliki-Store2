export const EX_RATE = Number(process.env.NEXT_PUBLIC_EXCHANGE_RATE_PLN_PER_USD || 4);
export function priceInCurrency(usd:number, currency:"USD"|"PLN"){ return currency==="PLN" ? Math.round(usd*EX_RATE) : usd; }
export function fmt(amount:number, currency:"USD"|"PLN", locale:string){ return new Intl.NumberFormat(locale,{style:"currency",currency}).format(amount); }
