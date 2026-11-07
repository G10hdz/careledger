'use client'

import { coursePoints } from '@careledger/domain'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { certificatePdf, certificateQrText } from '@/lib/documents'
import { downloadBytes } from '@/lib/download'
import { formatWhen } from '@/lib/format'
import { careApp } from '@/lib/singleton'
import { coursesFor, courseById, textOf, type CourseLine } from '@/lib/courses'
import { QUIZZES } from '@/lib/quizzes'
import { useCare } from './Provider'
import { btnPrimary, btnSecondary, card, chipOff, chipOn, choiceOff, choiceOn } from './styles'

export function TrainingHome() {
  const { snap, t, lang } = useCare()
  const [short, setShort] = useState(false)
  if (!snap) return null
  const list = coursesFor(short ? 20 : undefined)
  const lines: CourseLine[] = ['tecnica', 'digital']

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-[1.625rem] font-bold leading-8">{t('trainingTitle')}</h1>
        <p className="mt-2 text-base text-on-surface-variant">{t('trainingIntro')}</p>
        <Link href="/perfil" className={`${card} mt-3 block min-h-16`} data-testid="accreditation-link">
          <span className="font-display text-sm font-semibold">{t('yourStatus')}</span>
          <span className="mt-1 block font-display text-lg font-bold" data-testid="accreditation-status">
            {snap.accreditation.status === 'acreditada' && snap.accreditation.id
              ? t('accredited', { id: snap.accreditation.id })
              : t('inProcess')}
          </span>
        </Link>
      </header>
      <button type="button" className={short ? chipOn : chipOff} data-testid="fits-20" aria-pressed={short} onClick={() => setShort((value) => !value)}>
        {short ? t('showAll') : t('fits20')}
      </button>
      {lines.map((line) => {
        const courses = list.filter((course) => course.line === line)
        if (courses.length === 0) return null
        return (
          <section key={line}>
            <h2 className="font-display text-xl font-semibold">{line === 'tecnica' ? t('lineTech') : t('lineDigital')}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {courses.map((course) => {
                const progress = snap.courses.find((item) => item.id === course.id)
                return (
                  <li key={course.id}>
                    <Link href={`/formacion/${course.id}`} className={`${card} block min-h-16`} data-testid={`course-${course.id}`}>
                      <span className="font-display text-lg font-semibold">{textOf(course.title, lang)}</span>
                      <span className="mt-1 block text-sm text-on-surface-variant">
                        {course.level === 'inicial' ? t('levelInicial') : t('levelIntermedio')} · {t('minutesShort', { n: course.minutes })}
                      </span>
                      <span className="mt-1 block text-sm">
                        {t('progress', { done: progress?.completed ?? 0, total: progress?.total ?? course.modules.length })}
                      </span>
                      {coursePoints(course.id) > 0 ? (
                        <span className="mt-1 block text-sm font-semibold">{t('coursePointsLine', { n: coursePoints(course.id) })}</span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export function CourseScreen({ courseId }: { courseId: string }) {
  const { snap, t, lang, refresh } = useCare()
  const [busy, setBusy] = useState<string | null>(null)
  const [picks, setPicks] = useState<Record<string, number>>({})
  const [quizBad, setQuizBad] = useState(false)
  const [quizBusy, setQuizBusy] = useState(false)
  const course = courseById(courseId)
  if (!snap || !course) return <p className="text-base">{t('trainingTitle')}</p>
  const progress = snap.courses.find((item) => item.id === course.id)
  const certificate = snap.certificates.find((item) => item.courseId === course.id)
  const doneIds = new Set(progress?.completedModuleIds ?? [])
  const quiz = QUIZZES[course.id] ?? []
  const quizPassed = progress?.quizPassed ?? false
  const listedPoints = coursePoints(course.id)

  async function complete(moduleId: string) {
    setBusy(moduleId)
    try {
      await careApp().completeModule(courseId, moduleId)
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function submitQuiz() {
    setQuizBusy(true)
    setQuizBad(false)
    try {
      const result = await careApp().submitQuiz(
        courseId,
        quiz.map((question) => picks[question.id] ?? -1),
      )
      if (!result.correct) setQuizBad(true)
      await refresh()
    } finally {
      setQuizBusy(false)
    }
  }

  return (
    <article className="flex flex-col gap-4">
      <p className="font-display text-sm font-semibold text-primary">{course.line === 'tecnica' ? t('lineTech') : t('lineDigital')}</p>
      <h1 className="font-display text-[1.625rem] font-bold leading-8">{textOf(course.title, lang)}</h1>
      <p className="text-base text-on-surface-variant">{textOf(course.summary, lang)}</p>
      <p className="text-sm">
        {course.level === 'inicial' ? t('levelInicial') : t('levelIntermedio')} · {t('minutesShort', { n: course.minutes })} ·{' '}
        {t('progress', { done: progress?.completed ?? 0, total: course.modules.length })}
      </p>
      <p className="text-base font-semibold">{listedPoints > 0 ? t('coursePointsLine', { n: listedPoints }) : t('courseNoPoints')}</p>
      <ol className="flex flex-col gap-3">
        {course.modules.map((module, index) => {
          const moduleDone = doneIds.has(module.id)
          return (
            <li key={module.id} className={card} data-testid={`module-${module.id}`}>
              <h2 className="font-display text-lg font-semibold">
                {index + 1}. {textOf(module.title, lang)}
              </h2>
              <p className="mt-2 text-base leading-6">{textOf(module.body, lang)}</p>
              <button
                type="button"
                className={`${btnPrimary} mt-3`}
                data-testid={`complete-${module.id}`}
                disabled={moduleDone || busy === module.id}
                onClick={() => void complete(module.id)}
              >
                {moduleDone ? t('moduleDone') : t('markDone')}
              </button>
            </li>
          )
        })}
      </ol>
      <section className={card} data-testid="quiz">
        <h2 className="font-display text-xl font-semibold">{t('quizTitle')}</h2>
        <div className="mt-3 flex flex-col gap-4">
          {quiz.map((question) => (
            <fieldset key={question.id} className="flex flex-col gap-2">
              <legend className="font-display text-base font-semibold">{textOf(question.prompt, lang)}</legend>
              {question.options.map((option, index) => {
                const selected = picks[question.id] === index
                return (
                  <button
                    key={option.es}
                    type="button"
                    className={selected ? choiceOn : choiceOff}
                    aria-pressed={selected}
                    disabled={quizPassed}
                    onClick={() => {
                      setQuizBad(false)
                      setPicks((prev) => ({ ...prev, [question.id]: index }))
                    }}
                  >
                    {textOf(option, lang)}
                  </button>
                )
              })}
            </fieldset>
          ))}
        </div>
        {quizBad ? (
          <p className="mt-3 text-base" data-testid="quiz-error">
            {t('quizRetry')}
          </p>
        ) : null}
        <button
          type="button"
          className={`${btnPrimary} mt-3`}
          data-testid="quiz-submit"
          disabled={quizPassed || quizBusy || quiz.some((question) => picks[question.id] === undefined)}
          onClick={() => void submitQuiz()}
        >
          {quizPassed ? t('quizReady') : t('quizSubmit')}
        </button>
      </section>
      {certificate ? <CertificateBlock folio={certificate.folio} /> : null}
    </article>
  )
}

function CertificateBlock({ folio }: { folio: string }) {
  const { snap, t } = useCare()
  const cert = snap?.certificates.find((item) => item.folio === folio)
  const [qr, setQr] = useState<string | null>(null)
  useEffect(() => {
    if (!cert) return
    let alive = true
    void import('qrcode').then(async (mod) => {
      const url = await mod.toDataURL(certificateQrText(cert), { width: 220, margin: 1, errorCorrectionLevel: 'M' })
      if (alive) setQr(url)
    })
    return () => {
      alive = false
    }
  }, [cert])
  if (!cert) return null
  return (
    <section className="rounded-2xl border-2 border-primary bg-surface-container-lowest p-4" data-testid="certificate">
      <h2 className="font-display text-xl font-semibold">{t('courseComplete')}</h2>
      <p className="mt-2 font-display text-2xl font-bold tracking-wide">{cert.folio}</p>
      <p className="mt-1 text-base">{cert.courseName}</p>
      <p className="text-sm text-on-surface-variant">{formatWhen(cert.issuedAt, 'es')}</p>
      <p className="mt-2 text-base" data-testid="certificate-points">
        {cert.points > 0
          ? t('pointsEarned', { n: cert.points })
          : coursePoints(cert.courseId) > 0
            ? t('pointsCapped')
            : t('courseNoPoints')}
      </p>
      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={cert.folio} width={180} height={180} className="mt-3 h-[180px] w-[180px]" />
      ) : null}
      <p className="mt-3 text-sm leading-5">{t('verifyOk')}</p>
      <button type="button" className={`${btnSecondary} mt-3`} onClick={() => downloadBytes(`certificado-${cert.folio}.pdf`, certificatePdf(cert), 'application/pdf')}>
        {t('downloadCert')}
      </button>
    </section>
  )
}

export function ProfileScreen() {
  const { snap, t, lang } = useCare()
  if (!snap) return null
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[1.625rem] font-bold leading-8">{t('profile')}</h1>
      <p className="text-base text-on-surface-variant">{t('profileBody')}</p>
      <section className={card}>
        <p className="font-display text-sm font-semibold">{t('yourStatus')}</p>
        <p className="mt-1 font-display text-2xl font-bold" data-testid="accreditation-status">
          {snap.accreditation.status === 'acreditada' && snap.accreditation.id
            ? t('accredited', { id: snap.accreditation.id })
            : t('inProcess')}
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">{t('certificates')}</h2>
        {snap.certificates.length === 0 ? <p className="mt-2 text-base text-on-surface-variant">{t('noCertificates')}</p> : null}
        <ul className="mt-2 flex flex-col gap-2">
          {snap.certificates.map((cert) => (
            <li key={cert.folio} className={card}>
              <p className="font-display font-semibold">{textOf(courseById(cert.courseId)?.title ?? { es: cert.courseName, en: cert.courseName, nah: cert.courseName }, lang)}</p>
              <p className="mt-1 font-display text-lg font-bold">{cert.folio}</p>
              <p className="text-sm text-on-surface-variant">{formatWhen(cert.issuedAt, lang)}</p>
              <button type="button" className={`${btnPrimary} mt-3`} onClick={() => downloadBytes(`certificado-${cert.folio}.pdf`, certificatePdf(cert), 'application/pdf')}>
                {t('downloadCert')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
