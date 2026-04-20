import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', gradYear: '', group: '', email: '', parentName: '', parentEmail: ''
  });

  // This function calculates "Senior", "Junior", etc. based on today's date
  const getGrade = (gradYear) => {
    if (!gradYear) return "";
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 is January, 5 is June
    
    // If we are past June (Month 5), we are effectively in the next academic year
    const academicYear = currentMonth > 5 ? currentYear + 1 : currentYear;
    const yearsUntilGrad = gradYear - academicYear;

    if (yearsUntilGrad === 0) return "Senior";
    if (yearsUntilGrad === 1) return "Junior";
    if (yearsUntilGrad === 2) return "Sophomore";
    if (yearsUntilGrad === 3) return "Freshman";
    if (yearsUntilGrad < 0) return "Alumni";
    return "Future Athlete";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        currentGrade: getGrade(formData.gradYear),
        timestamp: new Date(),
        isActive: true // New athletes start as active
      };
      await addDoc(collection(db, "athletes"), dataToSave); // Changed collection to "athletes" for permanent storage
      alert("Success!");
    } catch (error) {
      alert("Submission failed.");
    }
  };

  // We generate the dropdown options dynamically so you don't have to edit them
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

  return (
    <div className="form-container">
      <h2>Chantilly Track & Field Sign-up</h2>
      <p>Current Status: {formData.gradYear ? getGrade(formData.gradYear) : "Select Grad Year"}</p>
      
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
        <input type="text" placeholder="Last Name" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
        
        <select required onChange={(e) => setFormData({...formData, gradYear: e.target.value})}>
          <option value="">Graduation Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select required onChange={(e) => setFormData({...formData, group: e.target.value})}>
          <option value="">Event Group</option>
          <option value="Sprinters">Sprinters</option>
          <option value="Distance">Distance</option>
          <option value="Throwers">Throwers</option>
        </select>

        <input type="email" placeholder="Athlete Email" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SignupForm;
