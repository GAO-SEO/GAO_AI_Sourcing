
import React, { useState, useCallback, useEffect } from 'react';
import { ProductData, ProcessedProduct } from '../types';
import { ClipboardIcon, CheckIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from './Icons';

interface ProductDataDisplayProps {
  product: ProcessedProduct;
  onUpdate: (id: string, data: ProductData) => void;
  onDelete: (id: string) => void;
}

const formatDataForTxt = (data: ProductData): string => {
  let content = `GAOTEK PRODUCT DATA SHEET\n`;
  content += `=========================\n\n`;
  content += `Product ID: ${data.productId}\n`;
  content += `Product Name: ${data.productName}\n`;
  content += `Category: ${data.category}\n`;
  if (data.productLink) {
    content += `Product Link: ${data.productLink}\n`;
  }
  content += `\n`;

  if (data.prices && data.prices.length > 0) {
    content += `--- PRICING ---\n`;
    data.prices.forEach(tier => {
      content += `${tier.quantity}: ${tier.price}\n`;
    });
    content += `\n`;
  }
  
  if (data.overview) {
    content += `--- OVERVIEW ---\n`;
    content += `${data.overview}\n\n`;
  }
  
  if (data.metaDescription) {
    content += `--- META DESCRIPTION ---\n`;
    content += `${data.metaDescription}\n\n`;
  }

  if (data.features && data.features.length > 0) {
    content += `--- KEY FEATURES ---\n`;
    data.features.forEach(feature => {
      content += `- ${feature}\n`;
    });
    content += `\n`;
  }

  if (data.specifications && data.specifications.length > 0) {
    content += `--- TECHNICAL SPECIFICATIONS ---\n`;
    data.specifications.forEach(spec => {
      content += `${spec.key}: ${spec.value}\n`;
    });
    content += `\n`;
  }
  
  return content;
};

const ProductDataDisplay: React.FC<ProductDataDisplayProps> = ({ product, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProductData>(product.data);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedData(product.data);
  }, [product.data]);

  const handleSave = () => {
    onUpdate(product.id, editedData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
      setEditedData(product.data); // Reset changes
      setIsEditing(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleListItemChange = <T extends 'features' | 'specifications' | 'prices'>(listName: T, index: number, value: any) => {
    const newList = [...(editedData[listName] as any[])];
    newList[index] = value;
    setEditedData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleAddListItem = (listName: 'features' | 'specifications' | 'prices') => {
    let newItem;
    if (listName === 'features') newItem = '';
    else if (listName === 'specifications') newItem = { key: '', value: '' };
    else newItem = { quantity: '', price: '' };
    setEditedData(prev => ({ ...prev, [listName]: [...(editedData[listName] as any[]), newItem] }));
  };

  const handleDeleteListItem = (listName: 'features' | 'specifications' | 'prices', index: number) => {
    const newList = (editedData[listName] as any[]).filter((_, i) => i !== index);
    setEditedData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleAddCustomSection = () => {
    const newSection = { id: crypto.randomUUID(), title: 'New Section', content: '' };
    setEditedData(prev => ({
        ...prev,
        customSections: [...(prev.customSections || []), newSection]
    }));
  };

  const handleDeleteCustomSection = (id: string) => {
    setEditedData(prev => ({
        ...prev,
        customSections: (prev.customSections || []).filter(section => section.id !== id)
    }));
  };

  const handleCustomSectionChange = (id: string, field: 'title' | 'content', value: string) => {
    setEditedData(prev => ({
        ...prev,
        customSections: (prev.customSections || []).map(section =>
            section.id === id ? { ...section, [field]: value } : section
        )
    }));
  };

  const handleCopyToClipboard = useCallback(() => {
    const textToCopy = formatDataForTxt(editedData);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [editedData]);

  const inputClass = "w-full bg-brand-background border border-brand-secondary text-brand-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200";
  const textareaClass = `${inputClass} min-h-[120px] resize-y`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input type="text" name="productId" value={editedData.productId} onChange={handleInputChange} className={inputClass} placeholder="Product ID" />
                <input type="text" name="category" value={editedData.category} onChange={handleInputChange} className={inputClass} placeholder="Category" />
              </div>
              <textarea name="productName" value={editedData.productName} onChange={handleInputChange} className={`${textareaClass} text-2xl sm:text-3xl font-bold`} placeholder="Product Name" />
              <input type="url" name="productLink" value={editedData.productLink || ''} onChange={handleInputChange} className={inputClass} placeholder="Product Link" />
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-text-secondary">
                {editedData.productId} • {editedData.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary mt-1">{editedData.productName}</h1>
              {editedData.productLink && (
                <div className="mt-2">
                  <a href={editedData.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all inline-flex items-center gap-1.5">
                    <span className="truncate">{editedData.productLink}</span>
                    <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-green-500" aria-label="Save changes">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Save
              </button>
              <button onClick={handleCancel} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-gray-500" aria-label="Cancel editing">
                  Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-blue-500" aria-label='Edit data'>
                <PencilIcon className="w-5 h-5 mr-2" />
                Edit
              </button>
              <button onClick={handleCopyToClipboard} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-accent hover:bg-blue-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-blue-500" aria-label={copied ? 'Copied to clipboard' : 'Copy data to clipboard'}>
                {copied ? <CheckIcon className="w-5 h-5 mr-2" /> : <ClipboardIcon className="w-5 h-5 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => onDelete(product.id)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-red-500" aria-label="Delete product">
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {isEditing || (editedData.prices && editedData.prices.length > 0) ? (
          <div>
            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Pricing</h2>
            <div className="space-y-3">
              {editedData.prices.map((tier, index) => (
                isEditing ? (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={tier.quantity} onChange={(e) => handleListItemChange('prices', index, { ...tier, quantity: e.target.value })} className={inputClass} placeholder="Quantity (e.g., 1-99)" />
                    <input type="text" value={tier.price} onChange={(e) => handleListItemChange('prices', index, { ...tier, price: e.target.value })} className={inputClass} placeholder="Price (e.g., $5.00)" />
                    <button onClick={() => handleDeleteListItem('prices', index)} className="p-2 text-brand-text-secondary hover:text-red-400 transition-colors" aria-label="Delete price tier"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div key={index} className="flex justify-between text-brand-text-secondary bg-brand-background/50 p-3 rounded-md">
                   <span>{tier.quantity}</span>
                   <span className="font-semibold text-brand-text-primary">{tier.price}</span>
                 </div>
                )
              ))}
              {isEditing && <button onClick={() => handleAddListItem('prices')} className="text-sm text-brand-accent hover:text-blue-400 font-semibold">+ Add Price Tier</button>}
            </div>
          </div>
        ) : null}
      
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
        
        {isEditing || editedData.metaDescription ? (
            <div>
                <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Meta Description</h2>
                {isEditing ? (
                    <textarea name="metaDescription" value={editedData.metaDescription} onChange={handleInputChange} className={textareaClass} placeholder="Meta Description" />
                ) : (
                    <p className="text-brand-text-secondary leading-relaxed">{editedData.metaDescription}</p>
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

        {/* CUSTOM SECTIONS */}
        {(editedData.customSections || []).map((section) => (
            <div key={section.id}>
                {isEditing ? (
                    <div className="space-y-2 p-4 border border-dashed border-brand-secondary rounded-lg relative mt-8">
                        <button 
                            onClick={() => handleDeleteCustomSection(section.id)} 
                            className="absolute top-2 right-2 p-2 text-brand-text-secondary hover:text-red-400 transition-colors" 
                            aria-label="Delete custom section"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        <label htmlFor={`custom-title-${section.id}`} className="block text-sm font-medium text-brand-text-primary">Custom Section Heading</label>
                        <input 
                            id={`custom-title-${section.id}`}
                            type="text" 
                            value={section.title} 
                            onChange={(e) => handleCustomSectionChange(section.id, 'title', e.target.value)} 
                            className={`${inputClass} text-lg font-semibold`} 
                            placeholder="Section Title" 
                        />
                         <label htmlFor={`custom-content-${section.id}`} className="block text-sm font-medium text-brand-text-primary pt-2">Custom Section Content</label>
                        <textarea 
                            id={`custom-content-${section.id}`}
                            value={section.content} 
                            onChange={(e) => handleCustomSectionChange(section.id, 'content', e.target.value)} 
                            className={textareaClass} 
                            placeholder="Section content. You can create lists by starting lines with a hyphen (-)." 
                        />
                    </div>
                ) : (
                    section.title && section.content && (
                        <div>
                            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">{section.title}</h2>
                            <p className="text-brand-text-secondary leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        </div>
                    )
                )}
            </div>
        ))}
        
        {isEditing && (
            <div className="mt-8 pt-6 border-t border-brand-secondary/50 text-center">
                <button 
                    onClick={handleAddCustomSection} 
                    className="flex items-center justify-center mx-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-indigo-500"
                >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Add Custom Section
                </button>
            </div>
        )}

        {product.sources && product.sources.length > 0 && !isEditing && (
          <div>
            <h2 className="text-xl font-semibold text-brand-accent border-b-2 border-brand-accent/30 pb-2 mb-4">Data Sources</h2>
            <ul className="list-disc list-inside space-y-2 text-brand-text-secondary">
              {product.sources.map((source, index) => (
                <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center break-all">
                        <span>{source.title || source.uri}</span>
                        <ExternalLinkIcon className="w-4 h-4 ml-1.5 flex-shrink-0" />
                    </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDataDisplay;