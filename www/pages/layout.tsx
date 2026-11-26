import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { TooltipProvider } from '../src/components/ui/tooltip';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delay={450}>{children}</TooltipProvider>
    </MotionConfig>
  );
}
