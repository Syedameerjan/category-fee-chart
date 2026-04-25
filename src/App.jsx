import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [processedData, setProcessedData] = useState([]);
  const [category, setCategory] = useState("");
  const [regDate, setRegDate] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [amount, setAmount] = useState("");
  const [vehicleAge, setVehicleAge] = useState("");
  const [animationType, setAnimationType] = useState("");
  const [animationPhase, setAnimationPhase] = useState("");

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
    fetch("/All_Category_Fee_Chart (2).xlsx")
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

  
 // 🔹 Vehicle age (exact day)
const calculateVehicleAge = (date) => {
  if (!date) return "";

  const regDate = new Date(date);
  const today = new Date();

  let years = today.getFullYear() - regDate.getFullYear();
  let months = today.getMonth() - regDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Years ${months} Months`;
};

// Animation

const triggerAnimation = (category) => {
  let type = "";
  const value = normalize(category);

  if (value.includes("A/R GOODS")) type = "autoGoods";
  else if (value === "A/R") type = "auto";
  else if (value.includes("M/CAB 7 SEATER")) type = "car7";
  else if (value.includes("M/CAB")) type = "car";
  else if (value.includes("AMBULANCE")) type = "ambulance";
  else if (value.includes("TATA")) type = "tata";
  else if (value.includes("BUS")) type = "bus";
  else if (value.includes("LMV")) type = "lmv";
  else if (value.includes("HGV")) type = "hgv";
  else if (value.includes("10")) type = "10";
  else if (value.includes("12")) type = "12";
  else if (value.includes("14")) type = "14";
  else if (value.includes("16")) type = "16";
  else if (value.includes("MGV")) type = "mgv";

  setAnimationType(type);

  // 🔥 Phase 1: Enter
  setAnimationPhase("enter");

  // 🔥 Phase 2: Idle (after entering)
  setTimeout(() => {
    setAnimationPhase("idle");
  }, 600);

  // 🔥 Phase 3: Exit (after 2s stay)


  //
  ///
  ///
  ///
  
//   setTimeout(() => {
//     setAnimationPhase("exit");
//   }, 2600);

//   // 🔥 Reset
//   setTimeout(() => {
//     setAnimationType("");
//     setAnimationPhase("");
//   }, 3200);
};

//
  ///
  ///
  


  
const handleClear = () => {
  window.location.reload();
};



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
    setVehicleAge(calculateVehicleAge(value));
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


const getVehicleIcon = (type, category) => {
  const value = normalize(category);

  // 🛺 Auto
  if (value.includes("A/R GOODS")) return "🛺📦";
  if (value === "A/R") return "🛺";

  // 🚗 Cars
  if (value.includes("M/CAB") && value.includes("7")) return "🚙"; // SUV (Innova type)
  if (value.includes("M/CAB")) return "🚗";

  // 🚑 Ambulance
  if (value.includes("AMBULANCE")) return "🚑";

  // 🛻 Light vehicles (Mahindra / Tata / LMV)
  if (value.includes("MAHINDRA") || value.includes("TATA") || value.includes("LMV")) {
    return "🛻"; // pickup / light truck
  }

  // 🚌 Bus
  if (value.includes("BUS")) return "🚌";

  // 🚚 Medium Goods Vehicle
  if (value.includes("MGV")) return "🚚";

  // 🚛 Heavy Vehicles (based on wheels)
  if (value.includes("HGV")) {
    if (value.includes("10")) return "🚛"; // medium heavy
    if (value.includes("12")) return "🚛🚛"; // fake variation
    if (value.includes("14")) return "🚛🚛🚛";
    if (value.includes("16")) return "🚛🚛🚛🚛";
    return "🚛";
  }

  return "🚘"; // fallback
};


  

  return (
    <div className="page">
       <div className="name-board">
<h2>New Fees Chart</h2>

      <div className="row">

       

       <select value={category}  onChange={e => { const value = e.target.value;  setCategory(value); triggerAnimation(value); }} >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input type="date" value={regDate} onChange={handleDateChange} onKeyDown={(e) => {if (e.key === "Enter") {fetchAmount();}  }} />

        <input type="text" value={ageGroup} placeholder="Age Group" readOnly />
        <input type="text" value={vehicleAge} placeholder="Vehicle Age" readOnly />

        <input type="text" value={amount} placeholder="Total Amount" readOnly />

        
        </div>
         {/* <div className="animation-area">
  {animationType && (
    <div className={`vehicle ${animationType} ${animationPhase}`}>
      {animationType === "auto" && "🛺"}
      {animationType === "autoGoods" && "🛺📦"}
      {animationType === "car" && "🚗"}
      {animationType === "car7" && "🚙"}
      {animationType === "ambulance" && "🚑"}
    </div>
  )}
</div> */}


<div className="animation-area">
  {animationType && (
    <div className={`vehicle ${animationPhase}`}>
      {getVehicleIcon(animationType, category)}
    </div>
  )}
</div>


         
<div className="button-wrapper">
  <button onClick={fetchAmount}>FIND AMOUNT</button>
  <button onClick={handleClear} className="clear-btn">CLEAR</button>
</div>



      </div>

      
    </div>
  );
}

export default App;
