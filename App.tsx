
import React, { useState, useCallback } from 'react';
import { ProductData, ProcessedProduct } from './types';
import { generateProductData } from './services/geminiService';
import SourcingView from './components/SourcingView';
import SanitizationView from './components/SanitizationView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sourcing' | 'sanitization'>('sourcing');

  // State for Sourcing feature
  const [inputUrl, setInputUrl] = useState<string>('');
  const [company, setCompany] = useState<'GAOTek' | 'GAORFID'>('GAOTek');
  const [processedProducts, setProcessedProducts] = useState<ProcessedProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputUrl.trim()) {
      setError('Please paste a product URL into the input field.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, sources } = await generateProductData(inputUrl, company);
      const newProduct: ProcessedProduct = {
        id: crypto.randomUUID(),
        data,
        sources,
      };
      setProcessedProducts(prev => [newProduct, ...prev]);
      setInputUrl('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputUrl, company]);
  
  const handleUpdateProduct = (id: string, updatedData: ProductData) => {
    setProcessedProducts(prev => 
      prev.map(p => p.id === id ? { ...p, data: updatedData } : p)
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProcessedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setProcessedProducts([]);
  };
  
  const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 focus:outline-none ${
        isActive 
          ? 'bg-brand-surface text-brand-text-primary shadow-inner-strong' 
          : 'bg-brand-background text-brand-text-secondary hover:bg-brand-surface/50'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
          .shadow-inner-strong { box-shadow: inset 0 -3px 0 0 #2684ff; }
        `}
      </style>
      
      <header className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          GAO Sourcing & Sanitization
        </h1>
        <p className="text-lg text-brand-text-secondary mt-2">
          Your intelligent assistant for product data processing and sanitization.
        </p>
      </header>

      <div className="w-full max-w-4xl mb-8">
        <div className="flex border-b border-brand-surface/50">
          <TabButton isActive={activeTab === 'sourcing'} onClick={() => setActiveTab('sourcing')}>
            AI Sourcing
          </TabButton>
          <TabButton isActive={activeTab === 'sanitization'} onClick={() => setActiveTab('sanitization')}>
            Sanitization
          </TabButton>
        </div>
      </div>
      
      <main className="w-full max-w-4xl flex-grow">
        {activeTab === 'sourcing' && (
          <SourcingView
            inputUrl={inputUrl}
            setInputUrl={setInputUrl}
            company={company}
            setCompany={setCompany}
            isLoading={isLoading}
            error={error}
            handleGenerate={handleGenerate}
            processedProducts={processedProducts}
            handleUpdateProduct={handleUpdateProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleClearAll={handleClearAll}
          />
        )}
        {activeTab === 'sanitization' && (
          <SanitizationView />
        )}
      </main>

      <footer className="w-full max-w-4xl text-center mt-12 text-brand-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} GAO AI Tools. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
