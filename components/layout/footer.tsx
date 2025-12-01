import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-xl font-bold uppercase tracking-widest">
              Cologne Noir
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Premium perfume decants crafted with precision. Experience luxury fragrances
              in perfectly portioned sizes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?gender=masculine"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Masculine
                </Link>
              </li>
              <li>
                <Link
                  href="/products?gender=feminine"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Feminine
                </Link>
              </li>
              <li>
                <Link
                  href="/products?gender=unisex"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Unisex
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-foreground/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Cologne Noir. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-muted-foreground">
                Cash on Delivery & bKash Accepted
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
