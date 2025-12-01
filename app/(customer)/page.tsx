import Link from 'next/link';
import { ArrowRight, FlaskConical, Package, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-5xl font-bold uppercase tracking-wider md:text-7xl">
              Luxury
              <br />
              Decants
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Experience premium fragrances in perfectly portioned sizes.
              Hand-decanted with precision and care.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="flex items-center gap-2 border-2 border-foreground bg-foreground px-8 py-4 font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-2 border-foreground p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-foreground">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold uppercase">
                Hand Decanted
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Each decant is carefully hand-filled from authentic bottles with
                precision measurements.
              </p>
            </div>

            <div className="border-2 border-foreground p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-foreground">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold uppercase">
                Multiple Sizes
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose from 10ml, 15ml, 30ml, or 100ml sizes to suit your needs
                and budget.
              </p>
            </div>

            <div className="border-2 border-foreground p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-foreground">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold uppercase">
                100% Authentic
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All fragrances are sourced from authorized retailers and backed
                by our authenticity guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-wider md:text-5xl">
              Ready to Explore?
            </h2>
            <p className="mt-4 text-background/80">
              Browse our collection of premium fragrance decants and find your
              signature scent.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-2 border-background px-8 py-4 font-medium uppercase tracking-wider transition-colors hover:bg-background hover:text-foreground"
            >
              View Collection
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="border-t-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-8 text-center sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="font-serif text-lg font-bold uppercase">
                Payment Methods:
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="border-2 border-foreground px-4 py-2">
                <span className="text-sm font-bold uppercase">Cash on Delivery</span>
              </div>
              <div className="border-2 border-foreground px-4 py-2">
                <span className="text-sm font-bold uppercase">bKash</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
