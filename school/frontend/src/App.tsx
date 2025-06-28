import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import TestReport from './components/TestReport'
import SimpleTestReport from './components/SimpleTestReport'
import ApiTestReport from './components/ApiTestReport'
import SessionCheck from './components/SessionCheck'
import SchoolDashboard from './components/SchoolDashboard'
import { APP_BASE_URL, ROUTES } from './config/routes'
import './App.css'

function App() {
  return (
    <Router basename={APP_BASE_URL}>
      <SessionCheck>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<SchoolDashboard />} />
          <Route path={ROUTES.TEACHER_MANAGEMENT} element={<TeacherManagement />} />
          <Route path={ROUTES.ADD_TEACHER} element={<AddTeacherForm />} />
          <Route path={`${ROUTES.EDIT_TEACHER}/:id`} element={<EditTeacherForm />} />
          <Route path={ROUTES.SALARY_MANAGEMENT} element={<SalaryManagement />} />
          <Route path={ROUTES.HRA_MANAGEMENT} element={<HRAManagement />} />
          <Route path={ROUTES.DA_MANAGEMENT} element={<DAManagement />} />
          <Route path={ROUTES.LWP_MANAGEMENT} element={<LWPManagement />} />
          <Route path={ROUTES.ALL_PAYABLE} element={<AllPayableReport />} />
          <Route path={ROUTES.ALL_PAID} element={<AllPaidReport />} />
          <Route path={ROUTES.DIFFERENT_SALARY} element={<DifferentSalaryReport />} />
          
          {/* Test Routes */}
          <Route path={ROUTES.TEST_REPORT} element={<TestReport />} />
          <Route path="/simple-test-report" element={<SimpleTestReport />} />
          <Route path="/api-test-report" element={<ApiTestReport />} />
          
          {/* Report Routes */}
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
          
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </SessionCheck>
    </Router>
  )
}

export default App 