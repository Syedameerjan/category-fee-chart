import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [processedData, setProcessedData] = useState([]);
  const [category, setCategory] = useState("");
  const [regDate, setRegDate] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [amount, setAmount] = useState("");

  // 🔹 Normalize helper
  const normalize = str =>
    str?.toString()
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*/g, "-")
      .replace(/\s*\/\s*/g, "/")
      .trim()
      .toUpperCase();

  // 🔹 Load & process Excel ONCE
  useEffect(() => {
    fetch("/All_Category_Fee_Chart.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const wb = XLSX.read(buffer, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        // ✅ Fill merged Category cells
        const filledData = json.reduce((acc, row) => {
          const lastCategory = acc.length
            ? acc[acc.length - 1].Category
            : null;

          acc.push({
            ...row,
            Category: row.Category || lastCategory,
          });

          return acc;
        }, []);

        setProcessedData(filledData);
        console.log("Processed Excel Data:", filledData);
      });
  }, []);

  // 🔹 Calculate age group
  // const calculateAgeGroup = date => {
  //   if (!date) return "";
  //   const reg = new Date(date);
  //   const today = new Date();
  //   const age = today.getFullYear() - reg.getFullYear();

  //   if (age >= 1 && age <= 8) return "1-8 Years";
  //   if (age >= 9 && age <= 15) return "9-15 Years";
  //   if (age > 15) return "Above 15 Years";
  //   return "Below 1 Year";
  // };




  const calculateAgeGroup = (date) => {
  if (!date) return "";

  const dob = new Date(date);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  // Adjust if birthday hasn't occurred yet this year
  const hasHadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthday) {
    age--;
  }

  // Force ages below 1 into first group
  if (age < 1) return "1-8 Years";

  if (age >= 1 && age <= 7) return "1-8 Years";
  if (age > 7 && age <= 9) return "8-10 Years";
  if (age > 9 && age <= 12) return "10-13 Years";
  if (age > 12 && age <= 14) return "13-15 Years";
  if (age > 14 && age <= 19) return "15-20 Years";

  return "20+ Years";
};


  const handleDateChange = e => {
    const value = e.target.value;
    setRegDate(value);
    setAgeGroup(calculateAgeGroup(value));
  };

  // 🔹 Fetch Total amount
  const fetchAmount = () => {
    console.log("Category:", category);
    console.log("Age Group:", ageGroup);

    const result = processedData.find(d =>
      normalize(d.Category) === normalize(category) &&
      normalize(d["Age Group"]) === normalize(ageGroup)
    );

    console.log("Matched Row:", result);

    setAmount(result ? result.Total : "No Data Found");
  };

  // 🔹 Category dropdown (clean & unique)
  const categories = [
    ...new Set(
      processedData
        .map(d => d.Category)
        .filter(Boolean)
    )
  ];

  return (
    <div className="page">
       <div className="name-board">
<h2>Category Fee Chart</h2>

      <div className="row">

       

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input type="date" value={regDate} onChange={handleDateChange} />

        <input type="text" value={ageGroup} placeholder="Age Group" readOnly />

        <input type="text" value={amount} placeholder="Total Amount" readOnly />

        
        </div>

<div className="button-wrapper">
  <button onClick={fetchAmount}>FETCH DATA</button>
</div>



      </div>

      
    </div>
  );
}

export default App;
