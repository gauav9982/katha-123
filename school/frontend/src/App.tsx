import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TeacherManagement from './components/TeacherManagement'
import SalaryManagement from './components/SalaryManagement'
import AddTeacherForm from './components/AddTeacherForm'
import EditTeacherForm from './components/EditTeacherForm'
import DAManagement from './components/DAManagement'
import HRAManagement from './components/HRAManagement'
import LWPManagement from './components/LWPManagement'
import Payable5thCommissionReport from './components/Payable5thCommissionReport'
import Paid5thCommissionReport from './components/Paid5thCommissionReport'
import Payable6thCommissionReport from './components/Payable6thCommissionReport'
import Paid6thCommissionReport from './components/Paid6thCommissionReport'
import SupPayable6thCommissionReport from './components/SupPayable6thCommissionReport'
import SupPaid6thCommissionReport from './components/SupPaid6thCommissionReport'
import Payable7thCommissionReport from './components/Payable7thCommissionReport'
import Paid7thCommissionReport from './components/Paid7thCommissionReport'
import SupPayable5thCommissionReport from './components/SupPayable5thCommissionReport'
import SupPaid5thCommissionReport from './components/SupPaid5thCommissionReport'
import PayableHRAReport from './components/PayableHRAReport'
import PaidHRAReport from './components/PaidHRAReport'
import AllPayableReport from './components/AllPayableReport'
import AllPaidReport from './components/AllPaidReport'
import DifferentSalaryReport from './components/DifferentSalaryReport'
import LoginDebug from './components/LoginDebug'
import SessionCheck from './components/SessionCheck'
import SchoolDashboard from './components/SchoolDashboard'
import './App.css'

function App() {
  return (
    <div className="App">
      {/* The login page is removed. It will now directly go to the main application page. */}
      <Routes>
        {/* Default route is now School Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<SessionCheck><SchoolDashboard /></SessionCheck>} />
        
        {/* The /school route now also redirects to the dashboard */}
        <Route path="/school" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/teachers" element={<TeacherManagement />} />
        <Route path="/teachers/add" element={<AddTeacherForm />} />
        <Route path="/teachers/edit/:teacherId" element={<EditTeacherForm />} />
        <Route path="/salary" element={<SalaryManagement />} />
        <Route path="/da-management" element={<DAManagement />} />
        <Route path="/hra-management" element={<HRAManagement />} />
        <Route path="/lwp-management" element={<LWPManagement />} />
        <Route path="/reports/payable-5th-commission" element={<SessionCheck><Payable5thCommissionReport /></SessionCheck>} />
        <Route path="/reports/paid-5th-commission" element={<SessionCheck><Paid5thCommissionReport /></SessionCheck>} />
        <Route path="/reports/payable-6th-commission" element={<SessionCheck><Payable6thCommissionReport /></SessionCheck>} />
        <Route path="/reports/paid-6th-commission" element={<SessionCheck><Paid6thCommissionReport /></SessionCheck>} />
        <Route path="/reports/sup-payable-6th-commission" element={<SessionCheck><SupPayable6thCommissionReport /></SessionCheck>} />
        <Route path="/reports/sup-paid-6th-commission" element={<SessionCheck><SupPaid6thCommissionReport /></SessionCheck>} />
        <Route path="/reports/payable-7th-commission" element={<SessionCheck><Payable7thCommissionReport /></SessionCheck>} />
        <Route path="/reports/paid-7th-commission" element={<SessionCheck><Paid7thCommissionReport /></SessionCheck>} />
        <Route path="/reports/sup-payable-5th-commission" element={<SessionCheck><SupPayable5thCommissionReport /></SessionCheck>} />
        <Route path="/reports/sup-paid-5th-commission" element={<SessionCheck><SupPaid5thCommissionReport /></SessionCheck>} />
        <Route path="/reports/payable-hra" element={<SessionCheck><PayableHRAReport /></SessionCheck>} />
        <Route path="/reports/paid-hra" element={<SessionCheck><PaidHRAReport /></SessionCheck>} />
        <Route path="/reports/all-payable" element={<SessionCheck><AllPayableReport /></SessionCheck>} />
        <Route path="/reports/all-paid" element={<SessionCheck><AllPaidReport /></SessionCheck>} />
        <Route path="/reports/different-salary-report" element={<SessionCheck><DifferentSalaryReport /></SessionCheck>} />
        <Route path="/login-debug" element={<LoginDebug />} />
        <Route path="/debug" element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">School App Debug Page</h1>
              <p className="text-gray-600 mb-4">School application is running successfully!</p>
              <button 
                onClick={() => window.location.href = '/school'}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Go to School Dashboard
              </button>
            </div>
          </div>
        } />
        <Route path="/reports" element={<div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reports</h1>
            <p className="text-gray-600">Reports feature coming soon...</p>
          </div>
        </div>} />
        <Route path="*" element={<Navigate to="/teachers" replace />} />
      </Routes>
    </div>
  )
}

export default App 