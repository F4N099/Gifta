import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ListsPage from './pages/ListsPage';
import ListViewPage from './pages/ListViewPage';
import SharePage from './pages/SharePage';
import SharedListPage from './pages/SharedListPage';
import PeoplePage from './pages/PeoplePage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SavedGiftsProvider } from './contexts/SavedGiftsContext';
import { SurpriseGiftProvider } from './contexts/SurpriseGiftContext';
import { GenerationLimitProvider } from './contexts/GenerationLimitContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SavedGiftsProvider>
            <SurpriseGiftProvider>
              <GenerationLimitProvider>
                <div className="min-h-screen flex flex-col">
                  <Toaster position="top-center" richColors />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/lists" element={<ListsPage />} />
                    <Route path="/lists/:listId" element={<ListViewPage />} />
                    <Route path="/share/:token" element={<SharePage />} />
                    <Route path="/share/list/:token" element={<SharedListPage />} />
                    <Route path="/people" element={<PeoplePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/support" element={<SupportPage />} />
                  </Routes>
                  <Footer />
                </div>
              </GenerationLimitProvider>
            </SurpriseGiftProvider>
          </SavedGiftsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;