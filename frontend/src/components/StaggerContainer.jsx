import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

/**
 * Staggered animation container for grids and lists.
 *
 * Usage:
 *   <StaggerContainer>
 *     {items.map(item => (
 *       <StaggerContainer.Item key={item.id}>
 *         <Card.Root>...</Card.Root>
 *       </StaggerContainer.Item>
 *     ))}
 *   </StaggerContainer>
 */

function StaggerItem({ children, ...props }) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  )
}

export default function StaggerContainer({ children, ...props }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )
}

StaggerContainer.Item = StaggerItem
