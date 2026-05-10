import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf, Recycle, Heart } from 'lucide-react'

const values = [
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'Organic cotton, recycled fibers, and responsible sourcing.',
  },
  {
    icon: Recycle,
    title: 'Circular Fashion',
    description: 'Designed for longevity with repair and recycling programs.',
  },
  {
    icon: Heart,
    title: 'Ethical Production',
    description: 'Fair wages and safe conditions for all workers.',
  },
]

export function BrandStory() {
  return (
    <section className="border-y border-border bg-secondary/30 py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">
            Fashion with Purpose
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            We believe style and sustainability go hand in hand. Every piece is crafted with care for both you and our planet.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {values.map((value) => (
            <div key={value.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-semibold sm:text-base">
                {value.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/sustainability">Learn More About Our Mission</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
