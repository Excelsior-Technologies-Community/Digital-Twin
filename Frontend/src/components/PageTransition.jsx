import { motion, useReducedMotion } from 'framer-motion';

export default function PageTransition({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  const variants = prefersReduced
    ? {
        initial: { opacity: 0, y: 0 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.15 }
        },
        exit: {
          opacity: 0,
          y: 0,
          transition: { duration: 0.12 }
        }
      }
    : {
        initial: {
          opacity: 0,
          y: 8
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1]
          },
          transitionEnd: {
            transform: 'none'
          }
        },
        exit: {
          opacity: 0,
          y: -6,
          transition: {
            duration: 0.18,
            ease: [0.4, 0, 1, 1]
          }
        }
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
