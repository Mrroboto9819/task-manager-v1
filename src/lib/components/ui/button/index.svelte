<script lang="ts">
    import { type VariantProps, tv } from "tailwind-variants";
    import type { WithElementProps } from "svelte/elements";

    // Define button variants using tailwind-variants for easy management
    const buttonVariants = tv({
        base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                action: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    });

    type ButtonProps = WithElementProps<"button"> &
        VariantProps<typeof buttonVariants>;

    let {
        class: className,
        variant = "default",
        size = "default",
        children,
        ...rest
    }: ButtonProps = $props();
</script>

<button class={buttonVariants({ variant, size, className })} {...rest}>
    {@render children?.()}
</button>
