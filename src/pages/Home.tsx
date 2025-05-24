import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">University Quality Management System</h1>
        <p className="text-lg text-gray-600 mb-8">
          Manage and analyze your course evaluation surveys and monitor academic performance.
          Please log in to access your personalized dashboard.
        </p>
        <button
          className="px-6 py-3 bg-blue-700 text-white rounded-xl shadow font-semibold hover:bg-blue-800 transition"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Home;
