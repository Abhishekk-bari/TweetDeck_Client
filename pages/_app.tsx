import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import  { Toaster } from 'react-hot-toast';


const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient()    

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="841588256062-qd31as84mf7o7vs27u7kit3c7mo4ogbr.apps.googleusercontent.com">
        <Component {...pageProps} />
        <Toaster />
        <ReactQueryDevtools />
      </GoogleOAuthProvider>
      </QueryClientProvider>
    </div>
  );
}


























// Client secret- 841588256062-qd31as84mf7o7vs27u7kit3c7mo4ogbr.apps.googleusercontent.com