import { motion, useReducedMotion } from 'framer-motion';

export default function PageTransition({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  const variants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { duration: 0.15 }
        },
        exit: {
          opacity: 0,
          transition: { duration: 0.15 }
        }
      }
    : {
        initial: {
          opacity: 0,
          scale: 0.985,
          y: 8,
          filter: 'blur(6px)'
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1]
          },
          transitionEnd: {
            filter: 'none',
            transform: 'none'
          }
        },
        exit: {
          opacity: 0,
          scale: 0.985,
          y: -6,
          filter: 'blur(4px)',
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
