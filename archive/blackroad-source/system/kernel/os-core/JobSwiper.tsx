/**
 * Tinder-Style Job Preference Swiper
 * Swipe right (like) or left (dislike) on job titles to set preferences
 */

'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface JobOption {
  title: string
  category: string
  description?: string
}

interface JobSwiperProps {
  jobs: JobOption[]
  onSwipe: (job: JobOption, interest: 'love' | 'like' | 'dislike' | 'hate') => void
  onComplete: () => void
}

export function JobSwiper({ jobs, onSwipe, onComplete }: JobSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const currentJob = jobs[currentIndex]
  const progress = ((currentIndex) / jobs.length) * 100

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentJob) return

    const interest = direction === 'right' ? 'like' : 'dislike'
    onSwipe(currentJob, interest)

    setExitDirection(direction)

    setTimeout(() => {
      if (currentIndex < jobs.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setExitDirection(null)
      } else {
        onComplete()
      }
    }, 300)
  }

  const handleSuperLike = () => {
    if (!currentJob) return
    onSwipe(currentJob, 'love')

    setExitDirection('right')
    setTimeout(() => {
      if (currentIndex < jobs.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setExitDirection(null)
      } else {
        onComplete()
      }
    }, 300)
  }

  if (!currentJob) {
    return null
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px]">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Finding your interests...</span>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {jobs.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full h-[500px]">
        {/* Next cards (shown underneath) */}
        {jobs.slice(currentIndex + 1, currentIndex + 3).map((job, index) => (
          <div
            key={`${job.title}-${index}`}
            className="absolute inset-0"
            style={{
              transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
              zIndex: jobs.length - (index + 1),
              opacity: 0.5
            }}
          >
            <div className="bg-white rounded-2xl shadow-lg w-full h-full" />
          </div>
        ))}

        {/* Current card */}
        <SwipeCard
          job={currentJob}
          onSwipe={handleSwipe}
          exitDirection={exitDirection}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition shadow-md"
          title="Dislike"
        >
          <span className="text-3xl">❌</span>
        </button>

        <button
          onClick={handleSuperLike}
          className="w-16 h-16 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition shadow-md"
          title="Love it!"
        >
          <span className="text-3xl">⭐</span>
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition shadow-md"
          title="Like"
        >
          <span className="text-3xl">✅</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 text-sm text-gray-500">
        <p>Swipe right (✅) for jobs you like</p>
        <p>Swipe left (❌) for jobs you don't want</p>
        <p>Star (⭐) for jobs you absolutely love!</p>
      </div>
    </div>
  )
}

function SwipeCard({
  job,
  onSwipe,
  exitDirection
}: {
  job: JobOption
  onSwipe: (direction: 'left' | 'right') => void
  exitDirection: 'left' | 'right' | null
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity, zIndex: 100 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? {
        x: exitDirection === 'right' ? 500 : -500,
        opacity: 0,
        transition: { duration: 0.3 }
      } : {}}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full p-8 flex flex-col justify-between">
        {/* Job Badge */}
        <div className="inline-block">
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {job.category}
          </span>
        </div>

        {/* Job Title */}
        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-center text-gray-900">
            {job.title}
          </h2>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-600 text-sm text-center">{job.description}</p>
          </div>
        )}

        {/* Swipe Indicators */}
        <div className="absolute top-8 left-8">
          <motion.div
            className="text-6xl font-bold text-red-500 rotate-[-20deg] opacity-0"
            style={{
              opacity: useTransform(x, [-200, -50, 0], [1, 0, 0])
            }}
          >
            NOPE
          </motion.div>
        </div>

        <div className="absolute top-8 right-8">
          <motion.div
            className="text-6xl font-bold text-green-500 rotate-[20deg] opacity-0"
            style={{
              opacity: useTransform(x, [0, 50, 200], [0, 0, 1])
            }}
          >
            LIKE
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Onboarding Flow Component
export function OnboardingJobSwiper() {
  const jobOptions: JobOption[] = [
    {
      title: "Software Engineer",
      category: "Software Engineering",
      description: "Build applications, write code, solve technical problems"
    },
    {
      title: "Data Scientist",
      category: "Data Science / Analytics",
      description: "Analyze data, build ML models, derive insights"
    },
    {
      title: "Product Manager",
      category: "Product Management",
      description: "Define product strategy, work with cross-functional teams"
    },
    {
      title: "UI/UX Designer",
      category: "Design (UI/UX)",
      description: "Design user interfaces, create wireframes, improve UX"
    },
    {
      title: "Marketing Manager",
      category: "Marketing",
      description: "Run campaigns, manage brand, drive growth"
    },
    {
      title: "Sales Executive",
      category: "Sales",
      description: "Build client relationships, close deals, exceed quotas"
    },
    {
      title: "DevOps Engineer",
      category: "Software Engineering",
      description: "Manage infrastructure, CI/CD, cloud deployments"
    },
    {
      title: "Full Stack Developer",
      category: "Software Engineering",
      description: "Build complete applications from frontend to backend"
    },
    {
      title: "Machine Learning Engineer",
      category: "Data Science / Analytics",
      description: "Build and deploy ML models at scale"
    },
    {
      title: "Senior Product Manager",
      category: "Product Management",
      description: "Lead product strategy, mentor PMs, drive vision"
    }
  ]

  const [swipes, setSwipes] = useState<Array<{ job: JobOption; interest: string }>>([])
  const [complete, setComplete] = useState(false)

  const handleSwipe = (job: JobOption, interest: string) => {
    setSwipes([...swipes, { job, interest }])

    // In production, would call API
    console.log(`Swiped ${interest} on ${job.title}`)
  }

  const handleComplete = () => {
    setComplete(true)

    // Analyze swipes to determine preferred categories
    const categoryScores: Record<string, number> = {}

    swipes.forEach(({ job, interest }) => {
      if (!categoryScores[job.category]) {
        categoryScores[job.category] = 0
      }

      const score = interest === 'love' ? 5 : interest === 'like' ? 3 : interest === 'dislike' ? -3 : -5
      categoryScores[job.category] += score
    })

    const topCategories = Object.entries(categoryScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([cat, _]) => cat)

    console.log('Preferred categories:', topCategories)

    // In production, would save to profile and continue onboarding
  }

  if (complete) {
    return (
      <div className="text-center p-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4">Preferences Saved!</h2>
        <p className="text-gray-600 mb-6">
          We'll focus your job search on roles you're interested in.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-semibold mb-3">Your Interests:</h3>
          <div className="flex flex-wrap gap-2">
            {swipes
              .filter(s => s.interest === 'love' || s.interest === 'like')
              .map(({ job }, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {job.title}
                </span>
              ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700"
        >
          Continue to Next Step
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Role</h1>
          <p className="text-gray-600">
            Swipe through job titles to help us understand what you're looking for
          </p>
        </div>

        <JobSwiper
          jobs={jobOptions}
          onSwipe={handleSwipe}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
