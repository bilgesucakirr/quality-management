import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore'; // Auth store'u import ediyoruz
import { LogOut, LayoutDashboard, Users, ClipboardList } from 'lucide-react'; // İkonları import ediyoruz

const BLUE = "#05058c";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { role, clearToken } = useAuthStore(); // Auth store'dan rol ve clearToken'ı alıyoruz

    const handleLogout = () => {
        clearToken(); // Token'ı temizle
        navigate('/login'); // Giriş sayfasına yönlendir
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center" style={{ borderBottom: `2px solid ${BLUE}` }}>
            {/* Sol taraf: Logo/Başlık */}
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold" style={{ color: BLUE }}>
                    UQMS
                </Link>
            </div>

            {/* Orta taraf: Navigasyon Linkleri */}
            <div className="flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                {role === "ADMIN" && ( // Sadece ADMIN rolündekiler görebilir
                    <>
                        <Link to="/user-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <Users size={18} /> User Management
                        </Link>
                        <Link to="/survey-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <ClipboardList size={18} /> Survey Management
                        </Link>
                    </>
                )}
                {/* Diğer roller için de buraya linkler eklenebilir */}
            </div>

            {/* Sağ taraf: Oturum Yönetimi */}
            <div>
                {role ? ( // Eğer rol varsa (yani kullanıcı giriş yapmışsa) logout butonunu göster
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-1"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                ) : ( // Yoksa (giriş yapmamışsa) giriş butonunu göster
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;