import { cn } from "@/lib/utils";

export function ImagePlaceholder({
  active = false,
  className
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-[#e9e9e7]", active && "bg-[#ecece9]", className)}>
      <div className="absolute inset-[9%] border border-dashed border-[#c7c7c1]" />
      <div className="absolute inset-x-[9%] top-1/2 h-px bg-[#d4d4cf]" />
      <div className="absolute inset-y-[9%] left-1/2 w-px bg-[#d4d4cf]" />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 border border-[#c8c8c2]",
          active && "animate-image-loading-pulse"
        )}
      />

      {active ? (
        <div className="absolute inset-0 animate-image-loading-sweep bg-[linear-gradient(115deg,transparent_0%,transparent_44%,rgba(255,255,255,0.18)_50%,transparent_56%,transparent_100%)]" />
      ) : null}
    </div>
  );
}
