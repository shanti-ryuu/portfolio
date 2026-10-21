import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reducedMotion = Boolean(useReducedMotion())
  return <motion.div
    className={className}
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12, margin: '0px 0px -48px 0px' }}
    transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.div>
}
