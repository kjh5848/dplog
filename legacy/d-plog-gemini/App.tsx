import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import LandingPageAlt from './components/LandingPageAlt';
import StepDuration from './components/app/StepDuration';
import StepRegion from './components/app/StepRegion';
import StepAge from './components/app/StepAge';
import AnalysisResult from './components/app/AnalysisResult';
import PlanChat from './components/app/PlanChat';

export type ViewState =
  | 'LANDING'
  | 'LANDING_ALT'
  | 'STEP_DURATION'
  | 'STEP_REGION'
  | 'STEP_AGE'
  | 'RESULT'
  | 'CHAT';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('variant') === 'alt') {
      setView('LANDING_ALT');
    }
  }, []);

  const handleStart = () => setView('STEP_DURATION');
  const goBack = () => setView('LANDING'); // Or previous step logic

  // Simple Router
  const renderView = () => {
    switch (view) {
      case 'LANDING':
        return <LandingPage onStart={handleStart} />;
      case 'LANDING_ALT':
        return <LandingPageAlt onStart={handleStart} />;
      case 'STEP_DURATION':
        return <StepDuration onNext={() => setView('STEP_REGION')} onBack={() => setView('LANDING')} />;
      case 'STEP_REGION':
        return <StepRegion onNext={() => setView('STEP_AGE')} onBack={() => setView('STEP_DURATION')} />;
      case 'STEP_AGE':
        return <StepAge onNext={() => setView('RESULT')} onBack={() => setView('STEP_REGION')} />;
      case 'RESULT':
        return <AnalysisResult onNext={() => setView('CHAT')} onBack={() => setView('STEP_AGE')} />;
      case 'CHAT':
        return <PlanChat onExit={() => setView('LANDING')} />;
      default:
        return <LandingPage onStart={handleStart} />;
    }
  };

  return (
    <>
      {renderView()}
    </>
  );
};

export default App;
