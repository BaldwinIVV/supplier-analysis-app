import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
        </div>
        <h1 className="mt-6 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page non trouvée</h2>
        <p className="mt-2 text-gray-500">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <div>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour en arrière
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 