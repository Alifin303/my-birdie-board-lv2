import React from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/RootLayout'

// Lazy-loaded components for code splitting
const Index = React.lazy(() => import('@/pages/Index'))
const About = React.lazy(() => import('@/pages/About'))
const FAQ = React.lazy(() => import('@/pages/FAQ'))
const Courses = React.lazy(() => import('@/pages/Courses'))
const Course = React.lazy(() => import('@/pages/Course'))
const Blog = React.lazy(() => import('@/pages/Blog'))
const Demo = React.lazy(() => import('@/pages/Demo'))
const GolfEquipment = React.lazy(() => import('@/pages/GolfEquipment'))
const GolfTips = React.lazy(() => import('@/pages/GolfTips'))
const GolfLessons = React.lazy(() => import('@/pages/GolfLessons'))
const PrivacyPolicy = React.lazy(() => import('@/pages/PrivacyPolicy'))
const NotFound = React.lazy(() => import('@/pages/NotFound'))

// Blog pages
const GolfScoreTrackingTips = React.lazy(() => import('@/pages/blog/GolfScoreTrackingTips'))
const BestGolfClubsBeginners = React.lazy(() => import('@/pages/blog/BestGolfClubsBeginners'))
const ImproveGolfSwing = React.lazy(() => import('@/pages/blog/ImproveGolfSwing'))
const CourseManagementTips = React.lazy(() => import('@/pages/blog/CourseManagementTips'))
const UnderstandingHandicap = React.lazy(() => import('@/pages/blog/UnderstandingHandicap'))
const StablefordScoring = React.lazy(() => import('@/pages/blog/StablefordScoring'))
const HowToBreak100 = React.lazy(() => import('@/pages/blog/HowToBreak100'))

// Guide pages
const HowToTrackGolfScores = React.lazy(() => import('@/pages/guides/HowToTrackGolfScores'))
const GolfHandicapCalculator = React.lazy(() => import('@/pages/guides/GolfHandicapCalculator'))
const BestGolfScoreApps = React.lazy(() => import('@/pages/guides/BestGolfScoreApps'))
const GolfPerformanceAnalytics = React.lazy(() => import('@/pages/guides/GolfPerformanceAnalytics'))
const GolfStatisticsTracker = React.lazy(() => import('@/pages/guides/GolfStatisticsTracker'))

// Auth pages (client-side only, not pre-rendered)
const AuthRedirect = React.lazy(() => import('@/pages/AuthRedirect'))
const AuthConfirm = React.lazy(() => import('@/pages/AuthConfirm'))
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'))
const Checkout = React.lazy(() => import('@/pages/Checkout'))
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Admin = React.lazy(() => import('@/pages/Admin'))

// Import ProtectedRoute
import { ProtectedRoute } from '@/components/ProtectedRoute'

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
        element: <Course />,
        // Dynamic routes are not pre-rendered by default
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
        element: <AuthRedirect />,
      },
      {
        path: '/auth/confirm',
        element: <AuthConfirm />,
      },
      {
        path: '/auth/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/checkout',
        element: <Checkout />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: <Admin />,
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
