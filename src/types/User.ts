// src/types/User.ts
import type { Faculty, Department } from "./University"; // Import Faculty and Department types from University.ts

export interface UserRole { // Ensure 'export' is here
    id: string;
    name: string;
}

// Represents the user data returned from backend API (e.g., from /users endpoint)
export interface UserResponse { // <<< MAKE SURE 'export' IS HERE
    id: string;
    name: string;
    email: string;
    role: UserRole;
    faculty: Faculty | null;     // User's associated faculty (can be null)
    department: Department | null; // User's associated department (can be null)
}

// Request payload for adding a new user
export interface AddUserRequest { // Ensure 'export' is here
    name: string;
    email: string;
    password: string;            // Password is required when adding a new user
    roleId: string;
    facultyId?: string | null;   // Optional faculty ID to link the user
    departmentId?: string | null; // Optional department ID to link the user
}

// Request payload for updating an existing user
export interface UpdateUserRequest { // Ensure 'export' is here
    name?: string;               // Optional, only send if changing
    email?: string;              // Optional, only send if changing
    password?: string;           // Optional, only send if changing (if allowed to update password)
    roleId?: string;
    facultyId?: string | null;   // Optional, can be null to remove association
    departmentId?: string | null; // Optional, can be null to remove association
}