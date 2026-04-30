import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface ProtectedRouteWithRoleProps {
  children: React.ReactNode;
  role?: 'voter' | 'ec_admin';
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/ec/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function ProtectedRouteWithRole({
  children,
  role,
}: ProtectedRouteWithRoleProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/ec/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (role && user?.user_metadata?.role !== role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface RequireEmailVerificationProps {
  children: React.ReactNode;
}

export function RequireEmailVerification({
  children,
}: RequireEmailVerificationProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.email_confirmed_at) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address before you can access the voting
            system. Check your inbox for a verification link.
          </p>
          <p className="text-sm text-gray-500">
            Email: <strong>{user?.email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
