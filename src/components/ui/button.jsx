import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui Button composition, using the original site's button variants.
const buttonVariants = cva('', {
  variants: { variant: { default: 'btn-primary', secondary: 'btn-secondary', unstyled: '' } },
  defaultVariants: { variant: 'default' },
});
const Button = React.forwardRef(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, className }))} {...props} />;
});
Button.displayName = 'Button';
export { Button, buttonVariants };
