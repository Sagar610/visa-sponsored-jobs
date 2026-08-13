"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, SITE_LOGO, SITE_LOGO_ALT } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="page-wrap flex h-16 items-center sm:h-[72px]">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Image
            src={SITE_LOGO}
            alt={SITE_LOGO_ALT}
            width={753}
            height={199}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <div className="ml-auto flex items-center gap-8">
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-muted lg:flex">
            {NAV.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "text-navy" : "hover:text-navy"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/contact"
            className="hidden px-3 py-2 text-sm font-semibold text-navy hover:text-blue sm:inline-flex"
          >
            Contact
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-navy lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <nav className="page-wrap flex flex-col py-3">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-[15px] font-medium text-navy"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-medium text-navy"
            >
              Contact us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
