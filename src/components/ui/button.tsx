import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-indigo-600 text-white hover:bg-indigo-700",
                destructive:
                    "bg-red-600 text-white hover:bg-red-700",
                outline:
                    "border border-[#1a1a24] bg-transparent hover:bg-[#1a1a24] text-[#f0f0f5]",
                secondary:
                    "bg-[#7c3aed] text-white hover:bg-[#6d33d4]",
                ghost:
                    "hover:bg-[#111118] text-[#8888a0] hover:text-[#f0f0f5]",
                link:
                    "text-indigo-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-6 py-2.5",
                sm: "h-9 rounded-md px-4",
                lg: "h-11 rounded-lg px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
