import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
    <Router>
      <SessionCheck>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<SchoolDashboard />} />
          <Route path="/login-debug" element={<LoginDebug />} />
          <Route path="/teacher-management" element={<TeacherManagement />} />
          <Route path="/add-teacher" element={<AddTeacherForm />} />
          <Route path="/edit-teacher/:id" element={<EditTeacherForm />} />
          <Route path="/salary-management" element={<SalaryManagement />} />
          <Route path="/hra-management" element={<HRAManagement />} />
          <Route path="/da-management" element={<DAManagement />} />
          <Route path="/lwp-management" element={<LWPManagement />} />
          <Route path="/all-payable" element={<AllPayableReport />} />
          <Route path="/all-paid" element={<AllPaidReport />} />
          <Route path="/different-salary" element={<DifferentSalaryReport />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SessionCheck>
    </Router>
  )
}

export default App 