"use client";

import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@syntax402/ui/components/button";

import { githubAppInstallationUrl } from "@/consts/github";

export default function Hero() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 text-center">
          {/* Badge */}
          <motion.div variants={item} className="inline-block">
            <span className="text-muted-foreground text-sm">AI-powered code reviews</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={item} className="font-bold text-5xl leading-tight sm:text-6xl lg:text-7xl">
            Only pay for the code reviews <span className="text-accent">you actually need</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl"
          >
            AI-powered PR reviews. Pay-per-review powered by x402.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8 font-semibold">
              <a href={githubAppInstallationUrl} target="_blank" rel="noopener noreferrer">
                Install GitHub App →
              </a>
            </Button>
            <Button variant="secondary" size="lg" className="rounded-full px-8 font-semibold" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.p variants={item} className="text-muted-foreground text-sm">
            No registration required • Install in 30 seconds
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
