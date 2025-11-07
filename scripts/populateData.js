const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

// Models
const Users = require("../models/Users");
const Cases = require("../models/Cases");
const CaseDetails = require("../models/CaseDetails");

// Cloudinary image URL (same for all documents)
const CLOUDINARY_IMAGE_URL =
  "https://res.cloudinary.com/de2s0mcjo/image/upload/v1762423025/suraksha-bot/financial-fraud/identity-documents/1762423019271_aadhar_pan_1762423019271.jpg";

// Utility helpers
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAadhar() {
  return Array.from({ length: 12 }, () => getRandomInt(0, 9)).join("");
}

function generatePhoneNumber() {
  const first = getRandomInt(6, 9);
  const rest = Array.from({ length: 9 }, () => getRandomInt(0, 9)).join("");
  return `${first}${rest}`;
}

function generateCaseId(idx) {
  return `CC${Date.now()}${idx}${getRandomInt(100, 999)}`;
}

// Date helpers: bias more recent
function getBiasedRecentDate() {
  // 50% last 30 days, 30% 31-60, 20% 61-90
  const r = Math.random();
  let daysBack = 0;
  if (r < 0.5) daysBack = getRandomInt(0, 30);
  else if (r < 0.8) daysBack = getRandomInt(31, 60);
  else daysBack = getRandomInt(61, 90);
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

function getRandomDateTime(eveningBias = false) {
  const date = getBiasedRecentDate();
  if (eveningBias && Math.random() < 0.7) {
    // 70% evening/night 18-02
    const hour = getRandomInt(18, 26) % 24;
    date.setHours(hour, getRandomInt(0, 59), getRandomInt(0, 59));
  } else {
    const hour = getRandomInt(8, 17);
    date.setHours(hour, getRandomInt(0, 59), getRandomInt(0, 59));
  }
  return date;
}

function formatDateTimeObj(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return { date: `${dd}-${mm}-${yyyy}`, time: `${hh}:${min}`, timestamp: date };
}

// Data pools (Indian-like names/places)
const MALE_NAMES = [
  "Rajesh Kumar",
  "Amit Sharma",
  "Rahul Verma",
  "Suresh Patel",
  "Manoj Singh",
  "Vijay Gupta",
  "Sandeep Yadav",
  "Arun Kumar",
  "Deepak Joshi",
  "Ravi Shankar",
];
const FEMALE_NAMES = [
  "Priya Sharma",
  "Anjali Verma",
  "Pooja Patel",
  "Neha Singh",
  "Kavita Gupta",
  "Sunita Devi",
  "Rekha Yadav",
  "Meena Kumari",
  "Sonia Rao",
  "Asha Reddy",
];
const FATHER_NAMES = [
  "Ram Prakash",
  "Shyam Lal",
  "Hari Prasad",
  "Gopal Das",
  "Krishna Murthy",
  "Vishnu Kumar",
  "Shankar Rao",
  "Balaji Reddy",
  "Narayan Singh",
  "Govind Sharma",
];

const CITIES = [
  {
    city: "Mumbai",
    pincodes: ["400001", "400002", "400012", "400020", "400050"],
    areas: ["Colaba", "Bandra", "Andheri", "Borivali", "Powai"],
    district: "Mumbai",
  },
  {
    city: "Delhi",
    pincodes: ["110001", "110016", "110025", "110045", "110092"],
    areas: ["Connaught Place", "Karol Bagh", "Dwarka", "Rohini"],
    district: "New Delhi",
  },
  {
    city: "Bangalore",
    pincodes: ["560001", "560002", "560034", "560066", "560100"],
    areas: ["Koramangala", "Whitefield", "Jayanagar", "Indiranagar"],
    district: "Bengaluru",
  },
  {
    city: "Hyderabad",
    pincodes: ["500001", "500003", "500016", "500032", "500081"],
    areas: ["Banjara Hills", "Madhapur", "Kukatpally", "Gachibowli"],
    district: "Hyderabad",
  },
  {
    city: "Chennai",
    pincodes: ["600001", "600002", "600020", "600042", "600095"],
    areas: ["T Nagar", "Adyar", "Anna Nagar", "Velachery"],
    district: "Chennai",
  },
  {
    city: "Kolkata",
    pincodes: ["700001", "700016", "700027", "700053", "700091"],
    areas: ["Park Street", "Salt Lake", "Howrah", "Rajarhat"],
    district: "Kolkata",
  },
];

// Map of fraud types to values accepted by Cases.typeOfFraud enum
// These MUST match the exact enum values in models/Cases.js
const FINANCIAL_TYPES = [
  "UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)",
  "Customer Care Fraud",
  "Credit Card Fraud",
  "Debit Card Fraud",
  "Loan App Fraud",
  "Investment/Trading/IPO Fraud",
  "E-Wallet Fraud",
  "E-Commerce Fraud",
  "Digital Arrest Fraud",
  "Online Job Fraud",
  "Lottery Fraud",
  "Gaming App Fraud",
  "AEPS Fraud (Aadhar Enabled Payment System)",
  "Insurance Maturity Fraud",
  "Financial - Others",
];
const SOCIAL_TYPES = [
  "Facebook Fraud",
  "Instagram Fraud",
  "X (Twitter) Fraud",
  "WhatsApp Fraud",
  "Telegram Fraud",
  "Hacked Gmail/YouTube",
  "Fraud Call/SMS",
  "Social Media - Others",
];

// Document type pools
const DOCUMENT_TYPES_FIN = [
  "transaction_screenshot",
  "bank_statement",
  "identity_document",
  "complaint_screenshot",
  "communication_proof",
  "aadhar_pan",
];
const DOCUMENT_TYPES_SOC = [
  "request_letter",
  "disputed_screenshots",
  "original_id_screenshot",
  "communication_proof",
  "identity_proof",
];

// Loss generator (weighted)
function generateRandomLoss() {
  const ranges = [
    { min: 1000, max: 10000, weight: 0.3 },
    { min: 10000, max: 50000, weight: 0.4 },
    { min: 50000, max: 200000, weight: 0.2 },
    { min: 200000, max: 500000, weight: 0.1 },
  ];
  const r = Math.random();
  let cumulative = 0;
  for (const range of ranges) {
    cumulative += range.weight;
    if (r <= cumulative) return getRandomInt(range.min, range.max);
  }
  return getRandomInt(1000, 500000);
}

// Connect to MongoDB
async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function populate() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await Users.deleteMany({});
    await Cases.deleteMany({});
    await CaseDetails.deleteMany({});
    console.log("Cleared Users, Cases and CaseDetails collections");

    // Create 50 users
    const users = [];
    const usedAadhars = new Set();
    const usedPhones = new Set();

    for (let i = 0; i < 50; i++) {
      const gender = Math.random() < 0.5 ? "Male" : "Female";
      const name =
        gender === "Male"
          ? getRandomElement(MALE_NAMES)
          : getRandomElement(FEMALE_NAMES);
      const fatherName = getRandomElement(FATHER_NAMES);
      const city = getRandomElement(CITIES);
      const pincode = getRandomElement(city.pincodes);
      const area = getRandomElement(city.areas);

      let aadhar;
      do {
        aadhar = generateAadhar();
      } while (usedAadhars.has(aadhar));
      usedAadhars.add(aadhar);

      let phone;
      do {
        phone = generatePhoneNumber();
      } while (usedPhones.has(phone));
      usedPhones.add(phone);

      const dob = new Date(
        getRandomInt(1954, 2006),
        getRandomInt(0, 11),
        getRandomInt(1, 28)
      );

      const user = new Users({
        aadharNumber: aadhar,
        name: name,
        fatherSpouseGuardianName: fatherName,
        gender,
        emailid: `${name.toLowerCase().replace(/\s+/g, ".")}${getRandomInt(
          1,
          999
        )}@gmail.com`,
        dob,
        phoneNumber: phone,
        freeze: Math.random() < 0.05,
        address: {
          pincode,
          area,
          village: area,
          district: city.district || city.city,
          postOffice: `${area} Post Office`,
          policeStation: `${area} Police Station`,
        },
        createdAt: getBiasedRecentDate(),
        caseIds: [],
      });

      users.push(user);
    }

    await Users.insertMany(users);
    console.log(`Inserted ${users.length} users`);

    // Create 100+ cases
    const casesCreated = [];
    const caseDetailsCreated = [];
    let idx = 0;

    for (const user of users) {
      const numCases = getRandomInt(1, 4); // 1-4 per user
      for (let c = 0; c < numCases && idx < 110; c++) {
        idx++;
        const isSocial = Math.random() < 0.4; // 40% social
        const caseCategory = isSocial ? "Social" : "Financial";
        const typeOfFraud = isSocial
          ? getRandomElement(SOCIAL_TYPES)
          : getRandomElement(FINANCIAL_TYPES);

        const incidentDate = getRandomDateTime(true);
        const fraudDateTime = formatDateTimeObj(incidentDate);

        // Choose a city randomly for fraud location
        const loc = getRandomElement(CITIES);
        const fraudLocation = {
          pincode: getRandomElement(loc.pincodes),
          area: getRandomElement(loc.areas),
          district: loc.district,
          postOffice: `${getRandomElement(loc.areas)} Post Office`,
        };

        const incidentDescription = isSocial
          ? `${getRandomElement([
              "Account hacked",
              "Impersonation",
              "Blackmail",
            ])} on social platform: ${typeOfFraud}`
          : `${getRandomElement([
              "Unauthorised debit",
              "Phishing",
              "Fake payment link",
            ])} resulting in loss of Rs. ${generateRandomLoss().toLocaleString(
              "en-IN"
            )}`;

        const caseIdStr = generateCaseId(idx);

        // Create case document
        const caseDoc = new Cases({
          caseId: caseIdStr,
          aadharNumber: user.aadharNumber,
          incidentDescription,
          fraudLocation,
          fraudDateTime,
          caseCategory,
          typeOfFraud,
          status: Math.random() < 0.85 ? "pending" : "solved",
          createdAt: incidentDate,
        });

        const savedCase = await caseDoc.save();
        user.caseIds.push(savedCase._id);
        casesCreated.push(savedCase);

        // Create case details
        const numDocs = getRandomInt(3, 6);
        const docTypes = isSocial ? DOCUMENT_TYPES_SOC : DOCUMENT_TYPES_FIN;
        const photos = [];
        for (let d = 0; d < numDocs; d++) {
          photos.push({
            documentType: getRandomElement(docTypes),
            url: CLOUDINARY_IMAGE_URL,
            fileName: `doc_${savedCase._id}_${d}.jpg`,
            publicId: `suraksha-bot/${savedCase._id}_doc_${d}`,
            uploadedAt: new Date(incidentDate.getTime() + d * 60000),
          });
        }

        const allegedUrls = isSocial
          ? [
              `https://facebook.com/fake${getRandomInt(1000, 9999)}`,
              `https://instagram.com/fake${getRandomInt(1000, 9999)}`,
            ].slice(0, getRandomInt(1, 2))
          : [];

        const caseDetail = new CaseDetails({
          photos,
          metaRegistrationDone: isSocial ? Math.random() < 0.6 : false,
          isImpersonationCase: isSocial ? Math.random() < 0.7 : false,
          allegedUrls,
          originalIdUrls: isSocial
            ? [
                `https://facebook.com/real.${user.name
                  .toLowerCase()
                  .replace(/\s+/g, ".")}`,
              ]
            : [],
          createdAt: incidentDate,
        });

        const savedCaseDetail = await caseDetail.save();
        caseDetailsCreated.push(savedCaseDetail);

        // Link caseDetailsId back to case
        savedCase.caseDetailsId = savedCaseDetail._id;
        await savedCase.save();
      }

      // save user with updated caseIds
      await user.save();
    }

    console.log(
      `Created ${casesCreated.length} cases and ${caseDetailsCreated.length} case details`
    );

    // Summary stats
    const pending = casesCreated.filter((c) => c.status === "pending").length;
    const solved = casesCreated.filter((c) => c.status === "solved").length;
    const eveningNight = casesCreated.filter((c) => {
      const hr = new Date(c.createdAt).getHours();
      return hr >= 18 || hr <= 2;
    }).length;
    const recent30 = casesCreated.filter(
      (c) =>
        new Date(c.createdAt) >=
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          return d;
        })()
    ).length;

    console.log("--- Summary ---");
    console.log(`Users: ${users.length}`);
    console.log(`Cases: ${casesCreated.length}`);
    console.log(`CaseDetails: ${caseDetailsCreated.length}`);
    console.log(`Pending: ${pending} | Solved: ${solved}`);
    console.log(
      `Evening/Night cases: ${eveningNight} (${Math.round(
        (eveningNight / casesCreated.length) * 100
      )}%)`
    );
    console.log(`Last 30 days: ${recent30}`);

    console.log("Population complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error in population:", err);
    process.exit(1);
  }
}

// Run
populate();
