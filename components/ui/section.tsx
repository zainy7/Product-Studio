import { cn } from "@/lib/utils";

export function Section({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("w-full py-12 md:py-24 lg:py-32", className)}
      {...props}
    />
  );
}

