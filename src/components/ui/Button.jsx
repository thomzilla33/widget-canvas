import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button — AIMS OS Design System (JSX port, @base-ui/react replaced with native <button>)
 * Source: aims-os-design-system/src/components/ui/button.tsx
 *
 * text-type-sm/base/md → text-[12px]/[14px]/[16px] (Tailwind v3 compatible)
 */

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "font-semibold whitespace-nowrap select-none",
    "transition-all duration-200",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:[ring-offset-color:var(--canvas)]",
    "disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "border border-transparent",
          "bg-[var(--btn-primary-bg)] !text-white",
          "hover:bg-[var(--btn-primary-hover-bg)]",
          "active:bg-[var(--btn-primary-active-bg)]",
          "disabled:opacity-40",
        ],
        secondary: [
          "border border-[var(--btn-secondary-border)]",
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)]",
          "hover:bg-[var(--btn-secondary-hover-bg)] hover:border-[var(--btn-secondary-hover-bd)]",
          "focus-visible:border-[var(--btn-secondary-focus-bd)]",
          "active:bg-[var(--btn-secondary-active-bg)]",
          "disabled:bg-[var(--btn-secondary-disabled-bg)] disabled:border-[var(--btn-secondary-disabled-bd)] disabled:text-[var(--btn-secondary-disabled-fg)]",
        ],
        tertiary: [
          "border border-transparent",
          "bg-transparent text-[var(--btn-tertiary-fg)]",
          "hover:bg-[var(--btn-tertiary-hover-bg)]",
          "focus-visible:bg-[var(--btn-tertiary-focus-bg)]",
          "active:bg-[var(--btn-tertiary-active-bg)]",
          "disabled:opacity-40",
        ],
        warning: [
          "border border-transparent",
          "bg-[var(--btn-warning-bg)] !text-white",
          "hover:bg-[var(--btn-warning-hover-bg)]",
          "active:bg-[var(--btn-warning-active-bg)]",
          "disabled:opacity-40",
        ],
        positive: [
          "border border-transparent",
          "bg-[var(--btn-positive-bg)] !text-white",
          "hover:bg-[var(--btn-positive-hover-bg)]",
          "active:bg-[var(--btn-positive-active-bg)]",
          "disabled:opacity-40",
        ],
        main: [
          "border border-transparent !text-white",
          "[background:radial-gradient(ellipse_100%_160%_at_61%_68%,#2173ff_0%,#09e2ab_100%)]",
          "[box-shadow:4px_8px_12px_8px_#09e2ab29]",
          "hover:[background:radial-gradient(ellipse_100%_160%_at_59%_72%,#002f80_0%,#2173ff_40%,#09e2ab_100%)]",
          "hover:[box-shadow:8px_8px_20px_0px_#00c94f59]",
          "active:opacity-90",
          "disabled:opacity-40",
        ],
      },

      size: {
        sm:      "h-[27px] px-[12px] gap-[4px]  text-[12px] rounded-md",
        default: "h-[40px] px-[16px] gap-[8px]  text-[14px] rounded-md",
        lg:      "h-[52px] px-[20px] gap-[12px] text-[16px] rounded-lg",
      },

      pill: {
        true:  "!rounded-full",
        false: "",
      },
    },

    compoundVariants: [
      { variant: "primary",   class: "focus-visible:ring-[var(--btn-primary-ring)]"   },
      { variant: "secondary", class: "focus-visible:ring-[var(--btn-secondary-ring)]" },
      { variant: "tertiary",  class: "focus-visible:ring-[var(--btn-secondary-ring)]" },
      { variant: "warning",   class: "focus-visible:ring-[var(--btn-warning-ring)]"   },
      { variant: "positive",  class: "focus-visible:ring-[var(--btn-positive-ring)]"  },
      { variant: "main",      class: "focus-visible:ring-[#cbfff4]"                   },
    ],

    defaultVariants: {
      variant: "primary",
      size:    "default",
      pill:    false,
    },
  }
)

const iconAloneClasses = {
  sm:      "h-[24px] w-[24px] !px-0",
  default: "h-[40px] w-[40px] !px-0",
  lg:      "h-[56px] w-[56px] !px-0",
}

function Button({
  className,
  variant = "primary",
  size = "default",
  pill = false,
  icon,
  iconPosition = "left",
  children,
  ...props
}) {
  const alone   = iconPosition === "alone"
  const sizeKey = size ?? "default"

  return (
    <button
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, pill }),
        alone && iconAloneClasses[sizeKey],
        className
      )}
      {...props}
    >
      {alone ? (
        icon
      ) : (
        <>
          {iconPosition !== "right" && icon}
          {children}
          {iconPosition === "right" && icon}
        </>
      )}
    </button>
  )
}

export { Button, buttonVariants }
