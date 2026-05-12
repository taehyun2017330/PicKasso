import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function QuestionBlock({
  icon,
  title,
  subtitle,
  children,
  last = false
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("border-b border-[#e3e3e3] pb-6", !last && "mb-6")}>
      <div className="mb-4 flex gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center text-[#161616]">{icon}</span>
        <div>
          <p className="text-[17px] font-medium text-[#242424]">{title}</p>
          <p className="mt-0.5 text-sm text-[#737373]">{subtitle}</p>
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}
