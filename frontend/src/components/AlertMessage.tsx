import { useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { hideAlert } from '../store/appSlice';

const AlertMessage = () => {
  const dispatch = useDispatch();
  const alert = useSelector((state: RootState) => state.app.alert);
  
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert.show, dispatch]);
  
  if (!alert.show) return null;
  
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };
  
  const getAlertClasses = () => {
    const baseClasses = "rounded-md p-4 shadow-lg";
    
    switch (alert.type) {
      case 'success':
        return `${baseClasses} bg-green-50 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 border border-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border border-yellow-200`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border border-blue-200`;
    }
  };
  
  const getTextColor = () => {
    switch (alert.type) {
      case 'success':
        return "text-green-800";
      case 'error':
        return "text-red-800";
      case 'warning':
        return "text-yellow-800";
      case 'info':
      default:
        return "text-blue-800";
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className={getAlertClasses()}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getAlertIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>{alert.message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => dispatch(hideAlert())}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  alert.type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : alert.type === 'error'
                    ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    : alert.type === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                    : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage; 