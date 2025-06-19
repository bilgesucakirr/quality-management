import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeToken } from "../utils/DecodeToken";
import type { DecodedToken } from "../types/DecodedToken";
import type { UserResponse } from "../types/User";
import { getUserById } from "../api/UserService";

type AuthState = {
  accessToken: string;
  userSub: string | null; 
  role: string | null;
  currentUser: UserResponse | null; 
  facultyId: string | null;        
  departmentId: string | null;   
  email: string | null;             

  setToken: (token: string) => Promise<void>;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: "",
      userSub: null,
      role: null,
      currentUser: null,
      facultyId: null,
      departmentId: null,
      email: null,

      setToken: async (token: string) => {
        const decoded: DecodedToken = decodeToken(token);
        let currentUserData: UserResponse | null = null;
        let facultyIdFromUser: string | null = null;
        let departmentIdFromUser: string | null = null;
        let emailFromUser: string | null = null;

        if (decoded.sub) { 
          try {
            currentUserData = await getUserById(decoded.sub);
            facultyIdFromUser = currentUserData.faculty?.id ?? null;
            departmentIdFromUser = currentUserData.department?.id ?? null;
            emailFromUser = currentUserData.email;
          } catch (error) {
            console.error("AuthStore: Failed to fetch user details:", error);
          }
        }

        set({
          accessToken: token,
          userSub: decoded.sub,
          role: decoded.role,
          currentUser: currentUserData,
          facultyId: facultyIdFromUser,
          departmentId: departmentIdFromUser,
          email: emailFromUser,
        });
      },

      clearToken: () => {
        set({
          accessToken: "",
          userSub: null,
          role: null,
          currentUser: null,
          facultyId: null,
          departmentId: null,
          email: null,
        });
      },
    }),
    {
      name: "auth-storage", 
    }
  )
);