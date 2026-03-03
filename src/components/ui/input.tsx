import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-xl border border-[#1a1a24] bg-[#111118] px-3 py-2 text-sm text-[#f0f0f5] placeholder:text-[#8888a0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6366f1]/50 focus-visible:border-[#6366f1]/50 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
