import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ClassCalendar } from './components/ClassCalendar';
import { SlidesSection } from './components/SlidesSection';
import { QASection } from './components/QASection';
import { AdminPanel } from './components/AdminPanel';

function AppContent() {
  const { isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <ClassCalendar key={`calendar-${refreshKey}`} />
        <QASection key={`qa-${refreshKey}`} />
        <SlidesSection key={`slides-${refreshKey}`} />
        {isAdmin && <AdminPanel onUpdate={handleDataUpdate} />}
      </main>

      <footer className="bg-gray-800 text-white py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm sm:text-base">Halaqa Hub - Connecting Brothers & Sisters Through Knowledge</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
