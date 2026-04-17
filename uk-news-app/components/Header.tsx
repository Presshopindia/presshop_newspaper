import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news/category/politics", label: "Politics" },
  { href: "/news/category/crime", label: "Crime" },
  { href: "/news/category/entertainment", label: "Entertainment" },
  { href: "/news/category/sport", label: "Sport" },
  { href: "/news/category/business", label: "Business" },
  { href: "/news/category/tech", label: "Tech" },
];

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="bg-slate-900 py-2 text-xs text-slate-100">
        <div className="container-padded flex items-center justify-between">
          <p>Breaking stories from across the UK</p>
          <p>{new Date().toLocaleDateString("en-GB")}</p>
        </div>
      </div>

      <div className="container-padded flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-brand-900"
        >
          UK News
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
