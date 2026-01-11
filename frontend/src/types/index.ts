// ============================================
// SOPHICUS TYPE DEFINITIONS
// ============================================

// Lead Types
export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type LeadIntent = 
  | 'investor' 
  | 'end_buyer' 
  | 'renter' 
  | 'developer';

export type LeadSource = 
  | 'whatsapp' 
  | 'instagram' 
  | 'tiktok' 
  | 'facebook' 
  | 'website' 
  | 'referral' 
  | 'portal' 
  | 'cold_outreach';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  intent: LeadIntent | null;
  score: number; // 0-100
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  preferences: LeadPreferences;
  assigned_agent_id: string | null;
  tags: string[];
  notes: string | null;
  last_interaction_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadPreferences {
  property_types?: string[];
  locations?: string[];
  bedrooms_min?: number;
  bedrooms_max?: number;
  timeline?: string;
  investment_goals?: string[];
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'note' | 'email' | 'call' | 'meeting' | 'message' | 'status_change' | 'property_viewed';
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_by_id: string;
  created_at: string;
}

// Property Types
export type PropertyType = 
  | 'condo' 
  | 'house' 
  | 'villa' 
  | 'penthouse' 
  | 'land' 
  | 'commercial';

export type PropertyStatus = 
  | 'available' 
  | 'pending' 
  | 'sold' 
  | 'off_market' 
  | 'pre_launch';

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  year_built: number | null;
  location: PropertyLocation;
  features: string[];
  media: PropertyMedia[];
  developer_id: string | null;
  agent_id: string | null;
  roi_estimate: number | null; // Annual ROI percentage
  created_at: string;
  updated_at: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string | null;
  lat: number;
  lng: number;
  neighborhood: string | null;
}

export interface PropertyMedia {
  id: string;
  type: 'image' | 'video' | 'floor_plan' | '360_tour';
  url: string;
  thumbnail_url: string | null;
  alt: string | null;
  order: number;
}

// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  languages: string[];
  specializations: string[];
  is_active: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: 'starter' | 'pro' | 'enterprise';
  settings: TenantSettings;
  created_at: string;
}

export interface TenantSettings {
  default_currency: string;
  timezone: string;
  notification_email: string | null;
  whatsapp_enabled: boolean;
  ai_features_enabled: boolean;
}

// Dashboard & Analytics Types
export interface DashboardStats {
  total_leads: number;
  leads_this_month: number;
  leads_growth: number; // percentage
  total_properties: number;
  properties_sold: number;
  conversion_rate: number;
  avg_response_time: number; // in minutes
  total_revenue: number;
}

export interface LeadFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  avatar_url: string | null;
  leads_assigned: number;
  leads_converted: number;
  conversion_rate: number;
  avg_response_time: number;
  revenue_generated: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
