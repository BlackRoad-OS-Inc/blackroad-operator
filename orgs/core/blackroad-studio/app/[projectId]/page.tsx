'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ProjectRoot() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    router.replace(`/${params.projectId}/script`)
  }, [router, params.projectId])

  return null
}
