// config/navigation.ts
export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "dashboard" },
  { href: "/markets", label: "Markets" },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/strategies", label: "Strategies" },
  { href: "/docs", label: "Docs" },
];
