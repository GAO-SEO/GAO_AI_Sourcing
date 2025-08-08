
import React, { useState, useCallback } from 'react';
import { ProductData, ProcessedProduct } from './types';
import { generateProductData } from './services/geminiService';
import { generateCombinedDocxBlob } from './services/documentService';
import ProductDataDisplay from './components/ProductDataDisplay';
import Loader from './components/Loader';
import { AlertTriangleIcon, DownloadIcon, TrashIcon } from './components/Icons';

const App: React.FC = () => {
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

  const handleDownloadAll = useCallback(async () => {
    if (processedProducts.length === 0) return;
    
    const blob = await generateCombinedDocxBlob(processedProducts);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GAO_Sourcing_Session_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [processedProducts]);

  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}
      </style>
      
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          GAO AI Sourcing
        </h1>
        <p className="text-lg text-brand-text-secondary mt-2">
          Generate and combine multiple product data sheets in a single session.
        </p>
      </header>
      
      <main className="w-full max-w-4xl flex-grow">
        <div className="bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 mb-8">
          <fieldset className="flex items-center justify-center gap-x-8">
            <legend className="sr-only">Select a company</legend>
            <div className="flex items-center cursor-pointer" onClick={() => setCompany('GAOTek')}>
              <input id="gaotek" value="GAOTek" name="company-selection" type="radio" checked={company === 'GAOTek'} onChange={() => setCompany('GAOTek')} className="h-4 w-4 border-brand-secondary text-brand-accent bg-brand-background focus:ring-brand-accent focus:ring-offset-brand-surface" />
              <label htmlFor="gaotek" className="ml-3 block text-sm font-medium leading-6 text-brand-text-primary cursor-pointer">GAOTek</label>
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => setCompany('GAORFID')}>
              <input id="gaorfid" value="GAORFID" name="company-selection" type="radio" checked={company === 'GAORFID'} onChange={() => setCompany('GAORFID')} className="h-4 w-4 border-brand-secondary text-brand-accent bg-brand-background focus:ring-brand-accent focus:ring-offset-brand-surface" />
              <label htmlFor="gaorfid" className="ml-3 block text-sm font-medium leading-6 text-brand-text-primary cursor-pointer">GAORFID</label>
            </div>
          </fieldset>

          <div className="flex flex-col sm:flex-row gap-4">
            <label htmlFor="product-url-input" className="sr-only">Product URL Input</label>
            <input id="product-url-input" type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="Paste product URL and click Generate..." className="flex-grow bg-brand-background border border-brand-secondary text-brand-text-primary rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200" disabled={isLoading} aria-label="Product URL Input" />
            <button onClick={handleGenerate} disabled={isLoading || !inputUrl.trim()} className="w-full sm:w-auto flex justify-center items-center bg-brand-primary hover:bg-brand-accent disabled:bg-brand-secondary disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-all duration-200">
              {isLoading ? <Loader /> : 'Generate'}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex items-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md animate-fade-in" role="alert">
                <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                <span>{error}</span>
            </div>
          )}
        </div>

        {processedProducts.length > 0 && (
          <div className="flex justify-between items-center mb-6 animate-fade-in">
             <h2 className="text-2xl font-semibold text-white">Processed Products ({processedProducts.length})</h2>
             <div className="flex gap-2">
                <button onClick={handleDownloadAll} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background focus:ring-green-500">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download All
                </button>
                <button onClick={handleClearAll} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background focus:ring-red-500">
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Clear All
                </button>
             </div>
          </div>
        )}

        <div className="space-y-8">
          {processedProducts.map(product => (
            <ProductDataDisplay 
              key={product.id} 
              product={product} 
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
        
      </main>

      <footer className="w-full max-w-4xl text-center mt-12 text-brand-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} AI Sourcing. Powered by GAO.</p>
      </footer>
    </div>
  );
};

export default App;
