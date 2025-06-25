import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MAIN_APP_URL } from '../config/routes';

interface SessionCheckProps {
  children: React.ReactNode;
}

const SessionCheck: React.FC<SessionCheckProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cityName, setCityName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('SessionCheck: Starting session verification...');
    
    // Check for login session
    const session = localStorage.getItem('schoolLoginSession');
    const urlCity = searchParams.get('city');
    
    console.log('SessionCheck: Session from localStorage:', session);
    console.log('SessionCheck: City from URL:', urlCity);

    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const loginTime = new Date(sessionData.loginTime);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - loginTime.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        console.log('SessionCheck: Session data:', sessionData);
        console.log('SessionCheck: Hours since login:', hoursDiff);

        // Check if session is less than 24 hours old
        if (hoursDiff < 24) {
          console.log('SessionCheck: Valid session found, setting authenticated');
          setIsAuthenticated(true);
          setCityName(sessionData.cityName);
          setIsLoading(false);
          return;
        } else {
          console.log('SessionCheck: Session expired, removing from localStorage');
          // Session expired
          localStorage.removeItem('schoolLoginSession');
          localStorage.removeItem('schoolCityId');
          localStorage.removeItem('schoolCityName');
        }
      } catch (error) {
        console.error('SessionCheck: Error parsing session:', error);
        localStorage.removeItem('schoolLoginSession');
        localStorage.removeItem('schoolCityId');
        localStorage.removeItem('schoolCityName');
      }
    }

    // If no valid session, redirect to main page
    console.log('SessionCheck: No valid session, redirecting to main application');
    setIsAuthenticated(false);
    setIsLoading(false);
    window.location.href = MAIN_APP_URL;
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Checking Session...</h2>
          <p className="text-white/80">Please wait while we verify your login.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div>
      {/* City Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 text-center">
        <p className="font-semibold">Logged in as: {cityName}</p>
      </div>
      {children}
    </div>
  );
};

export default SessionCheck; 