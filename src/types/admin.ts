export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'STAFF' | 'CUSTOMER' | 'ROLE_SUPER_ADMIN';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    restaurantId: number | null;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    restaurantId: number | null;
}

export interface Tenant {
    id: number;
    name: string;
    slug: string; // e.g. "marios-pizza"
    ownerEmail: string;
    status: 'ACTIVE' | 'INACTIVE';
    themeId: string;
}

export interface CreateTenantRequest {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerFullName: string;
    initialThemeId: string;
}