import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleTestReport: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SimpleTestReport component mounted');
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Simple Test Report</h1>
        
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Navigation is working properly.
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>Current URL:</strong> {window.location.href}
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>Pathname:</strong> {window.location.pathname}
          </div>
          
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Component:</strong> SimpleTestReport loaded successfully
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestReport; 