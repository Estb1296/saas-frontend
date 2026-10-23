import { axiosClient } from './axiosClient';
import type { LoginResponse } from '../types/admin';

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // Updated to use the shared flat LoginResponse interface from admin.ts
        const response = await axiosClient.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        return response.data;
    },
};