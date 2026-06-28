"use client";
import "../styles/globals.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "../layout/index";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router.events]);

  return (
    <SessionProvider session={session}>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 backdrop-blur-sm z-30 flex justify-center items-center">
          <motion.div
            animate={{ opacity: [0, 1, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Image
              loading="lazy"
              placeholder="blur"
              width={100}
              height={100}
              blurDataURL="/images/logo/logo.png"
              src="/images/logo/logo.png"
              alt="Brand Logo"
            />
          </motion.div>
        </div>
      )}

      <Layout>
        <Component {...pageProps} />
      </Layout>

      <ToastContainer position="top-right" autoClose={3000} />
    </SessionProvider>
  );
}
