import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * CardContainer — AIMS OS Design System (JSX port)
 * Source: aims-os-design-system/src/components/ui/card-container.tsx
 *
 * Dashed variant uses .card-dashed-border from aims-ds-tokens.css.
 */

const cardVariants = cva(
  [
    "relative border-[0.5px] hover:border-[1px]",
    "transition-[color,background-color,border-color,border-width,box-shadow] duration-150",
    "outline-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--card-default-bg)] border-[var(--card-default-border)]",
          "hover:border-[var(--card-default-hover-bd)] hover:[box-shadow:var(--card-default-hover-shadow)]",
        ],
        whiteOpacity: [
          "bg-[var(--card-default-bg)] border-[var(--card-default-border)]",
          "hover:border-[var(--card-default-hover-bd)] hover:[box-shadow:var(--card-whiteopacity-hover-shadow)]",
        ],
        primary: [
          "bg-[var(--card-primary-bg)] border-[var(--card-primary-border)]",
          "hover:border-[var(--card-primary-hover-bd)] hover:[box-shadow:var(--card-primary-hover-shadow)]",
        ],
        green: [
          "bg-[var(--card-green-bg)] border-[var(--card-green-border)]",
          "hover:border-[var(--card-green-hover-bd)] hover:[box-shadow:var(--card-green-hover-shadow)]",
        ],
        reed: [
          "bg-[var(--card-reed-bg)] border-[var(--card-reed-border)]",
          "hover:border-[var(--card-reed-hover-bd)] hover:[box-shadow:var(--card-reed-hover-shadow)]",
        ],
        orange: [
          "bg-[var(--card-orange-bg)] border-[var(--card-orange-border)]",
          "hover:border-[var(--card-orange-hover-bd)] hover:[box-shadow:var(--card-orange-hover-shadow)]",
        ],
        yellow: [
          "bg-[var(--card-yellow-bg)] border-[var(--card-yellow-border)]",
          "hover:border-[var(--card-yellow-hover-bd)] hover:[box-shadow:var(--card-yellow-hover-shadow)]",
        ],
        purple: [
          "bg-[var(--card-purple-bg)] border-[var(--card-purple-border)]",
          "hover:border-[var(--card-purple-hover-bd)] hover:[box-shadow:var(--card-purple-hover-shadow)]",
        ],
        lightBlue: [
          "bg-[var(--card-lightblue-bg)] border-[var(--card-lightblue-border)]",
          "hover:border-[var(--card-lightblue-hover-bd)] hover:[box-shadow:var(--card-lightblue-hover-shadow)]",
        ],
        limeGreen: [
          "bg-[var(--card-limegreen-bg)] border-[var(--card-limegreen-border)]",
          "hover:border-[var(--card-limegreen-hover-bd)] hover:[box-shadow:var(--card-limegreen-hover-shadow)]",
        ],
        dashed: ["bg-transparent", "hover:[box-shadow:var(--card-dashed-hover-shadow)]"],
      },
      size: {
        sm:      "p-[12px] rounded-[8px]",
        default: "px-[16px] py-[24px] rounded-[8px]",
        lg:      "p-[24px] rounded-[16px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

const selectedBorder = {
  default:      "!border-[var(--card-default-selected-bd)]",
  whiteOpacity: "!border-[var(--card-default-selected-bd)]",
  primary:      "!border-[var(--card-primary-selected-bd)]",
  green:        "!border-[var(--card-green-selected-bd)]",
  reed:         "!border-[var(--card-reed-selected-bd)]",
  orange:       "!border-[var(--card-orange-selected-bd)]",
  yellow:       "!border-[var(--card-yellow-selected-bd)]",
  purple:       "!border-[var(--card-purple-selected-bd)]",
  lightBlue:    "!border-[var(--card-lightblue-selected-bd)]",
  limeGreen:    "!border-[var(--card-limegreen-selected-bd)]",
}

function CardContainer({
  variant  = "default",
  size     = "default",
  selected = false,
  disabled = false,
  onClick,
  className,
  children,
}) {
  const isDashed = variant === "dashed"

  return (
    <div
      data-slot="card-container"
      data-selected={selected ? "true" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        cardVariants({ variant, size }),
        isDashed && "card-dashed-border",
        !isDashed && selected && selectedBorder[variant],
        !isDashed && selected && "!border",
        disabled && "opacity-40 pointer-events-none",
        onClick && !disabled && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

export { CardContainer, cardVariants }
