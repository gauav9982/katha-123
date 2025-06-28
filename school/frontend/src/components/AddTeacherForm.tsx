import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import TopBar from './TopBar';
import { ddmmyyyyToYyyymmdd } from '../utils/dateFormat';

// Reusable Input Component
const FormInput = ({ label, type = 'text', value, onChange, placeholder, readOnly = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${readOnly ? 'bg-gray-100' : ''}`}
    />
  </div>
);

// Grade Section Component
const GradeSection = ({ title, data, setData }) => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput label="Grade Date" type="text" value={data.gradeDate} onChange={(e) => setData({ ...data, gradeDate: e.target.value })} placeholder="DD-MM-YYYY" />
      <FormInput label="Payable Basic" type="number" value={data.payableBasic} onChange={(e) => setData({ ...data, payableBasic: e.target.value })} placeholder="" />
      <FormInput label="Payable Grade Pay" type="number" value={data.payableGradePay} onChange={(e) => setData({ ...data, payableGradePay: e.target.value })} placeholder="" />
      <FormInput label="Paid Basic" type="number" value={data.paidBasic} onChange={(e) => setData({ ...data, paidBasic: e.target.value })} placeholder="" />
      <FormInput label="Paid Grade Pay" type="number" value={data.paidGradePay} onChange={(e) => setData({ ...data, paidGradePay: e.target.value })} placeholder="" />
    </div>
  </div>
);

// Pay Commission Section Component
const PayCommissionSection = ({ title, data, setData }) => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput label="Pay Date" type="text" value={data.payDate} onChange={(e) => setData({ ...data, payDate: e.target.value })} placeholder="DD-MM-YYYY" />
      <FormInput label="Payable Basic" type="number" value={data.payableBasic} onChange={(e) => setData({ ...data, payableBasic: e.target.value })} placeholder="" />
      <FormInput label="Payable Grade Pay" type="number" value={data.payableGradePay} onChange={(e) => setData({ ...data, payableGradePay: e.target.value })} placeholder="" />
      <FormInput label="Paid Basic" type="number" value={data.paidBasic} onChange={(e) => setData({ ...data, paidBasic: e.target.value })} placeholder="" />
      <FormInput label="Paid Grade Pay" type="number" value={data.paidGradePay} onChange={(e) => setData({ ...data, paidGradePay: e.target.value })} placeholder="" />
      <FormInput label="Yearly Increment Date" type="text" value={data.yearlyIncrementDate} onChange={(e) => setData({ ...data, yearlyIncrementDate: e.target.value })} placeholder="DD-MM-YYYY" />
    </div>
  </div>
);


const AddTeacherForm = () => {
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState({ name: '', birthday: '', joiningDate: '', retirementDate: '' });
  const [firstGrade, setFirstGrade] = useState({ gradeDate: '', payableBasic: '', payableGradePay: '', paidBasic: '', paidGradePay: '' });
  const [secondGrade, setSecondGrade] = useState({ gradeDate: '', payableBasic: '', payableGradePay: '', paidBasic: '', paidGradePay: '' });
  const [thirdGrade, setThirdGrade] = useState({ gradeDate: '', payableBasic: '', payableGradePay: '', paidBasic: '', paidGradePay: '' });
  const [sixthPay, setSixthPay] = useState({ payDate: '2006-01-01', payableBasic: '', payableGradePay: '', paidBasic: '', paidGradePay: '', yearlyIncrementDate: '2006-01-01' });
  const [seventhPay, setSeventhPay] = useState({ payDate: '2016-01-01', payableBasic: '', payableGradePay: '', paidBasic: '', paidGradePay: '', yearlyIncrementDate: '2006-01-01' });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const cityId = localStorage.getItem('schoolCityId');
  const cityName = localStorage.getItem('schoolCityName');

  // **Critical Fix:** Check for cityId on component mount. If not present, redirect to login.
  useEffect(() => {
    if (!cityId || !cityName) {
      // Set default city
      localStorage.setItem('schoolCityId', '1');
      localStorage.setItem('schoolCityName', 'NADIAD');
      // Optionally, set state if needed
      // setCityId('1'); setCityName('NADIAD');
    }
  }, [cityId, cityName]);

  // Effect to auto-calculate retirement date
  useEffect(() => {
    if (basicInfo.birthday) {
      const birthDate = new Date(basicInfo.birthday);
      if (!isNaN(birthDate.getTime())) {
        const retirementYear = birthDate.getFullYear() + 58;
        const retirementMonth = birthDate.getMonth(); // 0-indexed
        const lastDayOfMonth = new Date(retirementYear, retirementMonth + 1, 0).getDate();
        
        const retirementDateString = `${retirementYear}-${String(retirementMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
        
        setBasicInfo(prev => ({ ...prev, retirementDate: retirementDateString }));
      }
    }
  }, [basicInfo.birthday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!basicInfo.name) {
      setError('Teacher name is required.');
      setIsLoading(false);
      return;
    }

    // Convert all date fields from DD-MM-YYYY to YYYY-MM-DD before submit
    const payload = {
      cityId: cityId,
      basicInfo: {
        ...basicInfo,
        birthday: ddmmyyyyToYyyymmdd(basicInfo.birthday),
        joiningDate: ddmmyyyyToYyyymmdd(basicInfo.joiningDate),
        retirementDate: ddmmyyyyToYyyymmdd(basicInfo.retirementDate),
      },
      firstGrade: {
        ...firstGrade,
        gradeDate: ddmmyyyyToYyyymmdd(firstGrade.gradeDate),
      },
      secondGrade: {
        ...secondGrade,
        gradeDate: ddmmyyyyToYyyymmdd(secondGrade.gradeDate),
      },
      thirdGrade: {
        ...thirdGrade,
        gradeDate: ddmmyyyyToYyyymmdd(thirdGrade.gradeDate),
      },
      sixthPay: {
        ...sixthPay,
        payDate: ddmmyyyyToYyyymmdd(sixthPay.payDate),
        yearlyIncrementDate: ddmmyyyyToYyyymmdd(sixthPay.yearlyIncrementDate),
      },
      seventhPay: {
        ...seventhPay,
        payDate: ddmmyyyyToYyyymmdd(seventhPay.payDate),
        yearlyIncrementDate: ddmmyyyyToYyyymmdd(seventhPay.yearlyIncrementDate),
      },
    };
    
    try {
      const response = await fetch('/school-app/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        navigate('/teachers');
      } else {
        setError(data.error || 'Failed to add teacher.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <TopBar />
      {/* Header */}
      <div className="bg-blue-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Teacher Salary Management</h1>
          <div className="text-sm text-white">
            <span onClick={() => navigate('/')} className="hover:underline cursor-pointer">Home</span> &gt; 
            <span onClick={() => navigate('/teachers')} className="hover:underline cursor-pointer"> Teachers</span> &gt; Add Teacher
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {/* Form Header */}
          <div className="flex items-center mb-6 border-b pb-4">
            <UserPlusIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Add New Teacher</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Teacher Name" value={basicInfo.name} onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })} placeholder="" />
                <FormInput label="Birthday" type="text" value={basicInfo.birthday} onChange={(e) => setBasicInfo({ ...basicInfo, birthday: e.target.value })} placeholder="DD-MM-YYYY" />
                <FormInput label="Joining Date" type="text" value={basicInfo.joiningDate} onChange={(e) => setBasicInfo({ ...basicInfo, joiningDate: e.target.value })} placeholder="DD-MM-YYYY" />
                <FormInput label="Retirement Date" type="text" value={basicInfo.retirementDate} onChange={(e) => setBasicInfo({ ...basicInfo, retirementDate: e.target.value })} placeholder="DD-MM-YYYY" />
              </div>
            </div>

            {/* Grades */}
            <GradeSection title="First Higher Grade" data={firstGrade} setData={setFirstGrade} />
            <GradeSection title="Second Higher Grade" data={secondGrade} setData={setSecondGrade} />
            <GradeSection title="Third Higher Grade" data={thirdGrade} setData={setThirdGrade} />

            {/* Pay Commissions */}
            <PayCommissionSection title="6th Pay Commission" data={sixthPay} setData={setSixthPay} />
            <PayCommissionSection title="7th Pay Commission" data={seventhPay} setData={setSeventhPay} />

            {/* Error Message */}
            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
              <button
                type="button"
                onClick={() => navigate('/teachers')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckIcon className="h-5 w-5 mr-2" />
                )}
                Save Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherForm; 