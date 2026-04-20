import TrackedNavLink from "@/components/TrackedNavLink";

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
            <TrackedNavLink
              href="/"
              label="Home"
              location="footer"
              className="block hover:text-brand-700"
            >
              Home
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/politics"
              label="Politics"
              location="footer"
              className="block hover:text-brand-700"
            >
              Politics
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/crime"
              label="Crime"
              location="footer"
              className="block hover:text-brand-700"
            >
              Crime
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/business"
              label="Business"
              location="footer"
              className="block hover:text-brand-700"
            >
              Business
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/sport"
              label="Sport"
              location="footer"
              className="block hover:text-brand-700"
            >
              Sport
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/tech"
              label="Tech"
              location="footer"
              className="block hover:text-brand-700"
            >
              Tech
            </TrackedNavLink>
            <TrackedNavLink
              href="/news/category/entertainment"
              label="Entertainment"
              location="footer"
              className="block hover:text-brand-700"
            >
              Entertainment
            </TrackedNavLink>
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
