import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import crypto from "crypto";

const SND = process.env.P24_SANDBOX === "true";
const BASE = SND ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";

function sign(sessionId:string, amount:number, currency:string){
  const json = JSON.stringify({sessionId, merchantId:Number(process.env.P24_MERCHANT_ID), amount, currency});
  return crypto.createHmac("sha384", process.env.P24_CRC!).update(json).digest("hex");
}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method!=="POST") return res.status(405).end();
  const { cart } = req.body as { cart:any[] };
  const rate = Number(process.env.NEXT_PUBLIC_EXCHANGE_RATE_PLN_PER_USD || 4);
  const amount = cart.reduce((s,i)=> s + Math.round(i.baseUSD*rate*100)*i.qty, 0);
  const sessionId = `caliki_${Date.now()}`;

  const initBody = {
    merchantId: Number(process.env.P24_MERCHANT_ID),
    posId: Number(process.env.P24_POS_ID),
    sessionId,
    amount,
    currency: "PLN",
    description: "Caliki Polos",
    email: "test@caliki.com",
    urlReturn: `${process.env.NEXT_PUBLIC_URL}/success`,
    urlStatus: `${process.env.NEXT_PUBLIC_URL}/api/checkout/p24/status`,
    sign: sign(sessionId, amount, "PLN"),
  };

  const r = await axios.post(`${BASE}/api/v1/transaction/register`, initBody, { headers: { "Content-Type": "application/json" } });
  const token = r.data.data.token as string;
  res.json({ url: `${BASE}/trnRequest/${token}` });
}
