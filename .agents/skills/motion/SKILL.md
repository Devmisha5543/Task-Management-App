---
name: motion
description: Guidelines, animation patterns, spring physics configurations, and best practices for creating smooth, accessible Motion / Framer Motion animations in web and mobile applications.
---

# Motion & Animation Skill Guide

This skill provides reference patterns, physics configurations, and component templates for building fluid, high-performance UI animations using **Motion** (Framer Motion) in Next.js / React applications.

---

## 1. Core Animation Principles

1. **Performant Properties Only**: Stick strictly to GPU-accelerated CSS properties: `opacity`, `transform` (`scale`, `translate`, `rotate`), and `filter`. Avoid animating layout dimensions (`width`, `height`, `top`, `margin`) directly unless using `layout` or `layoutId`.
2. **Natural Spring Physics**: Prefer spring transitions over fixed durations for interactive elements to make components feel tangible and responsive.
3. **Always Handle Unmounting**: Wrap conditional rendering in `<AnimatePresence>` to execute exit transitions cleanly.
4. **Enforce 'use client'**: Any file importing `motion` or using Motion hooks MUST be marked with `'use client'` at the top in Next.js App Router.
5. **Respect Reduced Motion**: Always support user preferences for reduced motion (`useReducedMotion`).

---

## 2. Recommended Physics Presets

```typescript
export const MOTION_PRESETS = {
  // Snappy for buttons, toggles, small clicks
  snappy: { type: "spring", stiffness: 400, damping: 25 },
  
  // Smooth for page transitions, cards, modals
  smooth: { type: "spring", stiffness: 260, damping: 20 },
  
  // Gentle for slow ambient entries, tooltips
  gentle: { type: "spring", stiffness: 120, damping: 14 },

  // Ease curves for linear or timed fades
  easeOut: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
};
```

---

## 3. Reusable Variants

### Fade In & Up (Cards, Sections)
```typescript
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: { duration: 0.15, ease: "easeIn" } 
  }
};
```

### Staggered List Container & Items
```typescript
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export const listChildVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 25 } 
  }
};
```

### Modal / Dialog Overlay & Content
```typescript
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 25 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 8, 
    transition: { duration: 0.15, ease: "easeIn" } 
  }
};
```

---

## 4. Interactive Component Patterns

### Button Micro-Interactions
```tsx
'use client';

import { motion } from 'motion/react';

export function AnimatedButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow font-medium"
    >
      {children}
    </motion.button>
  );
}
```

### Shared Layout Animation (Tabs / Filters)
```tsx
'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

export function SegmentedControl({ tabs }: { tabs: string[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 5. Drag & Drop Visual Enhancements

When integrating with `@dnd-kit` or native HTML drag and drop:
- Wrap dragged items with scale elevation (`scale: 1.04`, `shadow-xl`).
- Add subtle tilt or rotation when active (`rotate: 1.5deg`).

```tsx
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.96 }}
  transition={{ type: "spring", stiffness: 350, damping: 25 }}
>
  {/* Card Content */}
</motion.div>
```

---

## 6. Accessibility & Motion Preference

Always wrap high-intensity transitions with accessibility checks:

```tsx
import { useReducedMotion, motion } from 'motion/react';

export function AccessibleCard({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```
