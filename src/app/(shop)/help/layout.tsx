import { HelpShell } from "@/features/help/components/help-shell";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <HelpShell>{children}</HelpShell>;
}
