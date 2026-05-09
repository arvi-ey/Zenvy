import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const footerLinks = {
  shop: [
    { href: '/collections/new-arrivals', label: 'New Arrivals' },
    { href: '/collections/tshirts', label: 'T-Shirts' },
    { href: '/collections/shirts', label: 'Shirts' },
    { href: '/collections/trousers', label: 'Trousers' },
    { href: '/collections/jackets', label: 'Jackets' },
    { href: '/collections/accessories', label: 'Accessories' },
  ],
  help: [
    { href: '/help/shipping', label: 'Shipping & Returns' },
    { href: '/help/faq', label: 'FAQ' },
    { href: '/help/size-guide', label: 'Size Guide' },
    { href: '/help/contact', label: 'Contact Us' },
    { href: '/help/track-order', label: 'Track Order' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/sustainability', label: 'Sustainability' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/stores', label: 'Store Locator' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-black text-white">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-6 text-white">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold sm:text-xl">Join Our Newsletter</h3>
          <p className="mt-2 max-w-md text-sm text-white">
            Subscribe for exclusive offers, new arrivals, and style inspiration.
          </p>
          <form className="mt-4 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white text-black"
              required
            />
            <Button type="submit" className="whitespace-nowrap cursor-pointer hover:bg-black">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Links Section */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {/* Logo & Description */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <Link href="/" className="text-xl font-bold tracking-wider">
                LUXE
              </Link>
              <p className="mt-3 max-w-xs text-sm text-white">
                Curated premium fashion for the modern individual. Quality, style, and sustainability.
              </p>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white transition-colors     "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Help</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.help.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white transition-colors     "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white transition-colors     "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:text-left lg:px-6">
          <p className="text-xs text-white">
            &copy; {new Date().getFullYear()} LUXE. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white sm:gap-6">
            <Link href="/privacy" className="transition-colors     ">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors     ">
              Terms of Service
            </Link>
            <Link href="/cookies" className="transition-colors     ">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
