import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tagVariants = cva(
  [
    "inline-flex items-center shrink-0 rounded-[8px] border font-medium leading-none",
    "gap-[4px] transition-opacity",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        success:     "bg-[var(--tag-success-bg)]     border-[var(--tag-success-bd)]     text-[var(--tag-success-fg)]",
        secondary:   "bg-[var(--tag-secondary-bg)]   border-[var(--tag-secondary-bd)]   text-[var(--tag-secondary-fg)]",
        primary:     "bg-[var(--tag-primary-bg)]     border-transparent                 text-[var(--tag-primary-fg)]",
        informative: "bg-[var(--tag-informative-bg)] border-[var(--tag-informative-bd)] text-[var(--tag-informative-fg)]",
        error:       "bg-[var(--tag-error-bg)]       border-[var(--tag-error-bd)]       text-[var(--tag-error-fg)]",
        alert:       "bg-[var(--tag-alert-bg)]       border-[var(--tag-alert-bd)]       text-[var(--tag-alert-fg)]",
        limeGreen:   "bg-[var(--tag-limegreen-bg)]   border-[var(--tag-limegreen-bd)]   text-[var(--tag-limegreen-fg)]",
        yellow:      "bg-[var(--tag-yellow-bg)]      border-[var(--tag-yellow-bd)]      text-[var(--tag-yellow-fg)]",
        purple:      "bg-[var(--tag-purple-bg)]      border-[var(--tag-purple-bd)]      text-[var(--tag-purple-fg)]",
        lightBlue:   "bg-[var(--tag-lightblue-bg)]   border-[var(--tag-lightblue-bd)]   text-[var(--tag-lightblue-fg)]",
        neutral:     "bg-[var(--tag-neutral-bg)]     border-[var(--tag-neutral-bd)]     text-[var(--tag-neutral-fg)]",
      },
      size: {
        sm:      "h-[20px] px-[8px] py-[4px] text-[12px]",
        default: "h-[24px] px-[8px] py-[4px] text-[14px]",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
)

function Tag({
  variant      = "secondary",
  size         = "default",
  leadingIcon,
  trailingIcon,
  disabled     = false,
  className,
  children,
}) {
  const iconOnly = !children && !trailingIcon && !!leadingIcon

  return (
    <span
      data-slot="tag"
      className={cn(
        tagVariants({ variant, size }),
        iconOnly && "gap-0 px-[4px]",
        disabled && "opacity-40",
        className
      )}
    >
      {leadingIcon  && <span className="shrink-0 flex items-center">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
    </span>
  )
}

export { Tag, tagVariants }
