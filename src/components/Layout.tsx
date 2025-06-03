// src/components/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom'; // Make sure this is imported

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar /> {/* Navbar will always be at the top */}
            <main className="flex-grow"> {/* Main content area that expands */}
                <Outlet /> {/* This is where the nested routes (Dashboard, UserManagement, etc.) will be rendered */}
            </main>
        </div>
    );
};

export default Layout;