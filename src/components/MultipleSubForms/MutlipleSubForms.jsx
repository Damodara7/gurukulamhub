import React, { useState } from 'react';

// Define the parent form component
const MultipleForms = () => {
  // State to hold form data
  const [formData, setFormData] = useState({
    section1Data: '',
    section2Data: '',
    // Add more fields for other sections if needed
  });

  // Handle form data change for section 1
  const handleSection1Change = (value) => {
    setFormData({
      ...formData,
      section1Data: value,
    });
  };

  // Handle form data change for section 2
  const handleSection2Change = (value) => {
    setFormData({
      ...formData,
      section2Data: value,
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Logic to submit form data
    console.log('Form submitted with data:', formData);
  };

  return (
    <div>
      <MultipleForms.Section1 onChange={handleSection1Change} />
      <MultipleForms.Section2 onChange={handleSection2Change} />
      {/* Other sections */}
      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
};

// Define nested components representing sections of the form
MultipleForms.Section1 = ({ onChange }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    onChange(value);
  };

  return (
    <div>
      <h2>Section 1</h2>
      {/* Example input field */}
      <input type="text" onChange={handleChange} />
    </div>
  );
};

MultipleForms.Section2 = ({ onChange }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    onChange(value);
  };

  return (
    <div>
      <h2>Section 2</h2>
      {/* Example input field */}
      <input type="text" onChange={handleChange} />
    </div>
  );
};

// Define a shared submit button component
const SubmitButton = ({ onSubmit }) => {
  const handleClick = () => {
    // Call the onSubmit function passed from the parent
    onSubmit();
  };

  return (
    <button onClick={handleClick}>Submit</button>
  );
};

export default MultipleForms;
