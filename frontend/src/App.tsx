import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResultsPage from './components/ResultsPage';
import LoadingScreen from './components/LoadingScreen';
import ChatBubble from './components/ChatBubble';
import UploadView from './pages/UploadPage';
import Layout from './components/Layout';
import type { AnalysisResponse } from './lib/types';
import type { ChartMetadata } from './lib/types';
import { fetchVisualizations } from './lib/api';

type AppState = 'upload' | 'loading' | 'results';
type LoadPhase = 'uploading' | 'analyzing' | 'done';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [loadPhase, setLoadPhase] = useState<LoadPhase>('uploading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [charts, setCharts] = useState<ChartMetadata[]>([]);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);

  async function handleStart(sid: string, phase: LoadPhase) {
    setSessionId(sid);
    setLoadPhase(phase);
    setAppState('loading');
  }

  async function handleAnalysisDone(sid: string, result: AnalysisResponse) {
    setAnalysis(result);
    setLoadPhase('done');

    try {
      const vizData = await fetchVisualizations(sid);
      setCharts(vizData.charts ?? []);
    } catch {
      setCharts([]);
    }

    setTimeout(() => setAppState('results'), 800);
  }

  function handleReset() {
    setAppState('upload');
    setLoadPhase('uploading');
    setSessionId(null);
    setAnalysis(null);
    setCharts([]);
    setChatPrompt(null);
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            appState === 'upload' ? (
              <UploadView
                onPhaseChange={handleStart}
                onComplete={handleAnalysisDone}
              />
            ) : appState === 'loading' ? (
              <LoadingScreen phase={loadPhase} />
            ) : analysis && sessionId ? (
              <>
                <ResultsPage
                  analysis={analysis}
                  charts={charts}
                  sessionId={sessionId}
                  onReset={handleReset}
                  onAskAI={(prompt) => setChatPrompt(prompt)}
                />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />
          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Show Chat Assistant ONLY after analysis */}
        {analysis && charts && (
          <ChatBubble
            sessionId={sessionId || 'default-session'}
            pendingPrompt={chatPrompt}
            onPendingPromptConsumed={() => setChatPrompt(null)}
          />
        )}
      </Layout>
    </Router>
  );
}
