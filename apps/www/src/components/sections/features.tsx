"use client";

import { motion } from "framer-motion";
import { Brain, Coins, Lock, Zap } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Card } from "@syntax402/ui/components/card";

export default function Features() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const features = [
    {
      icon: Zap,
      title: "Instant Reviews",
      description: "AI-powered code analysis that provides feedback in minutes.",
    },
    {
      icon: Coins,
      title: "Dynamic Pricing",
      description: "Pay based on code changes—only for what you use.",
    },
    {
      icon: Brain,
      title: "Context-Aware",
      description: "Tell the AI what to focus on: security, performance, or any custom instruction.",
    },
    {
      icon: Lock,
      title: "Instant Settlement",
      description: "Blockchain micropayments via x402 protocol. No middlemen, no delays, sub-second verification.",
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center font-bold text-4xl sm:text-5xl"
        >
          Built for Developers
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Card className="group h-full border-border p-8 transition-all hover:border-accent hover:bg-muted/50">
                  <Icon className="mb-4 h-8 w-8 text-accent transition-transform group-hover:scale-110" />
                  <h3 className="mb-3 font-bold text-xl">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
