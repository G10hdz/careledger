import { Audiences } from '@/components/audiences'
import { Calculator } from '@/components/calculator'
import { Contact } from '@/components/contact'
import { Faq } from '@/components/faq'
import { Guarantees } from '@/components/guarantees'
import { Hero } from '@/components/hero'
import { ImpactStrip } from '@/components/impact-strip'
import { Levels } from '@/components/levels'
import { Merchants } from '@/components/merchants'
import { RouteTimeline } from '@/components/route-timeline'
import { SectionHeading } from '@/components/section-heading'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <RouteTimeline />
        <ImpactStrip />

        <section id="calculadora" className="border-b border-outline-variant/60 bg-surface">
          <div className="container-page py-16 sm:py-20 lg:py-28">
            <SectionHeading
              eyebrow="Calculadora"
              title="¿A qué equivale tu semana de cuidado?"
              lead="Mueve las horas y mira los puntos que se emiten, el ahorro que evita al sistema de salud y el descanso certificado que puedes alcanzar."
            />
            <div className="mt-10">
              <Calculator />
            </div>
            <Levels />
          </div>
        </section>

        <Guarantees />
        <Audiences />
        <Merchants />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
