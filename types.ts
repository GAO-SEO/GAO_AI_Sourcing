

export interface Specification {
  key: string;
  value: string;
}

export interface PriceTier {
  quantity: string;
  price: string;
}

export interface ProductData {
  productName: string;
  productId: string;
  category: string;
  productLink?: string;
  prices: PriceTier[];
  overview: string;
  metaDescription: string;
  features: string[];
  specifications: Specification[];
  customSections?: CustomSection[];
}

export interface Source {
  uri: string;
  title: string;
}

export interface ProcessedProduct {
  id: string; // Unique client-side ID for list management
  data: ProductData;
  sources: Source[];
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface SanitizedData {
  productName: string;
  productId: string;
  productLink: string;
  overview: string;
  features: string[];
  specifications: Specification[];
  customSections?: CustomSection[];
}