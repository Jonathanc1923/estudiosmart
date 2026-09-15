export type ThemeCategory = 
  | 'todos'
  | 'personalizado'
  | 'navidad'
  | 'ninos'
  | 'bebes'
  | 'maternidad'
  | 'familia'
  | 'cumpleanos'
  | 'retro' 
  | 'profesional' 
  | 'moda' 
  | 'fantasia' 
  | 'cine' 
  | 'fitness' 
  | 'arte';

export interface ThemeSection {
  id: ThemeCategory;
  name: string;
  icon: string;
  description: string;
  count?: number;
}

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  sectionName: string;
  description: string;
  clothingMale: string;
  clothingFemale: string;
  clothingKidsCouples?: string;
  badge?: string;
  gradient: string;
  iconName: string;
  prompt: string;
  sampleImage: string;
  popular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tokens: number;
  hasUsedFreeTrial: boolean;
  createdAt: string;
}

export interface Generation {
  id: string;
  userId: string;
  themeId: string;
  themeName: string;
  originalImage: string;
  resultImage: string;
  isWatermarked: boolean;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  createdAt: string;
  predictionId?: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  method: 'yape' | 'plin' | 'bcp_transfer' | string;
  amount: number;
  packageTokens: number;
  operationCode: string;
  voucherImage?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface AdminUser extends User {
  totalGenerated?: number;
  lastActive?: string;
}

export interface ThemeStat {
  themeId: string;
  themeName: string;
  category?: string;
  count: number;
  percentage: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalGenerations: number;
  totalPayments: number;
  totalRevenue: number;
  totalTokensInCirculation: number;
  popularThemes: ThemeStat[];
  recentGenerations: Generation[];
  recentPayments: PaymentRequest[];
}