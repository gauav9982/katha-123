import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MAIN_APP_URL } from '../config/routes';

interface SessionCheckProps {
  children: React.ReactNode;
}

const SessionCheck: React.FC<SessionCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('SessionCheck: Checking session...');
    console.log('SessionCheck: Current path:', location.pathname);
    
    // Always allow access to dashboard and root
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      console.log('SessionCheck: On dashboard/root, allowing access');
      setIsChecking(false);
      return;
    }

    // Allow access to test routes
    if (location.pathname.includes('test') || location.pathname.includes('simple')) {
      console.log('SessionCheck: On test route, allowing access');
      setIsChecking(false);
      return;
    }

    const session = localStorage.getItem('schoolLoginSession');
    console.log('SessionCheck: Session data:', session);
    
    if (!session) {
      console.log('SessionCheck: No session found, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    try {
      const sessionData = JSON.parse(session);
      console.log('SessionCheck: Parsed session data:', sessionData);
      
      if (!sessionData.cityName) {
        console.log('SessionCheck: No city name in session, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }

      console.log('SessionCheck: Session valid, allowing access');
      setIsChecking(false);
    } catch (error) {
      console.error('SessionCheck: Error parsing session:', error);
      console.log('SessionCheck: Invalid session, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionCheck; 