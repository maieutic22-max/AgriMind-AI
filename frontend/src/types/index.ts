export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'FARMER' | 'EQUIPMENT_PROVIDER' | 'FPO_ADMIN' | 'ADMIN';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  message: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: DatabaseHealth;
  timestamp: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  lead_member: string;
  deliverables_count: number;
  status: string;
}

export interface SystemInfoResponse {
  service: string;
  version: string;
  environment: string;
  architecture: string;
  core_capabilities_count: number;
  implementation_deliverables_count: number;
  modules: ModuleInfo[];
}

export interface FarmOverview {
  name: string;
  location: string;
  totalAcres: number;
  fieldsCount: number;
  activeCrops: string[];
}
