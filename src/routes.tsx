import React, { Suspense } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Navigate } from 'react-router-dom'
import { Providers } from '@/components/Providers'
import { LazyLoadErrorBoundary } from '@/components/LazyLoadErrorBoundary'

// Static imports for SSG pre-rendered pages
import Index from '@/pages/Index'
import About from '@/pages/About'
import FAQ from '@/pages/FAQ'
import Courses from '@/pages/Courses'
import Blog from '@/pages/Blog'
import Demo from '@/pages/Demo'
import GolfEquipment from '@/pages/GolfEquipment'
import GolfTips from '@/pages/GolfTips'
import GolfLessons from '@/pages/GolfLessons'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import NotFound from '@/pages/NotFound'

// Blog pages - static imports for SSG
import GolfScoreTrackingTips from '@/pages/blog/GolfScoreTrackingTips'
import BestGolfClubsBeginners from '@/pages/blog/BestGolfClubsBeginners'
import ImproveGolfSwing from '@/pages/blog/ImproveGolfSwing'
import CourseManagementTips from '@/pages/blog/CourseManagementTips'
import UnderstandingHandicap from '@/pages/blog/UnderstandingHandicap'
import StablefordScoring from '@/pages/blog/StablefordScoring'
import HowToBreak100 from '@/pages/blog/HowToBreak100'
import MatchPlayScoring from '@/pages/blog/MatchPlayScoring'

// Guide pages - static imports for SSG
import HowToTrackGolfScores from '@/pages/guides/HowToTrackGolfScores'
import GolfHandicapCalculator from '@/pages/guides/GolfHandicapCalculator'
import BestGolfScoreApps from '@/pages/guides/BestGolfScoreApps'
import GolfPerformanceAnalytics from '@/pages/guides/GolfPerformanceAnalytics'
import GolfStatisticsTracker from '@/pages/guides/GolfStatisticsTracker'

// Client-side only pages (lazy-loaded, not pre-rendered)
const Course = React.lazy(() => import('@/pages/Course'))
const AuthRedirect = React.lazy(() => import('@/pages/AuthRedirect'))
const AuthConfirm = React.lazy(() => import('@/pages/AuthConfirm'))
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'))
const Checkout = React.lazy(() => import('@/pages/Checkout'))
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Admin = React.lazy(() => import('@/pages/Admin'))

import { ProtectedRoute } from '@/components/ProtectedRoute'

// Helper: wrap a page element with Providers
const P = (el: React.ReactNode) => <Providers>{el}</Providers>

// Wrapper for lazy-loaded components with error boundary for chunk failures
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      {children}
    </Suspense>
  </LazyLoadErrorBoundary>
)

/**
 * FLAT route configuration for vite-react-ssg.
 * No nested layout routes — each route is top-level so vite-react-ssg
 * can discover and pre-render every path.
 */
export const routes: RouteRecord[] = [
  // ===== PUBLIC PAGES (Pre-rendered as static HTML) =====
  { path: '/', element: P(<Index />) },
  { path: '/about', element: P(<About />) },
  { path: '/faq', element: P(<FAQ />) },
  { path: '/courses', element: P(<Courses />) },
  { path: '/blog', element: P(<Blog />) },
  { path: '/demo', element: P(<Demo />) },
  { path: '/golf-equipment', element: P(<GolfEquipment />) },
  { path: '/golf-tips', element: P(<GolfTips />) },
  { path: '/golf-lessons', element: P(<GolfLessons />) },
  { path: '/privacy', element: P(<PrivacyPolicy />) },

  // Blog pages
  { path: '/blog/golf-score-tracking-tips', element: P(<GolfScoreTrackingTips />) },
  { path: '/blog/best-golf-clubs-for-beginners', element: P(<BestGolfClubsBeginners />) },
  { path: '/blog/improve-your-golf-swing', element: P(<ImproveGolfSwing />) },
  { path: '/blog/course-management-tips', element: P(<CourseManagementTips />) },
  { path: '/blog/understanding-golf-handicap-system', element: P(<UnderstandingHandicap />) },
  { path: '/blog/stableford-scoring', element: P(<StablefordScoring />) },
  { path: '/blog/how-to-break-100', element: P(<HowToBreak100 />) },
  { path: '/blog/match-play-scoring', element: P(<MatchPlayScoring />) },

  // Guide pages
  { path: '/guides/how-to-track-golf-scores', element: P(<HowToTrackGolfScores />) },
  { path: '/guides/golf-handicap-calculator', element: P(<GolfHandicapCalculator />) },
  { path: '/guides/best-golf-score-tracking-apps', element: P(<BestGolfScoreApps />) },
  { path: '/guides/golf-performance-analytics', element: P(<GolfPerformanceAnalytics />) },
  { path: '/guides/golf-statistics-tracker', element: P(<GolfStatisticsTracker />) },

  // ===== CLIENT-SIDE ONLY ROUTES (Not pre-rendered) =====
  { path: '/courses/:courseId', element: P(<LazyWrapper><Course /></LazyWrapper>) },
  { path: '/auth/callback', element: P(<LazyWrapper><AuthRedirect /></LazyWrapper>) },
  { path: '/auth/confirm', element: P(<LazyWrapper><AuthConfirm /></LazyWrapper>) },
  { path: '/auth/reset-password', element: P(<LazyWrapper><ResetPassword /></LazyWrapper>) },
  { path: '/checkout', element: P(<LazyWrapper><Checkout /></LazyWrapper>) },
  { path: '/dashboard', element: P(<ProtectedRoute><LazyWrapper><Dashboard /></LazyWrapper></ProtectedRoute>) },
  { path: '/admin', element: P(<LazyWrapper><Admin /></LazyWrapper>) },

  // Redirects
  { path: '/quiz', element: <Navigate to="/" replace /> },
  { path: '/verify', element: <Navigate to="/auth/callback" replace /> },
  { path: '/auth/v1/verify', element: <Navigate to="/auth/callback" replace /> },

  // 404 fallback
  { path: '*', element: P(<NotFound />) },
]
