import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "@/shared/ui/button"

/* -------------------------------------------------------------------------- */
/*                               Section Container                            */
/* -------------------------------------------------------------------------- */

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const SectionContainer = ({ children, className, ...props }: SectionContainerProps) => {
  return (
    <div className={cn("container mx-auto px-4 md:px-6", className)} {...props}>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Button                                   */
/* -------------------------------------------------------------------------- */

interface ButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "text" | "default" | "destructive" | "outline" | "ghost" | "link"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    // Map custom variants to shadcn variants
    let shadcnVariant: ShadcnButtonProps["variant"] = "default"
    
    switch (variant) {
      case "primary":
        shadcnVariant = "default"
        break
      case "secondary":
        shadcnVariant = "secondary"
        break
      case "text":
        shadcnVariant = "ghost"
        break
      default:
        shadcnVariant = variant as ShadcnButtonProps["variant"]
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={shadcnVariant}
        className={cn(className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

/* -------------------------------------------------------------------------- */
/*                                Particle Canvas                             */
/* -------------------------------------------------------------------------- */

interface ParticleCanvasProps {
  theme?: "light" | "dark"
}

export const ParticleCanvas = ({ theme = "light" }: ParticleCanvasProps) => {
  // Placeholder for the particle effect
  // You can implement the actual canvas logic here similarly to the original file
  return (
    <div className={cn(
      "w-full h-full",
      theme === "dark" ? "bg-transparent" : "bg-transparent"
    )}>
      {/* 
        This is a placeholder. 
        If you need the actual particle animation, we can add a canvas element 
        and the corresponding JS logic later.
      */}
      <div className="w-full h-full flex items-center justify-center opacity-20">
      </div>
    </div>
  )
}
