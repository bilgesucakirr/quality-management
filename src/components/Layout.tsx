// src/components/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom'; // <-- Bu satırı ekleyin

const Layout: React.FC = () => { // children prop'unu kaldırdık
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet /> 
            </main>
        </div>
    );
};

export default Layout;