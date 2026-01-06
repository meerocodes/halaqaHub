import { useState, useEffect } from 'react';
import { LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, isAdmin, signIn, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg relative">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {user && isAdmin && (
          <button
            onClick={() => signOut()}
            className="absolute top-3 left-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}

        {!(user && isAdmin) && (
          <button
            onClick={() => setShowLogin(true)}
            className="absolute top-3 right-4 text-xs bg-white/20 text-white px-3 py-.5 rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center gap-1"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/halaqahublogo.png"
            alt="Halaqa Hub"
            className="h-20 sm:h-22 md:h-24 w-auto"
          />
          <p className="text-emerald-100 text-xs sm:text-sm md:text-base">Learning Together, Growing Together</p>
        </div>
      </div>

      {showLogin && !user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
