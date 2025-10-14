import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceCategories from './components/ServiceCategories';
import HowItWorks from './components/HowItWorks';
import FeaturedTradespeople from './components/FeaturedTradespeople';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SubmitProject from './components/SubmitProject';
import JobLeads from './components/JobLeads';
import BrowseExperts from './components/BrowseExperts';
import HomeownerProfile from './components/HomeownerProfile';
import TradespersonProfile from './components/TradespersonProfile';
import Membership from './components/Membership';
import QuoteRequest from './components/QuoteRequest';
import BoostPage from './components/BoostPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import ProfileMockup from './components/ProfileMockup';
import TermsOfUse from './components/TermsOfUse';
import CookiePolicy from './components/CookiePolicy';

const AppContent = () => {
  const { state } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'profile':
        return state.currentUser?.type === 'homeowner' ? <HomeownerProfile /> : <TradespersonProfile />;
      case 'submit-project':
        return <SubmitProject />;
      case 'job-leads':
        return <JobLeads />;
      case 'browse-experts':
        return <BrowseExperts />;
      case 'membership':
        return <Membership />;
      case 'quote-requests':
        return <QuoteRequest />;
      case 'boost':
        return <BoostPage />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'profile-mockup':
        return <ProfileMockup />;
      case 'terms-of-use':
        return <TermsOfUse />;
      case 'cookie-policy':
        return <CookiePolicy />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <ServiceCategories />
            <HowItWorks />
            <FeaturedTradespeople />
            <Reviews />
          </>
        );
    }
  };

  return (
  
    <div className="min-h-screen bg-white">
      <Header />
      {renderCurrentView()}
      {state.currentView === 'home' && <Footer />}
      <AuthModal />
    </div>
  );
};
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;