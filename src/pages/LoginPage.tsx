import { useForm } from "react-hook-form";
import type { LoginRequest } from "../types/LoginRequest";
import { login } from "../api/AuthService";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

const BLUE = "#05058c";

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const onSubmit = async (data: LoginRequest) => {
        try {
            const response = await login(data);
            setToken(response.token);
            alert("Login Success.");
            navigate("/dashboard");
        } catch (error) {
            alert("Login Failed.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-200 py-10">
            <div className="bg-white rounded-3xl shadow-2xl px-8 py-12 w-full max-w-sm border" style={{ borderColor: BLUE }}>
                <h2
                    className="text-3xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
                    style={{ color: BLUE }}
                >
                    University Quality Management System
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            {...register("email", { required: "*Email is required." })}
                            className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] focus:border-[#05058c] outline-none transition"
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
                            className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] focus:border-[#05058c] outline-none transition"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-white font-bold text-base mt-4 shadow"
                        style={{
                            backgroundColor: BLUE,
                            transition: "background 0.2s",
                        }}
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}
