import axios from "axios";

// localStorage'dan accessToken'ı alıyoruz (kullanıcı giriş yaptıysa burada token olur)
const token = localStorage.getItem("accessToken");

// axios ile özelleştirilmiş bir instance (örnek) oluşturuyoruz
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Tüm istekler bu baseURL ile başlar
  headers: {
    "Content-Type": "application/json", // Varsayılan olarak JSON gönderilecek
    // Eğer token varsa, Authorization header'ına Bearer token eklenir
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  withCredentials: false, // Cross-site cookie gönderilmeyecek (genelde backend ile aynı origin ise true yapılır)
});

// Bu axios instance'ı projede istediğim yerde import edip kullanabiliyorum
export default axiosInstance;
