'use client';
import { useState, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import HomeView from '@/views/HomeView';
import AnalyzeView from '@/views/AnalyzeView';
import ProductsView from '@/views/ProductsView';
import TryOnView from '@/views/TryOnView';
import type { Product } from '@/lib/types';

export interface AppState {
  analysisScores: Record<string, { raw_score: number; ui_score: number }> | null;
  overallScore: number | null;
  skinAge: number | null;
  selfiePreview: string | null;
  selfieFile: File | null;
  selectedProduct: Product | null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState<AppState>({
    analysisScores: null,
    overallScore: null,
    skinAge: null,
    selfiePreview: null,
    selfieFile: null,
    selectedProduct: null,
  });

  const updateState = useCallback((partial: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...partial }));
  }, []);

  const navigateTo = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <main style={{ paddingBottom: 80 }}>
      {activeTab === 'home' && (
        <HomeView state={appState} onNavigate={navigateTo} />
      )}
      {activeTab === 'analyze' && (
        <AnalyzeView state={appState} updateState={updateState} onNavigate={navigateTo} />
      )}
      {activeTab === 'products' && (
        <ProductsView state={appState} onNavigate={navigateTo} updateState={updateState} />
      )}
      {activeTab === 'tryon' && (
        <TryOnView state={appState} updateState={updateState} onNavigate={navigateTo} />
      )}
      <BottomNav active={activeTab} onNavigate={navigateTo} />
    </main>
  );
}
