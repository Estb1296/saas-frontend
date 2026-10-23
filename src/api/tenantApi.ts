import { axiosClient } from './axiosClient';
import type {Tenant, CreateTenantRequest} from '../types/admin';

export const tenantApi = {
    // Fetch all business tenants
    getAllTenants: async (): Promise<Tenant[]> => {
        const response = await axiosClient.get('/admin/tenants');
        return response.data;
    },

    // Onboard a new business tenant
    createTenant: async (payload: CreateTenantRequest): Promise<Tenant> => {
        const response = await axiosClient.post('/admin/tenants', payload);
        return response.data;
    },
};