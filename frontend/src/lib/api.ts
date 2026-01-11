import axios from "axios";
import type { Lead, LeadActivity, PaginatedResponse, ApiResponse } from "@/types";

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
);

// ============================================
// LEAD API
// ============================================

export interface LeadFilters {
    search?: string;
    status?: string;
    source?: string;
    intent?: string;
    min_score?: number;
    assigned_agent_id?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

export const leadApi = {
    // Get paginated leads with filters
    getLeads: async (filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, String(value));
            }
        });
        const response = await api.get(`/leads?${params.toString()}`);
        return response.data;
    },

    // Get lead stats for dashboard
    getStats: async () => {
        const response = await api.get("/leads/stats");
        return response.data.data;
    },

    // Get single lead with activities
    getLead: async (id: string): Promise<Lead> => {
        const response = await api.get(`/leads/${id}`);
        return response.data.data;
    },

    // Create a new lead
    createLead: async (data: Partial<Lead>): Promise<Lead> => {
        const response = await api.post("/leads", data);
        return response.data.data;
    },

    // Update a lead
    updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
        const response = await api.put(`/leads/${id}`, data);
        return response.data.data;
    },

    // Delete a lead
    deleteLead: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    },

    // Add activity to a lead
    addActivity: async (
        leadId: string,
        activity: Partial<LeadActivity>
    ): Promise<LeadActivity> => {
        const response = await api.post(`/leads/${leadId}/activities`, activity);
        return response.data.data;
    },
};

export default api;
