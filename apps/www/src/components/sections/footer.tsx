"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

import { githubAppInstallationUrl } from "@/consts/github";

export default function Footer() {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <footer ref={ref} className="border-border border-t px-6 py-16 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-2 font-bold text-2xl">
              synta
              <span className="text-accent">
                {"{"}x402{"}"}
              </span>
            </h3>
            <p className="text-muted-foreground text-sm">AI-powered code reviews. Pay-per-review powered by x402.</p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="mb-4 font-bold text-sm">Resources</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link
                  href="https://x402.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-accent"
                >
                  x402 Protocol <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href={githubAppInstallationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-accent"
                >
                  GitHub App <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="mb-4 font-bold text-sm">Built With</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Bun • Hono • TypeScript • AI Models • Solana • x402
            </p>
          </motion.div>
        </div>

        <p className="mt-2 text-muted-foreground text-sm">© 2025 syntax402. All rights reserved.</p>
      </div>
    </footer>
  );
}
