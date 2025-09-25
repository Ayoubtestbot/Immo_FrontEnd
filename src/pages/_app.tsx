import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/custom.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const initialOptions = {
    clientId: process.env.PAYPAL_CLIENT_ID || "sb", // Use "sb" for sandbox if not defined
    currency: "EUR", // Assuming Euro as currency
    intent: "capture",
    "data-sdk-integration-source": "integrationbuilder_sc", // Recommended for custom integrations
    "data-namespace": "paypal_sdk", // Custom namespace to avoid conflicts
  };

  return (
    <SessionProvider session={session}>
      <PayPalScriptProvider options={initialOptions}>
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </SessionProvider>
  );
}

export default MyApp;
