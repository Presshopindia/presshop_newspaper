import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="container-padded grid gap-10 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">UK News</h3>
          <p className="mt-3 text-sm text-slate-600">
            A modern newsroom layout converted to Next.js App Router with
            reusable components.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Quick Links
          </h4>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Link href="/" className="block hover:text-brand-700">
              Home
            </Link>
            <Link
              href="/news/category/politics"
              className="block hover:text-brand-700"
            >
              Politics
            </Link>
            <Link
              href="/news/category/crime"
              className="block hover:text-brand-700"
            >
              Crime
            </Link>
            <Link
              href="/news/category/business"
              className="block hover:text-brand-700"
            >
              Business
            </Link>
            <Link
              href="/news/category/sport"
              className="block hover:text-brand-700"
            >
              Sport
            </Link>
            <Link
              href="/news/category/tech"
              className="block hover:text-brand-700"
            >
              Tech
            </Link>
            <Link
              href="/news/category/entertainment"
              className="block hover:text-brand-700"
            >
              Entertainment
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Follow
          </h4>
          <div className="mt-3 flex gap-3 text-sm text-slate-600">
            <a href="#" className="hover:text-brand-700">
              X
            </a>
            <a href="#" className="hover:text-brand-700">
              Instagram
            </a>
            <a href="#" className="hover:text-brand-700">
              YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} UK News. All rights reserved.
      </div>
    </footer>
  );
}
