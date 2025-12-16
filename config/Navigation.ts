// config/navigation.ts
export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/trade", label: "Trade" },
  { href: "/markets", label: "Markets" },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/strategies", label: "Strategies" },
  { href: "/docs", label: "Docs" },
];
