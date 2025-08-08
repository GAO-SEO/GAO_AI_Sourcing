import React, { useState, useEffect } from 'react';
import { SanitizedData } from '../types';
import { PencilIcon, CheckIcon, DownloadIcon, TrashIcon } from './Icons';

interface SanitizedDataDisplayProps {
  sanitizedData: SanitizedData;
  onUpdate: (data: SanitizedData) => void;
  onDownload: () => void;
  onStartOver: () => void;
}

const SanitizedDataDisplay: React.FC<SanitizedDataDisplayProps> = ({ sanitizedData, onUpdate, onDownload, onStartOver }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SanitizedData>(sanitizedData);

  useEffect(() => {
    setEditedData(sanitizedData);
  }, [sanitizedData]);

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
      setEditedData(sanitizedData); // Reset changes
      setIsEditing(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleListItemChange = <T extends 'features' | 'specifications'>(listName: T, index: number, value: any) => {
    const newList = [...(editedData[listName] as any[])];
    newList[index] = value;
    setEditedData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleAddListItem = (listName: 'features' | 'specifications') => {
    let newItem;
    if (listName === 'features') newItem = '';
    else if (listName === 'specifications') newItem = { key: '', value: '' };
    else return;
    setEditedData(prev => ({ ...prev, [listName]: [...(editedData[listName] as any[]), newItem] }));
  };

  const handleDeleteListItem = (listName: 'features' | 'specifications', index: number) => {
    const newList = (editedData[listName] as any[]).filter((_, i) => i !== index);
    setEditedData(prev => ({ ...prev, [listName]: newList }));
  };

  const inputClass = "w-full bg-brand-background border border-brand-secondary text-brand-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200";
  const textareaClass = `${inputClass} min-h-[120px] resize-y`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex-1">
             <h2 className="text-xl font-semibold text-brand-accent mb-2">Sanitization Complete</h2>
             {isEditing ? (
              <div className="space-y-2">
                 <textarea name="productName" value={editedData.productName} onChange={handleInputChange} className={`${textareaClass} text-xl font-bold`} placeholder="Product Name" />
                 <input type="text" name="productId" value={editedData.productId} onChange={handleInputChange} className={inputClass} placeholder="Product ID" />
                 <input type="text" name="productLink" value={editedData.productLink} onChange={handleInputChange} className={inputClass} placeholder="Product Link" />
              </div>
             ) : (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary mt-1">{editedData.productName}</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">{editedData.productId}</p>
                    {editedData.productLink && editedData.productLink !== 'N/A' && (
                        <a href={editedData.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{editedData.productLink}</a>
                    )}
                </>
             )}
        </div>
        <div className="flex flex-col space-y-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-green-500" aria-label="Save changes">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Save
              </button>
              <button onClick={handleCancel} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-gray-500" aria-label="Cancel editing">
                  Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-blue-500" aria-label='Edit data'>
                <PencilIcon className="w-5 h-5 mr-2" />
                Edit
              </button>
              <button onClick={onDownload} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-green-500">
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download
              </button>
              <button onClick={onStartOver} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-red-500">
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Start Over
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {isEditing || editedData.overview ? (
          <div>
            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Overview</h2>
            {isEditing ? (
              <textarea name="overview" value={editedData.overview} onChange={handleInputChange} className={textareaClass} placeholder="Product Overview" />
            ) : (
              <p className="text-brand-text-secondary leading-relaxed whitespace-pre-wrap">{editedData.overview}</p>
            )}
          </div>
        ) : null}
        
        {isEditing || (editedData.features && editedData.features.length > 0) ? (
          <div>
            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Key Features</h2>
            <ul className={`space-y-3 ${!isEditing ? 'list-disc list-inside' : ''} text-brand-text-secondary`}>
              {editedData.features.map((feature, index) => (
                <li key={index} className={isEditing ? 'flex items-center gap-2' : ''}>
                  {isEditing ? (
                    <>
                      <input type="text" value={feature} onChange={(e) => handleListItemChange('features', index, e.target.value)} className={inputClass} placeholder="Feature description" />
                      <button onClick={() => handleDeleteListItem('features', index)} className="p-2 text-brand-text-secondary hover:text-red-400 transition-colors" aria-label="Delete feature"><TrashIcon className="w-5 h-5" /></button>
                    </>
                  ) : (
                    feature
                  )}
                </li>
              ))}
              {isEditing && <button onClick={() => handleAddListItem('features')} className="text-sm text-brand-accent hover:text-blue-400 font-semibold">+ Add Feature</button>}
            </ul>
          </div>
        ) : null}

        {isEditing || (editedData.specifications && editedData.specifications.length > 0) ? (
          <div>
            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Technical Specifications</h2>
            <div className={`grid grid-cols-1 gap-4 ${!isEditing ? 'md:grid-cols-2' : 'space-y-1'}`}>
              {editedData.specifications.map((spec, index) => (
                 isEditing ? (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={spec.key} onChange={(e) => handleListItemChange('specifications', index, { ...spec, key: e.target.value })} className={inputClass} placeholder="Key (e.g., Weight)" />
                    <input type="text" value={spec.value} onChange={(e) => handleListItemChange('specifications', index, { ...spec, value: e.target.value })} className={inputClass} placeholder="Value (e.g., 2.2 lb (1kg))" />
                    <button onClick={() => handleDeleteListItem('specifications', index)} className="p-2 text-brand-text-secondary hover:text-red-400 transition-colors" aria-label="Delete specification"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                 ) : (
                    <div key={index} className="bg-brand-background/50 p-3 rounded-md">
                        <span className="font-semibold text-brand-text-primary">{spec.key}: </span>
                        <span className="text-brand-text-secondary">{spec.value}</span>
                    </div>
                 )
              ))}
              {isEditing && <button onClick={() => handleAddListItem('specifications')} className="text-sm text-brand-accent hover:text-blue-400 font-semibold mt-2">+ Add Specification</button>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SanitizedDataDisplay;
