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
      <Routes>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard route */}
        <Route path="/dashboard" element={<SchoolDashboard />} />
        
        {/* Teacher Management */}
        <Route path="/teachers" element={<TeacherManagement />} />
        <Route path="/teachers/add" element={<AddTeacherForm />} />
        <Route path="/teachers/edit/:teacherId" element={<EditTeacherForm />} />
        
        {/* Salary Management */}
        <Route path="/salary" element={<SalaryManagement />} />
        
        {/* Allowance Management */}
        <Route path="/da-management" element={<DAManagement />} />
        <Route path="/hra-management" element={<HRAManagement />} />
        <Route path="/lwp-management" element={<LWPManagement />} />
        
        {/* Reports */}
        <Route path="/reports/payable-5th-commission" element={<Payable5thCommissionReport />} />
        <Route path="/reports/paid-5th-commission" element={<Paid5thCommissionReport />} />
        <Route path="/reports/payable-6th-commission" element={<Payable6thCommissionReport />} />
        <Route path="/reports/paid-6th-commission" element={<Paid6thCommissionReport />} />
        <Route path="/reports/sup-payable-6th-commission" element={<SupPayable6thCommissionReport />} />
        <Route path="/reports/sup-paid-6th-commission" element={<SupPaid6thCommissionReport />} />
        <Route path="/reports/payable-7th-commission" element={<Payable7thCommissionReport />} />
        <Route path="/reports/paid-7th-commission" element={<Paid7thCommissionReport />} />
        <Route path="/reports/sup-payable-5th-commission" element={<SupPayable5thCommissionReport />} />
        <Route path="/reports/sup-paid-5th-commission" element={<SupPaid5thCommissionReport />} />
        <Route path="/reports/payable-hra" element={<PayableHRAReport />} />
        <Route path="/reports/paid-hra" element={<PaidHRAReport />} />
        <Route path="/reports/all-payable" element={<AllPayableReport />} />
        <Route path="/reports/all-paid" element={<AllPaidReport />} />
        <Route path="/reports/different-salary-report" element={<DifferentSalaryReport />} />
        
        {/* Debug Routes */}
        <Route path="/login-debug" element={<LoginDebug />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App 