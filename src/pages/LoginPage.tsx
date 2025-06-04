// src/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import type { LoginRequest } from "../types/LoginRequest";
import { login } from "../api/AuthService";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import isikUniversityLogo from "/i.u_logo-blue-en.png"; // Yeni logoyu import ediyoruz

const BLUE = "#05058c";
const LIGHT_BLUE = "#e0eaff";

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const onSubmit = async (data: LoginRequest) => {
        try {
            const response = await login(data);
            setToken(response.token);
            alert("Login Success."); // Better UX: use a toast notification library instead of alert
            navigate("/dashboard");
        } catch (error) {
            alert("Login Failed. Please check your credentials."); // More informative message
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-200 py-10">
            <div
                className="bg-white rounded-3xl shadow-2xl px-8 py-12 w-full max-w-md border-2 border-solid flex flex-col items-center" // max-w-sm -> max-w-md olarak değiştirildi
                style={{ borderColor: BLUE, boxShadow: `0 10px 25px -5px ${BLUE}30` }}
            >
                {/* Logo Section */}
                <div className="mb-6">
                    <img src={isikUniversityLogo} alt="Işık University Logo" className="h-20 w-auto" />
                </div>

                <h2
                    className="text-3xl font-extrabold mb-8 text-center tracking-tight drop-shadow-md"
                    style={{ color: BLUE }}
                >
                    Quality Management System
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            {...register("email", { required: "*Email is required." })}
                            className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-3 focus:ring-[#05058c] focus:border-[#05058c] outline-none transition duration-200 ease-in-out"
                            style={{ borderColor: LIGHT_BLUE }}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            {...register("password", { required: "*Password is required." })}
                            className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-3 focus:ring-[#05058c] focus:border-[#05058c] outline-none transition duration-200 ease-in-out"
                            style={{ borderColor: LIGHT_BLUE }}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-white font-bold text-lg mt-4 shadow-lg transform hover:scale-105 transition duration-200 ease-in-out"
                        style={{
                            backgroundColor: BLUE,
                            boxShadow: `0 5px 15px -5px ${BLUE}80`,
                        }}
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}