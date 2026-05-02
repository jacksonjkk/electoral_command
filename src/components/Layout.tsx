import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Activity, Home } from 'lucide-react';
import clsx from 'clsx';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/ec/login');
  };

  const isEcRoute = location.pathname.startsWith('/ec');
  const isVoterRoute = location.pathname.startsWith('/vote');
  const isPublicBallot = location.pathname.includes('/ballot/') || location.pathname.includes('/public-ballot/') || location.pathname.includes('/public-results/');

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Decorations */}
      <div className="fixed top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary-500/5 rounded-full blur-[80px] md:blur-[120px] -mr-48 md:-mr-96 -mt-48 md:-mt-96 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-accent-cyan/5 rounded-full blur-[60px] md:blur-[100px] -ml-24 md:-ml-48 -mb-24 md:-mb-48 pointer-events-none" />

      {/* Header - Desktop & Tablet */}
      <header className="fixed top-0 left-0 w-full z-[100] px-4 md:px-6 py-2 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card !p-2 md:!p-4 !rounded-[24px] md:!rounded-[32px] flex items-center justify-between border-white/40 shadow-2xl">
            <div className="flex items-center gap-4 md:gap-10">
              <div
                className={clsx(
                  "flex items-center gap-2 md:gap-3 group",
                  !isPublicBallot && "cursor-pointer"
                )}
                onClick={() => !isPublicBallot && navigate('/')}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-gray-100">
                  <img src="/logo.png" alt="Electoral Command Logo" className="w-full h-full object-cover" />
                </div>
                <div className="block">
                  <p className="text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] leading-none mb-0.5 md:mb-1">Electoral</p>
                  <p className="text-sm md:text-lg font-black text-gray-900 tracking-tighter leading-none uppercase">Command</p>
                </div>
              </div>

            {/* Desktop Nav - Only for EC Admins on Admin Routes */}
            {user?.user_metadata?.role === 'ec_admin' && isEcRoute && !isPublicBallot && (
              <nav className="hidden md:flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl border border-gray-200/50">
                <button
                  onClick={() => navigate('/ec')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${isEcRoute && !location.search.includes('tab=past')
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Dashboard
                </button>
              </nav>
            )}
          </div>

          {/* User Session - ONLY for EC Admins on Non-Public Routes */}
          {user?.user_metadata?.role === 'ec_admin' && !isPublicBallot && (
            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Admin</p>
                <p className="text-xs font-bold text-gray-900">{user?.email?.split('@')[0]}</p>
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

              <button
                onClick={handleSignOut}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-gray-100 text-gray-500 hover:bg-danger-500 hover:text-white transition-all group"
                title="Terminate Session"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-28 md:pt-32 pb-24 md:pb-12 relative z-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav - Only show on app routes, not public ballot */}
      {!isPublicBallot && (
        <nav className="md:hidden fixed bottom-4 left-6 right-6 z-[9999] pointer-events-auto">
          <div className="glass-card !p-1.5 !rounded-[24px] flex items-center justify-around border-white/40 shadow-2xl pointer-events-auto">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`p-3 rounded-xl transition-all active:scale-90 cursor-pointer pointer-events-auto ${location.pathname === '/' ? 'bg-primary-600 text-white shadow-neon-primary' : 'text-gray-400 hover:text-gray-900'
                }`}
            >
              <Home className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => navigate(user?.user_metadata?.role === 'ec_admin' ? '/ec' : '/vote')}
              className={`p-3 rounded-xl transition-all active:scale-90 cursor-pointer pointer-events-auto ${isEcRoute && !location.search.includes('tab=past') ? 'bg-primary-600 text-white shadow-neon-primary' : 'text-gray-400 hover:text-gray-900'
                }`}
            >
              <Activity className="w-6 h-6" />
            </button>
          </div>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 md:py-16 bg-white/40 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 md:mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">Electoral Command</span>
              </div>
              <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
                A secure and fast voting system for institutional elections.
              </p>
            </div>

            <div className="hidden md:block">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] mb-6">Framework</p>
              <ul className="space-y-4">
                <li className="text-sm font-bold text-gray-500 hover:text-primary-600 cursor-pointer transition-colors">Security Info</li>
                <li className="text-sm font-bold text-gray-500 hover:text-primary-600 cursor-pointer transition-colors">Security Audit</li>
              </ul>
            </div>

            <div className="hidden md:block">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] mb-6">Links</p>
              <ul className="space-y-4">
                <li className="text-sm font-bold text-gray-500 hover:text-primary-600 cursor-pointer transition-colors">Support</li>
                <li className="text-sm font-bold text-gray-500 hover:text-primary-600 cursor-pointer transition-colors">FAQ</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 pt-10 border-t border-gray-100">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center md:text-left">
                Developed by <span className="text-primary-600">Axon LaBs</span> • © {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex gap-4 md:gap-8">
              <span className="text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest">Version 2.4.0</span>
              <span className="text-[8px] md:text-[10px] font-black text-success-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
