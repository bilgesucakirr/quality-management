import { useForm } from "react-hook-form";
import type { LoginRequest } from "../types/LoginRequest";
import { login } from "../api/AuthService";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import isikUniversityLogo from "/i.u_logo-blue-en.png";
import universityLottie from "../assets/university-lottie.json";

const PRIMARY = "#21409a";
const BORDER = "#e3e6ea";

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
      alert("Login Failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fb]">
      {/* LEFT SIDE - Lottie Animation */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-[#dbeafe] to-[#f8f9fb] border-r" style={{ borderColor: BORDER }}>
        <div className="flex flex-col items-center">
          <Lottie
            animationData={universityLottie}
            loop
            autoplay
            style={{ height: 260, width: 260, marginBottom: 30 }}
          />
          <h2 className="text-2xl font-semibold text-[#21409a] mt-2 mb-2 text-center tracking-tight">
            Welcome to the Quality Management System
          </h2>
          <p className="text-md text-gray-500 text-center max-w-xs">
            Designed for academic excellence,<br />
            transparency and quality culture.
            <br />
            <span className="font-medium text-[#21409a]">
              Login with your university credentials.
            </span>
          </p>
        </div>
      </div>
      {/* RIGHT SIDE - Modern, Borderless Login */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center px-2 py-8">
        <div className="w-full flex flex-col items-center px-2 md:px-16">
          <img
            src={isikUniversityLogo}
            alt="Işık University Logo"
            className="h-16 w-auto mb-5"
          />
         
          <p className="text-sm text-gray-500 text-center mb-7">
            Please log in with your university account
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="University Email"
                {...register("email", { required: "Email is required." })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#f7f9fd] focus:ring-2 focus:ring-[#21409a] focus:border-[#21409a] outline-none transition"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password", { required: "Password is required." })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#f7f9fd] focus:ring-2 focus:ring-[#21409a] focus:border-[#21409a] outline-none transition"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-md bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm shadow-md transition-all duration-150"
              style={{
                letterSpacing: ".03em",
                boxShadow: `0 2.5px 8px -3px #21409a25`,
              }}
            >
              Log In
            </button>
          </form>
          <div className="w-full mt-5 flex flex-col items-center">
            <span className="text-[11px] text-gray-400">© {new Date().getFullYear()} Işık University</span>
          </div>
        </div>
      </div>
    </div>
  );
}
