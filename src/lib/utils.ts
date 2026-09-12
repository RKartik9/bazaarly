export { cn } from "cn";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");
}

export function randomId(prefix = "") {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return prefix ? `${prefix}-${id}` : id;
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
