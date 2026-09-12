import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<
  React.ComponentProps<typeof ClerkProvider>["appearance"]
>;

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#e8703f",
    colorBackground: "#fffdf9",
    colorForeground: "#3d2f26",
    colorMutedForeground: "#7a675c",
    colorInput: "#fbf7ef",
    colorInputForeground: "#3d2f26",
    borderRadius: "0.875rem",
    fontFamily: "var(--font-figtree), ui-sans-serif, system-ui",
  },
  elements: {
    card: "shadow-lift border border-border/60",
    headerTitle: "font-heading text-2xl",
    formButtonPrimary: "font-semibold shadow-none hover:opacity-90",
    footerActionLink: "text-primary hover:text-primary/80",
  },
};
