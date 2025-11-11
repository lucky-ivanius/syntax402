"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Problem() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const problems = [
    {
      title: "Monthly fees",
      description: "Whether you need 1 review or 100, you pay the same price every month",
    },
    {
      title: "Unused credits",
      description: "Reviews expire and credits vanish, leaving you paying for nothing",
    },
    {
      title: "Commitment required",
      description: "Sign up for subscriptions before knowing if the tool actually works",
    },
  ];

  const solutions = [
    {
      title: "Pay per review",
      description: "Dynamic pricing based on code changes. Pay only for the reviews you actually use",
    },
    {
      title: "No waste",
      description: "Pay only when you need a review. Credits never expire",
    },
    {
      title: "Try risk-free",
      description: "Install instantly on GitHub, no credit card required",
    },
  ];

  return (
    <section ref={ref} id="problem" className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center font-bold text-4xl sm:text-5xl"
        >
          The Subscription Trap
        </motion.h2>

        <div className="mb-16 grid gap-12 md:grid-cols-2">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="mb-8 font-bold text-2xl text-destructive">Problem</h3>
            {problems.map((problem, idx) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                className="border-destructive border-l-2 py-2 pl-6"
              >
                <h4 className="mb-1 font-bold text-lg">{problem.title}</h4>
                <p className="text-muted-foreground text-sm">{problem.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="mb-8 font-bold text-2xl text-accent">Solution</h3>
            {solutions.map((solution, idx) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, x: 10 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                className="border-accent border-l-2 py-2 pl-6"
              >
                <h4 className="mb-1 font-bold text-lg">{solution.title}</h4>
                <p className="text-muted-foreground text-sm">{solution.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded border border-border bg-muted/30 p-8 text-center"
        >
          <p className="mb-4 text-muted-foreground">No more monthly bills</p>
          <p className="font-bold text-4xl">
            <span className="text-accent">Pay only for what you use</span>
          </p>
          <p className="mt-4 text-muted-foreground">Dynamic pricing based on code changes—transparent and fair.</p>
        </motion.div>
      </div>
    </section>
  );
}
