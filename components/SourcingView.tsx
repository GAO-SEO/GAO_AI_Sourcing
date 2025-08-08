
import React from 'react';
import { ProcessedProduct, ProductData } from '../types';
import { generateCombinedDocxBlob } from '../services/documentService';
import ProductDataDisplay from './ProductDataDisplay';
import Loader from './Loader';
import { AlertTriangleIcon, DownloadIcon, TrashIcon } from './Icons';

interface SourcingViewProps {
  inputUrl: string;
  setInputUrl: (url: string) => void;
  company: 'GAOTek' | 'GAORFID';
  setCompany: (company: 'GAOTek' | 'GAORFID') => void;
  isLoading: boolean;
  error: string | null;
  handleGenerate: () => void;
  processedProducts: ProcessedProduct[];
  handleUpdateProduct: (id: string, data: ProductData) => void;
  handleDeleteProduct: (id: string) => void;
  handleClearAll: () => void;
}

const SourcingView: React.FC<SourcingViewProps> = ({
  inputUrl,
  setInputUrl,
  company,
  setCompany,
  isLoading,
  error,
  handleGenerate,
  processedProducts,
  handleUpdateProduct,
  handleDeleteProduct,
  handleClearAll
}) => {
  const handleDownloadAll = React.useCallback(async () => {
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
    <div className="animate-fade-in">
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 mb-8">
        <p className="text-center text-brand-text-secondary">
          Paste a product URL to generate a standardized data sheet.
        </p>
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
    </div>
  );
};

export default SourcingView;
