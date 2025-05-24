import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeToken } from "../utils/DecodeToken";

type AuthState = {
  accessToken: string;        // Kullanıcının JWT access token bilgisini tutar
  userSub: string | null;     // Kullanıcının benzersiz ID bilgisini (token'dan) tutar
  role: string | null;        // Kullanıcının rol bilgisini (token'dan) tutar

  setToken: (token: string) => void;    // Access token'ı kaydeder ve kullanıcı bilgilerini çıkarır
  clearToken: () => void;               // Tüm kimlik doğrulama bilgisini sıfırlar (logout)
};

// Kimlik doğrulama durumunu ve kalıcılığını yöneten store (localStorage ile)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: "",    // Başlangıçta token boş
      userSub: null,      // Başlangıçta kullanıcı yok
      role: null,         // Başlangıçta rol yok

      setToken: (token) => {
        // JWT token'ı çözümler, accessToken, userSub ve role bilgilerini state'e yazar
        const decoded = decodeToken(token);
        set({
          accessToken: token,
          userSub: decoded.sub,
          role: decoded.role,
        });
      },

      clearToken: () => {
        // Tüm kimlik doğrulama bilgisini temizler (çıkış yapma)
        set({ accessToken: "", userSub: null, role: null });
      },
    }),
    {
      name: "auth-storage",   // localStorage anahtar adı
    }
  )
);
