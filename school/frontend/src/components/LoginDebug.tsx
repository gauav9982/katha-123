import React, { useState } from 'react';

const LoginDebug: React.FC = () => {
  const [cityName, setCityName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    if (!cityName) {
      setResult({ error: 'Please enter city name' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('Testing login for:', cityName);
      
      const response = await fetch('http://localhost:4009/api/cities/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: cityName.trim() })
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setResult({
        success: data.success,
        data: data.data,
        error: data.error,
        status: response.status
      });
      
      if (data.success) {
        // Test localStorage
        const sessionData = {
          cityName: data.data.name,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('schoolLoginSession', JSON.stringify(sessionData));
        console.log('Session saved:', sessionData);
        
        // Test reading back
        const savedSession = localStorage.getItem('schoolLoginSession');
        console.log('Session read back:', savedSession);
        
        setResult(prev => ({
          ...prev,
          sessionSaved: true,
          sessionReadBack: savedSession
        }));
      }
    } catch (error) {
      console.error('Login test error:', error);
      setResult({
        error: 'Connection error: ' + error
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('schoolLoginSession');
    setResult({ message: 'Session cleared' });
  };

  const checkSession = () => {
    const session = localStorage.getItem('schoolLoginSession');
    setResult({
      sessionExists: !!session,
      sessionData: session ? JSON.parse(session) : null
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Login Debug Tool</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">City Name:</label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter city name (e.g., Nadiad)"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={checkSession}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Check Session
            </button>
            
            <button
              onClick={clearSession}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Session
            </button>
          </div>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Available Cities:</h3>
            <ul className="text-sm text-gray-600">
              <li>• Nadiad</li>
              <li>• Ahmedabad</li>
              <li>• Vadodara</li>
              <li>• Surat</li>
              <li>• Rajkot</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <a
              href="/school"
              className="bg-purple-500 text-white px-4 py-2 rounded inline-block"
            >
              Go to School Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug; 