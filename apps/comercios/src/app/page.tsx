import { redirect } from 'next/navigation'

/** Hito 1: la entrada del app es la afiliación. La terminal llega en el hito 2. */
export default function Home() {
  redirect('/afiliacion')
}
