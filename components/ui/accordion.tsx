'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border border-border rounded-md bg-surface', className)} {...props} />
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header asChild>
    <div className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-white/[0.03] transition-colors [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </div>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={cn('overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down', className)} {...props}>
    <div className="px-4 pb-4">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
