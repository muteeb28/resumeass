'use client'

import { useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TABS, type TabId } from './tabs.config'
import { TAB_INDICATOR, TAB_DOT } from '../../lib/motion'

interface JobsHubNavProps {
  active: TabId
  onChange: (id: TabId) => void
}

export function JobsHubNav({ active, onChange }: JobsHubNavProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false

  const focusTab = (index: number) => {
    const buttons = listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')
    buttons?.[index]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % TABS.length
      onChange(TABS[next].id)
      focusTab(next)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + TABS.length) % TABS.length
      onChange(TABS[prev].id)
      focusTab(prev)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onChange(TABS[0].id)
      focusTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      onChange(TABS[last].id)
      focusTab(last)
    }
  }

  return (
    <nav
      aria-label="Jobs Hub sections"
      className="sticky top-16 z-[100] bg-hub-surface border-b border-hub-border"
      style={{ fontFamily: 'var(--font-hub)' }}
    >
      <div className="max-w-[940px] mx-auto px-5">
        <div
          ref={listRef}
          role="tablist"
          className="flex items-end overflow-x-auto scrollbar-hide"
        >
          {TABS.map((tab, index) => {
            const isActive = tab.id === active

            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={[
                  'relative flex items-center gap-[5px] px-[15px] py-[11px] shrink-0',
                  'text-[13px] transition-colors duration-[130ms] outline-none select-none',
                  'focus-visible:ring-2 focus-visible:ring-hub-accent/30 focus-visible:rounded-t-[4px]',
                  isActive
                    ? 'text-hub-text-1 font-semibold'
                    : 'text-hub-text-3 font-medium hover:text-hub-text-2',
                ].join(' ')}
              >
                <span>{tab.label}</span>

                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      className="w-[5px] h-[5px] rounded-full bg-hub-accent flex-shrink-0"
                      initial={reduced ? { opacity: 0 } : TAB_DOT.initial}
                      animate={reduced ? { opacity: 1 } : TAB_DOT.animate}
                      exit={reduced ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
                      transition={TAB_DOT.transition}
                    />
                  )}
                </AnimatePresence>

                {tab.dataStatus === 'empty' && (
                  <span className="text-[9px] font-semibold text-hub-text-3 bg-hub-bg-subtle border border-hub-border px-[5px] py-px rounded-[3px] leading-none">
                    soon
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-t-[2px] bg-hub-accent"
                    transition={reduced ? { duration: 0 } : TAB_INDICATOR}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
