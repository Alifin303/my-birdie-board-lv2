import React, { Suspense } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Navigate } from 'react-router-dom'
import { Providers } from '@/components/Providers'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { LazyLoadErrorBoundary } from '@/components/LazyLoadErrorBoundary'
import { RouteErrorFallback } from '@/components/RouteErrorFallback'

// Static imports for SSG pre-rendered pages
import Index from '@/pages/Index'
import About from '@/pages/About'
import FAQ from '@/pages/FAQ'
import Courses from '@/pages/Courses'
import Guides from '@/pages/Guides'
import Blog from '@/pages/Blog'
import Demo from '@/pages/Demo'
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
import PuttsPerRound from '@/pages/blog/PuttsPerRound'
import GolfHandicapBeginner from '@/pages/blog/GolfHandicapBeginner'
import GolfStatsToTrack from '@/pages/blog/GolfStatsToTrack'
import PlayingWithoutPhone from '@/pages/blog/PlayingWithoutPhone'
import CourseLeaderboards from '@/pages/blog/CourseLeaderboards'
import GolfScoringTerms from '@/pages/blog/GolfScoringTerms'

// Guide pages - static imports for SSG
import HowToTrackGolfScores from '@/pages/guides/HowToTrackGolfScores'
import GolfHandicapCalculator from '@/pages/guides/GolfHandicapCalculator'
import BestGolfScoreApps from '@/pages/guides/BestGolfScoreApps'
import GolfPerformanceAnalytics from '@/pages/guides/GolfPerformanceAnalytics'
import GolfStatisticsTracker from '@/pages/guides/GolfStatisticsTracker'
import GolfPerformanceMetrics from '@/pages/guides/GolfPerformanceMetrics'
import ImproveGolfUsingData from '@/pages/guides/ImproveGolfUsingData'
import PostRoundGolfAnalysis from '@/pages/guides/PostRoundGolfAnalysis'
import ChoosingGolfScoreTracker from '@/pages/guides/ChoosingGolfScoreTracker'

// Compare pages - static imports for SSG
import BestGolfScoreTrackingApps from '@/pages/compare/BestGolfScoreTrackingApps'

// Client-side only pages (lazy-loaded, not pre-rendered)
const Course = React.lazy(() => import('@/pages/Course'))
const AuthRedirect = React.lazy(() => import('@/pages/AuthRedirect'))
const AuthConfirm = React.lazy(() => import('@/pages/AuthConfirm'))
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'))
const Checkout = React.lazy(() => import('@/pages/Checkout'))
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Admin = React.lazy(() => import('@/pages/Admin'))

import { ProtectedRoute } from '@/components/ProtectedRoute'

// Helper: wrap a page element with Providers + global error boundary
const P = (el: React.ReactNode) => (
  <AppErrorBoundary>
    <Providers>{el}</Providers>
  </AppErrorBoundary>
)

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
  { path: '/', element: P(<Index />), errorElement: <RouteErrorFallback /> },
  { path: '/about', element: P(<About />), errorElement: <RouteErrorFallback /> },
  { path: '/faq', element: P(<FAQ />), errorElement: <RouteErrorFallback /> },
  { path: '/courses', element: P(<Courses />), errorElement: <RouteErrorFallback /> },
  { path: '/guides', element: P(<Guides />), errorElement: <RouteErrorFallback /> },
  { path: '/blog', element: P(<Blog />), errorElement: <RouteErrorFallback /> },
  { path: '/demo', element: P(<Demo />), errorElement: <RouteErrorFallback /> },
  { path: '/privacy', element: P(<PrivacyPolicy />), errorElement: <RouteErrorFallback /> },

  // Blog pages
  { path: '/blog/golf-score-tracking-tips', element: P(<GolfScoreTrackingTips />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/best-golf-clubs-for-beginners', element: P(<BestGolfClubsBeginners />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/improve-your-golf-swing', element: P(<ImproveGolfSwing />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/course-management-tips', element: P(<CourseManagementTips />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/understanding-golf-handicap-system', element: P(<UnderstandingHandicap />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/stableford-scoring', element: P(<StablefordScoring />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/how-to-break-100', element: P(<HowToBreak100 />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/match-play-scoring', element: P(<MatchPlayScoring />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/putts-per-round', element: P(<PuttsPerRound />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/how-to-calculate-golf-handicap', element: P(<GolfHandicapBeginner />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/golf-stats-to-track', element: P(<GolfStatsToTrack />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/playing-without-phone', element: P(<PlayingWithoutPhone />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/course-leaderboards', element: P(<CourseLeaderboards />), errorElement: <RouteErrorFallback /> },
  { path: '/blog/golf-scoring-terms', element: P(<GolfScoringTerms />), errorElement: <RouteErrorFallback /> },

  // Guide pages
  { path: '/guides/how-to-track-golf-scores', element: P(<HowToTrackGolfScores />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/golf-handicap-calculator', element: P(<GolfHandicapCalculator />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/best-golf-score-tracking-apps', element: P(<BestGolfScoreApps />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/golf-performance-analytics', element: P(<GolfPerformanceAnalytics />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/golf-statistics-tracker', element: P(<GolfStatisticsTracker />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/golf-performance-metrics', element: P(<GolfPerformanceMetrics />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/how-to-improve-at-golf-using-data', element: P(<ImproveGolfUsingData />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/post-round-golf-analysis', element: P(<PostRoundGolfAnalysis />), errorElement: <RouteErrorFallback /> },
  { path: '/guides/choosing-the-right-golf-score-tracker', element: P(<ChoosingGolfScoreTracker />), errorElement: <RouteErrorFallback /> },

  // Compare pages
  { path: '/compare/best-golf-score-tracking-apps', element: P(<BestGolfScoreTrackingApps />), errorElement: <RouteErrorFallback /> },

  // ===== CLIENT-SIDE ONLY ROUTES (Not pre-rendered) =====
  { path: '/courses/:courseId', element: P(<LazyWrapper><Course /></LazyWrapper>), errorElement: <RouteErrorFallback /> },
  { path: '/auth/callback', element: P(<LazyWrapper><AuthRedirect /></LazyWrapper>), errorElement: <RouteErrorFallback /> },
  { path: '/auth/confirm', element: P(<LazyWrapper><AuthConfirm /></LazyWrapper>), errorElement: <RouteErrorFallback /> },
  { path: '/auth/reset-password', element: P(<LazyWrapper><ResetPassword /></LazyWrapper>), errorElement: <RouteErrorFallback /> },
  { path: '/checkout', element: P(<LazyWrapper><Checkout /></LazyWrapper>), errorElement: <RouteErrorFallback /> },
  { path: '/dashboard', element: P(<ProtectedRoute><LazyWrapper><Dashboard /></LazyWrapper></ProtectedRoute>), errorElement: <RouteErrorFallback /> },
  { path: '/admin', element: P(<LazyWrapper><Admin /></LazyWrapper>), errorElement: <RouteErrorFallback /> },

  // Redirects
  // /quiz removed – deprecated page, falls through to 404
  { path: '/verify', element: <Navigate to="/auth/callback" replace /> },
  { path: '/auth/v1/verify', element: <Navigate to="/auth/callback" replace /> },

  // 404 fallback
  { path: '*', element: P(<NotFound />), errorElement: <RouteErrorFallback /> },
]
