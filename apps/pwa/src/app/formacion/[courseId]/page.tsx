'use client'

import { use } from 'react'
import { CourseScreen } from '@/components/TrainingViews'

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  return <CourseScreen courseId={courseId} />
}
