import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Providers
import { AuthProvider } from '@/components/AuthProvider';

// Auth Routes (EC Only)
import { SignIn } from '@/pages/auth/SignIn';
import { ECSignUp } from '@/pages/auth/ECSignUp';

// Components
import { ProtectedRoute, ProtectedRouteWithRole } from '@/components/ProtectedRoute';

// Public Ballot Routes
import { PublicBallotEntry } from '@/pages/ballot/PublicBallotEntry';
import { PublicBallot } from '@/pages/ballot/PublicBallot';
import { PublicBallotSuccess } from '@/pages/ballot/PublicBallotSuccess';
import { ElectionsList } from '@/pages/voter/ElectionsList';
import { Ballot } from '@/pages/voter/Ballot';

// Home
import { Home } from '@/pages/Home';

// EC Routes
import { ECDashboard } from '@/pages/ec/Dashboard';
import { CreateElection } from '@/pages/ec/CreateElection';
import { ManageElection } from '@/pages/ec/ManageElection';
import { ManagePosition } from '@/pages/ec/ManagePosition';
import { ElectionResults } from '@/pages/ec/ElectionResults';
import { PublishElection } from '@/pages/ec/PublishElection';

// Layout
import { Layout } from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* ======================= */}
            {/* Public Ballot Routes    */}
            {/* ======================= */}

            <Route element={<Layout />}>
              {/* Entry point - voter enters email */}
              <Route path="/ballot/:electionId" element={<PublicBallotEntry />} />

              {/* Actual voting interface */}
              <Route path="/public-ballot/:electionId" element={<PublicBallot />} />

              {/* Success page */}
              <Route path="/public-ballot/:electionId/success" element={<PublicBallotSuccess />} />

              {/* Public results for voters */}
              <Route path="/public-results/:electionId" element={<ElectionResults />} />
            </Route>

            {/* ======================= */}
            {/* EC Admin Routes        */}
            {/* ======================= */}

            {/* EC Login */}
            <Route path="/ec/login" element={<SignIn />} />

            {/* EC Sign Up */}
            <Route path="/ec/signup" element={<ECSignUp />} />

            {/* Protected EC Routes */}
            <Route
              element={
                <ProtectedRouteWithRole role="ec_admin">
                  <Layout />
                </ProtectedRouteWithRole>
              }
            >
              <Route path="/ec" element={<ECDashboard />} />
              <Route path="/ec/elections/new" element={<CreateElection />} />
              <Route path="/ec/elections/:electionId" element={<ManageElection />} />
              <Route
                path="/ec/elections/:electionId/positions/:positionId"
                element={<ManagePosition />}
              />
              <Route
                path="/ec/elections/:electionId/results"
                element={<ElectionResults />}
              />
              <Route
                path="/ec/elections/:electionId/publish"
                element={<PublishElection />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/vote" element={<ElectionsList />} />
              <Route path="/vote/:electionId" element={<Ballot />} />
              <Route path="/results/:electionId" element={<ElectionResults />} />
            </Route>

            {/* ======================= */}
            {/* Default Routes         */}
            {/* ======================= */}

            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
