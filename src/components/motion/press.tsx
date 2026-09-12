"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export function Press({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
