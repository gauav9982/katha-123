import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApiTestReport: React.FC = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApi = async (url: string, method: string = 'GET', body?: any) => {
    try {
      addResult(`Testing: ${method} ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ Success: ${method} ${url}`);
        addResult(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        addResult(`❌ Error: ${method} ${url}`);
        addResult(`   Status: ${response.status}`);
        addResult(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addResult(`❌ Network Error: ${method} ${url}`);
      addResult(`   Error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('Starting API Tests...');
    
    // Test 1: Backend connection
    await testApi('http://localhost:4001/api/cities');
    
    // Test 2: Teachers endpoint
    await testApi('http://localhost:4001/api/teachers?cityName=Ahmedabad');
    
    // Test 3: All Payable Report endpoint
    await testApi('http://localhost:4001/api/reports/all-payable/1');
    
    // Test 4: All Paid Report endpoint
    await testApi('http://localhost:4001/api/reports/all-paid/1');
    
    // Test 5: Different Salary Report endpoint
    await testApi('http://localhost:4001/api/reports/different-salary/1');
    
    addResult('All tests completed!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">API Test Report</h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All API Tests'}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">Click "Run All API Tests" to start testing...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>Click "Run All API Tests" to test all backend endpoints</li>
            <li>Green checkmarks (✅) mean the API call succeeded</li>
            <li>Red X marks (❌) mean there was an error</li>
            <li>Check the error messages to understand what's wrong</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiTestReport; 