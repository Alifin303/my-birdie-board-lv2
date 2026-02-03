import React, { Suspense } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/RootLayout'

// Static imports for SSG pre-rendered pages (required for content to be in HTML)
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

// Import ProtectedRoute
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Wrapper for lazy-loaded components
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
    {children}
  </Suspense>
)

/**
 * Route configuration for vite-react-ssg
 * All public routes will be statically pre-rendered at build time
 */
export const routes: RouteRecord[] = [
  {
    // Root layout wraps all routes with providers
    element: <RootLayout />,
    entry: 'src/components/RootLayout.tsx',
    children: [
      // ===== PUBLIC PAGES (Pre-rendered as static HTML) =====
      {
        path: '/',
        element: <Index />,
        entry: 'src/pages/Index.tsx',
      },
      {
        path: '/about',
        element: <About />,
        entry: 'src/pages/About.tsx',
      },
      {
        path: '/faq',
        element: <FAQ />,
        entry: 'src/pages/FAQ.tsx',
      },
      {
        path: '/courses',
        element: <Courses />,
        entry: 'src/pages/Courses.tsx',
      },
      {
        path: '/courses/:courseId',
        element: <LazyWrapper><Course /></LazyWrapper>,
        // Dynamic routes are not pre-rendered
      },
      {
        path: '/blog',
        element: <Blog />,
        entry: 'src/pages/Blog.tsx',
      },
      {
        path: '/blog/golf-score-tracking-tips',
        element: <GolfScoreTrackingTips />,
        entry: 'src/pages/blog/GolfScoreTrackingTips.tsx',
      },
      {
        path: '/blog/best-golf-clubs-for-beginners',
        element: <BestGolfClubsBeginners />,
        entry: 'src/pages/blog/BestGolfClubsBeginners.tsx',
      },
      {
        path: '/blog/improve-your-golf-swing',
        element: <ImproveGolfSwing />,
        entry: 'src/pages/blog/ImproveGolfSwing.tsx',
      },
      {
        path: '/blog/course-management-tips',
        element: <CourseManagementTips />,
        entry: 'src/pages/blog/CourseManagementTips.tsx',
      },
      {
        path: '/blog/understanding-golf-handicap-system',
        element: <UnderstandingHandicap />,
        entry: 'src/pages/blog/UnderstandingHandicap.tsx',
      },
      {
        path: '/blog/stableford-scoring',
        element: <StablefordScoring />,
        entry: 'src/pages/blog/StablefordScoring.tsx',
      },
      {
        path: '/blog/how-to-break-100',
        element: <HowToBreak100 />,
        entry: 'src/pages/blog/HowToBreak100.tsx',
      },
      
      // Guide pages
      {
        path: '/guides/how-to-track-golf-scores',
        element: <HowToTrackGolfScores />,
        entry: 'src/pages/guides/HowToTrackGolfScores.tsx',
      },
      {
        path: '/guides/golf-handicap-calculator',
        element: <GolfHandicapCalculator />,
        entry: 'src/pages/guides/GolfHandicapCalculator.tsx',
      },
      {
        path: '/guides/best-golf-score-tracking-apps',
        element: <BestGolfScoreApps />,
        entry: 'src/pages/guides/BestGolfScoreApps.tsx',
      },
      {
        path: '/guides/golf-performance-analytics',
        element: <GolfPerformanceAnalytics />,
        entry: 'src/pages/guides/GolfPerformanceAnalytics.tsx',
      },
      {
        path: '/guides/golf-statistics-tracker',
        element: <GolfStatisticsTracker />,
        entry: 'src/pages/guides/GolfStatisticsTracker.tsx',
      },
      
      // High-volume keyword landing pages
      {
        path: '/golf-equipment',
        element: <GolfEquipment />,
        entry: 'src/pages/GolfEquipment.tsx',
      },
      {
        path: '/golf-tips',
        element: <GolfTips />,
        entry: 'src/pages/GolfTips.tsx',
      },
      {
        path: '/golf-lessons',
        element: <GolfLessons />,
        entry: 'src/pages/GolfLessons.tsx',
      },
      {
        path: '/demo',
        element: <Demo />,
        entry: 'src/pages/Demo.tsx',
      },
      {
        path: '/privacy',
        element: <PrivacyPolicy />,
        entry: 'src/pages/PrivacyPolicy.tsx',
      },
      
      // ===== CLIENT-SIDE ONLY ROUTES (Not pre-rendered) =====
      {
        path: '/auth/callback',
        element: <LazyWrapper><AuthRedirect /></LazyWrapper>,
      },
      {
        path: '/auth/confirm',
        element: <LazyWrapper><AuthConfirm /></LazyWrapper>,
      },
      {
        path: '/auth/reset-password',
        element: <LazyWrapper><ResetPassword /></LazyWrapper>,
      },
      {
        path: '/checkout',
        element: <LazyWrapper><Checkout /></LazyWrapper>,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <LazyWrapper><Dashboard /></LazyWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: <LazyWrapper><Admin /></LazyWrapper>,
      },
      
      // Redirects
      {
        path: '/quiz',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/verify',
        element: <Navigate to="/auth/callback" replace />,
      },
      {
        path: '/auth/v1/verify',
        element: <Navigate to="/auth/callback" replace />,
      },
      
      // 404 fallback
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
