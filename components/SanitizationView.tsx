import React, { useState, useCallback } from 'react';
import { SanitizedData } from '../types';
import { sanitizeDocument } from '../services/sanitizationService';
import { generateSanitizedDocxBlob } from '../services/documentService';
import Loader from './Loader';
import { AlertTriangleIcon, UploadCloudIcon, FileTextIcon } from './Icons';
import SanitizedDataDisplay from './SanitizedDataDisplay';

const SanitizationView: React.FC = () => {
  const [company, setCompany] = useState<'GAOTek' | 'GAORFID'>('GAOTek');
  const [file, setFile] = useState<File | null>(null);
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [productLink, setProductLink] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SanitizedData | null>(null);

  const resetState = () => {
    setFile(null);
    setProductName('');
    setSku('');
    setProductLink('');
    setIsLoading(false);
    setError(null);
    setResult(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSanitize = useCallback(async () => {
    if (!file) {
      setError('Please upload a document to sanitize.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const sanitizedData = await sanitizeDocument(file, company, productName, sku, productLink);
      setResult(sanitizedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sanitization.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [file, company, productName, sku, productLink]);

  const handleDownload = async () => {
    if (!result) return;
    const blob = await generateSanitizedDocxBlob(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.productId}_${result.productName.replace(/ /g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleUpdateResult = (updatedData: SanitizedData) => {
    setResult(updatedData);
  };

  const inputClass = "w-full bg-brand-background border border-brand-secondary text-brand-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200";
  
  if (isLoading) {
    return (
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 flex justify-center items-center animate-fade-in">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-brand-text-secondary">Sanitizing document, please wait...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <SanitizedDataDisplay
        sanitizedData={result}
        onUpdate={handleUpdateResult}
        onDownload={handleDownload}
        onStartOver={resetState}
      />
    );
  }

  return (
    <div className="animate-fade-in">
        <div className="bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 mb-8">
            <p className="text-center text-brand-text-secondary">
                Upload a competitor's product sheet (PDF, DOCX, TXT, JPG, PNG) to sanitize and re-brand it.
            </p>
            <fieldset className="flex items-center justify-center gap-x-8">
                <legend className="sr-only">Select a company</legend>
                 <div className="flex items-center cursor-pointer" onClick={() => setCompany('GAOTek')}>
                    <input id="gaotek-s" value="GAOTek" name="company-selection-s" type="radio" checked={company === 'GAOTek'} onChange={() => setCompany('GAOTek')} className="h-4 w-4 border-brand-secondary text-brand-accent bg-brand-background focus:ring-brand-accent focus:ring-offset-brand-surface" />
                    <label htmlFor="gaotek-s" className="ml-3 block text-sm font-medium leading-6 text-brand-text-primary cursor-pointer">GAOTek</label>
                </div>
                <div className="flex items-center cursor-pointer" onClick={() => setCompany('GAORFID')}>
                    <input id="gaorfid-s" value="GAORFID" name="company-selection-s" type="radio" checked={company === 'GAORFID'} onChange={() => setCompany('GAORFID')} className="h-4 w-4 border-brand-secondary text-brand-accent bg-brand-background focus:ring-brand-accent focus:ring-offset-brand-surface" />
                    <label htmlFor="gaorfid-s" className="ml-3 block text-sm font-medium leading-6 text-brand-text-primary cursor-pointer">GAORFID</label>
                </div>
            </fieldset>

            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-brand-text-primary mb-2">Upload Document</label>
                <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-brand-secondary px-6 py-10 hover:border-brand-accent transition-colors">
                    <div className="text-center">
                        {file ? (
                          <>
                            <FileTextIcon className="mx-auto h-12 w-12 text-brand-text-secondary" />
                            <p className="mt-4 text-sm text-brand-text-primary">{file.name}</p>
                            <p className="text-xs text-brand-text-secondary">{(file.size / 1024).toFixed(2)} KB</p>
                            <button onClick={() => setFile(null)} className="mt-2 text-xs text-red-400 hover:text-red-300">Change file</button>
                          </>
                        ) : (
                          <>
                            <UploadCloudIcon className="mx-auto h-12 w-12 text-brand-text-secondary" />
                            <div className="mt-4 flex text-sm leading-6 text-brand-text-secondary">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-accent focus-within:ring-offset-2 focus-within:ring-offset-brand-surface hover:text-blue-400">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-brand-text-secondary">PDF, DOCX, TXT, PNG, JPG up to 10MB</p>
                           </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-brand-text-primary">Optional - Add New Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="productName" className="sr-only">Product Name</label>
                        <input id="productName" name="productName" type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="New Product Name" className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="sku" className="sr-only">SKU / Product ID</label>
                        <input id="sku" name="sku" type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="New SKU / Product ID" className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="productLink" className="sr-only">Product Link</label>
                        <input id="productLink" name="productLink" type="text" value={productLink} onChange={e => setProductLink(e.target.value)} placeholder="New Product Link" className={inputClass} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSanitize} disabled={!file} className="w-full sm:w-auto flex justify-center items-center bg-brand-primary hover:bg-brand-accent disabled:bg-brand-secondary disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-all duration-200">
                    Sanitize Document
                </button>
            </div>
             {error && (
                <div className="mt-4 flex items-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md animate-fade-in" role="alert">
                    <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default SanitizationView;
