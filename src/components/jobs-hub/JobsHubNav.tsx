'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TABS } from './tabs.config'
import { TAB_INDICATOR, TAB_DOT } from '../../lib/motion'

export function JobsHubNav() {
  const pathname = usePathname()
  const reduced = useReducedMotion() ?? false

  return (
    <nav
      aria-label="Jobs Hub sections"
      className="sticky top-16 z-[100] bg-page border-b border-border-soft"
    >
      <div className="max-w-[940px] mx-auto px-5">
        <div className="flex items-end overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = pathname === tab.path

            return (
              <Link
                key={tab.id}
                href={tab.path}
                id={`tab-${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative flex items-center gap-[5px] px-[15px] py-[11px] shrink-0',
                  'text-[13px] transition-colors duration-[130ms] outline-none select-none',
                  'focus-visible:ring-2 focus-visible:ring-sapphire-bright/30 focus-visible:rounded-t-[4px]',
                  isActive
                    ? 'text-ink-900 font-semibold'
                    : 'text-ink-500 font-medium hover:text-ink-700',
                ].join(' ')}
              >
                <span>{tab.label}</span>

                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      className="w-[5px] h-[5px] rounded-full bg-sapphire-bright flex-shrink-0"
                      initial={reduced ? { opacity: 0 } : TAB_DOT.initial}
                      animate={reduced ? { opacity: 1 } : TAB_DOT.animate}
                      exit={reduced ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
                      transition={TAB_DOT.transition}
                    />
                  )}
                </AnimatePresence>

                {tab.dataStatus === 'empty' && (
                  <span className="text-[9px] font-semibold text-ink-500 bg-surface-alt border border-border-soft px-[5px] py-px rounded-[3px] leading-none">
                    soon
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-t-[2px] bg-sapphire-bright"
                    transition={reduced ? { duration: 0 } : TAB_INDICATOR}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
