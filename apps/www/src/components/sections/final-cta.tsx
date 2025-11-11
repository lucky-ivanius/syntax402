"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

import { Button } from "@syntax402/ui/components/button";

import { githubAppInstallationUrl } from "@/consts/github";

export default function FinalCTA() {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <section ref={ref} className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center font-bold text-4xl sm:text-5xl lg:text-6xl"
        >
          Ready to code smarter?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12 text-center text-muted-foreground text-xl leading-relaxed"
        >
          Install syntax402 on GitHub and get your first AI code review in minutes. No registration, no credit card
          required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg" className="group rounded-full px-8 font-semibold">
            <Link href={githubAppInstallationUrl} target="_blank" rel="noopener noreferrer">
              Install Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" className="rounded-full px-8 font-semibold" asChild>
            <Link href="https://x402.org" target="_blank" rel="noopener noreferrer">
              Learn About x402
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 text-center text-muted-foreground text-sm"
        >
          Installation takes 30 seconds. Try your first review risk-free.
        </motion.p>
      </div>
    </section>
  );
}
