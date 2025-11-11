"use client";

import { motion } from "framer-motion";
import { DollarSign, MessageCircle, MessageSquare, Send, Zap } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Card } from "@syntax402/ui/components/card";

export default function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const steps = [
    {
      number: "1",
      title: "Comment",
      description: "Type `/review` on any GitHub PR",
      icon: MessageSquare,
    },
    {
      number: "2",
      title: "Get Quote",
      description: "Bot calculates cost from code volume",
      icon: DollarSign,
    },
    {
      number: "3",
      title: "Pay",
      description: "One-time USDC payment via x402",
      icon: Send,
    },
    {
      number: "4",
      title: "AI Analyzes",
      description: "AI reviews your changes",
      icon: Zap,
    },
    {
      number: "5",
      title: "Receive Feedback",
      description: "Inline comments on GitHub PR",
      icon: MessageCircle,
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center font-bold text-4xl sm:text-5xl"
        >
          How It Works
        </motion.h2>

        <div className="mb-12 grid gap-4 md:grid-cols-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Card className="flex h-full flex-col border-border p-6 transition-colors hover:border-accent">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-bold text-3xl text-accent">{step.number}</span>
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-bold text-lg">{step.title}</h3>
                  <p className="grow text-muted-foreground text-sm">{step.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16 hidden items-end justify-between gap-4 md:flex"
        >
          {[...Array(5)].map((_, idx) => (
            <motion.div
              key={_}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
              className="h-1 flex-1 origin-left bg-accent"
            />
          ))}
        </motion.div>

        {/* Call to action text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mx-auto max-w-2xl text-center text-muted-foreground text-sm"
        >
          Complete process: 2 minutes from PR comment to AI feedback in your inbox
        </motion.p>
      </div>
    </section>
  );
}
