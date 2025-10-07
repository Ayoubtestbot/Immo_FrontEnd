import '../styles/new-design.css';
import '../styles/CozyAdminTheme.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/custom.css';
import '@/styles/modern.css';
import '@/styles/new-design.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    document.body.classList.add('cozy-theme');
    return () => {
      document.body.classList.remove('cozy-theme');
    };
  }, []);
  const initialOptions = {
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb", // Use "sb" for sandbox if not defined    currency: "EUR", // Assuming Euro as currency
    intent: "capture",
    "data-sdk-integration-source": "integrationbuilder_sc", // Recommended for custom integrations
    "data-namespace": "paypal_sdk", // Custom namespace to avoid conflicts
  };

  return (
    <SessionProvider session={session}>
      <Head>
        <title>LeadEstate</title>
      </Head>
      <PayPalScriptProvider options={initialOptions}>
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </SessionProvider>
  );
}

export default MyApp;
