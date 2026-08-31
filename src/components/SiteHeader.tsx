import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Acasă", exact: true },
  { to: "/bijuterii", label: "Bijuterii" },
  { to: "/machiaj", label: "Machiaj" },
  { to: "/noutati", label: "Noutăți" },
  { to: "/colectii", label: "Colecții" },
  { to: "/reduceri", label: "Reduceri" },
  { to: "/despre-noi", label: "Despre noi" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { cartCount, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/produse", search: { q: term || undefined } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="-ml-2 grid size-10 place-items-center rounded-full lg:hidden"
            aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2" aria-label="BIJUTERII — pagina principală">
            <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-gold to-primary font-display text-sm font-semibold text-primary-foreground">
              B
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">BIJUTERII</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigare principală">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              className="pill-nav"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-lilac/60"
            aria-label="Căutare"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-5" />
          </button>
          <Link
            to="/cont"
            search={{ tab: "favorite" }}
            className="hidden size-10 place-items-center rounded-full hover:bg-lilac/60 sm:grid"
            aria-label="Produse favorite"
          >
            <span className="relative">
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </span>
          </Link>
          <Link
            to="/cont"
            className="grid size-10 place-items-center rounded-full hover:bg-lilac/60"
            aria-label="Contul meu"
          >
            <User className="size-5" />
          </Link>
          <Link
            to="/cos"
            className="relative grid size-10 place-items-center rounded-full bg-lilac hover:bg-lilac/70"
            aria-label={`Coș de cumpărături, ${cartCount} produse`}
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="mx-auto max-w-6xl px-4 pb-3" role="search">
          <label htmlFor="cautare-site" className="sr-only">
            Caută bijuterii
          </label>
          <input
            id="cautare-site"
            className="field"
            placeholder="Caută bijuterii, ruj, fond de ten, brand..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            autoFocus
          />
        </form>
      )}

      <nav
        className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden"
        aria-label="Navigare rapidă"
      >
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            className="pill-nav shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block py-2.5 text-[15px] font-medium text-muted-foreground"
                  activeProps={{ className: "text-foreground" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/cont"
                className="block py-2.5 text-[15px] font-medium text-muted-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Contul meu
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
