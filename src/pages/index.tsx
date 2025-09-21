import Head from "next/head";
import dynamic from "next/dynamic";
const Storefront = dynamic(()=>import("@/components/Storefront"),{ssr:false});

export default function Home(){
  return (<>
    <Head>
      <title>Caliki — Luxury Polos in USD & PLN</title>
      <meta name="description" content="Premium Caliki polo shirts. Ships to US & Poland. Stripe, PayU & Przelewy24." />
    </Head>
    <Storefront/>
  </>);
}
