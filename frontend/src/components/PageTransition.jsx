import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
}

/**
 * Wraps page content with a fade + subtle slide animation.
 * Usage: <PageTransition><YourPage /></PageTransition>
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
