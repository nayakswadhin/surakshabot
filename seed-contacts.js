const mongoose = require('mongoose');
const StateContacts = require('./models/StateContacts');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nayakswadhin2:Swadhin%402025@cluster0.mongodb.net/suraksha_bot?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// All contact data from the screenshots
const contactsData = [
  {
    serialNumber: 1,
    stateUT: "ANDAMAN & NICOBAR",
    nodalOfficer: {
      name: "Sh. Jitendra Kumar Meena, IPS",
      rank: "SSP (CID)",
      email: "spcid.and@nic.in"
    },
    grievanceOfficer: {
      name: "Smt. Sindhu Pillai A, IPS",
      rank: "DIGP(Intl.)",
      contact: "03192-232334",
      email: "igp.and@nic.in"
    }
  },
  {
    serialNumber: 2,
    stateUT: "ANDHRA PRADESH",
    nodalOfficer: {
      name: "Mrs Krishna Prasanna Kumari",
      rank: "Superintendent of Police",
      email: "cybercrimes1930@cid.ap.gov.in"
    },
    grievanceOfficer: {
      name: "SP Cyber Crimes, CID",
      rank: "Superintendent of Police",
      contact: "8331043255",
      email: "cybercrimes.cid@ap.gov.in"
    }
  },
  {
    serialNumber: 3,
    stateUT: "ARUNACHAL PRADESH",
    nodalOfficer: {
      name: "Sh. Rohit Rajbir Singh, IPS",
      rank: "S.P (Crime & SIT)",
      email: "spsit@arupol.nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Take Ringu, IPS",
      rank: "IGP (Crime)",
      contact: "9436040703",
      email: "takeringu@ips.gov.in"
    }
  },
  {
    serialNumber: 4,
    stateUT: "ASSAM",
    nodalOfficer: {
      name: "Mrs. Indrani Baruah, IPS",
      rank: "DIGP",
      email: "digp-cid@assampolice.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Debaraj Upadhaya, IPS",
      rank: "IGP,CID",
      contact: "0361-2521618",
      email: "igp-cid@assampolice.gov.in"
    }
  },
  {
    serialNumber: 5,
    stateUT: "BIHAR",
    nodalOfficer: {
      name: "Shri. Sushil Kumar IPS",
      rank: "SP",
      email: "cybercell-bih@nic.in"
    },
    grievanceOfficer: {
      name: "Shri. Rajesh Tripathi",
      rank: "SSP",
      contact: "0612-2238098",
      email: "cybercell-bih@nic.in"
    }
  },
  {
    serialNumber: 6,
    stateUT: "CHANDIGARH",
    nodalOfficer: {
      name: "Ms. Geetanjali Khandelwal, IPS",
      rank: "SP/Cyber Crimes(Nodal Officer)",
      email: "dspcctc.chd@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Raj Kumar Singh, IPS",
      rank: "IGP-UT",
      contact: "0172-2700056",
      email: "dig-chd@nic.in"
    }
  },
  {
    serialNumber: 7,
    stateUT: "CHHATTISGARH",
    nodalOfficer: {
      name: "Sh. Kavi Gupta",
      rank: "AIG",
      email: "aigtech-phq.cg@gov.in"
    },
    grievanceOfficer: {
      name: "Shri Girija Shankar Jaiswal",
      rank: "DIG(Technical Services)",
      contact: "0771-2511989",
      email: "girijashankar.ips.@gov.in"
    }
  },
  {
    serialNumber: 8,
    stateUT: "DADRA & NAGAR HAVELI AND DAMAN & DIU",
    nodalOfficer: {
      name: "Shri Amit Sharma, IPS",
      rank: "SP",
      email: "phq-dd@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Vikramjit Singh, IPS",
      rank: "DIGP",
      contact: "0260-2220140",
      email: "digp-daman-dd@nic.in"
    }
  },
  {
    serialNumber: 9,
    stateUT: "DELHI",
    nodalOfficer: {
      name: "Sh. Vinit Kumar, IPS",
      rank: "DCP/IFSO",
      email: "ncrp.delhi@delhipolice.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Rajneesh Gupta IPS",
      rank: "IT,CP, IFSO Special Cell",
      contact: "011-20892633",
      email: "igintcn.ifospcell@delhipolice.gov.in"
    }
  },
  {
    serialNumber: 10,
    stateUT: "GOA",
    nodalOfficer: {
      name: "Sh.Nidhin Valsan, IPS",
      rank: "SP, Cyber Crime,",
      email: "spcyber@goapolice.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Paramaditya",
      rank: "DIGP",
      contact: "0832-2420883",
      email: "digpgoa@goapolice.gov.in"
    }
  },
  {
    serialNumber: 11,
    stateUT: "GUJARAT",
    nodalOfficer: {
      name: "Shri. Vivek Bheda",
      rank: "Superintendent of Police",
      email: "cc-cid@gujarat.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. S.G. Trivedi",
      rank: "IGP",
      contact: "079-23250798",
      email: "cc-cid@gujarat.gov.in"
    }
  },
  {
    serialNumber: 12,
    stateUT: "HARYANA",
    nodalOfficer: {
      name: "Amit Dahiya, HPS",
      rank: "SP, Cyber",
      email: "dspscbggn@gmail.com"
    },
    grievanceOfficer: {
      name: "Sh. Hamid Akhtar, IPS",
      rank: "DIG SCB-1",
      contact: "0172-2524058",
      email: "sp-cybercrimephq.pol@hry.gov.in"
    }
  },
  {
    serialNumber: 13,
    stateUT: "HIMACHAL PRADESH",
    nodalOfficer: {
      name: "IPS Mohit Chawla",
      rank: "DIG",
      email: "dig-cybercr-hp@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. D. K. Chaudhary",
      rank: "DIGP/Crime",
      contact: "0177-2620331",
      email: "adgp-cid-hp@nic.in"
    }
  },
  {
    serialNumber: 14,
    stateUT: "JAMMU & KASHMIR",
    nodalOfficer: {
      name: "Sh Arun Kumar Choudhary",
      rank: "Spl. DGP",
      email: "igcrime-jk@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. RR Swan",
      rank: "DGP",
      contact: "0191-25822926",
      email: "adgpcidjk@jkpolice.gov.in"
    }
  },
  {
    serialNumber: 15,
    stateUT: "JHARKHAND",
    nodalOfficer: {
      name: "Anuranjan Kisphotta",
      rank: "S.P. Cyber Crime, CID",
      email: "cyberps@jhpolice.gov.in"
    },
    grievanceOfficer: {
      name: "-",
      rank: "S.P. Cyber Crime, CID",
      contact: "0651-2220060",
      email: "cyberps@jhpolice.gov.in"
    }
  },
  {
    serialNumber: 16,
    stateUT: "KARNATAKA",
    nodalOfficer: {
      name: "Sri Ravishankar K",
      rank: "S.P. CT&R, CID",
      email: "cybercrimenodal@ksp.gov.in"
    },
    grievanceOfficer: {
      name: "Sri Shantanu Sinha, IPS",
      rank: "DIG, Cyber Crimes, Narc0tic,CID",
      contact: "080-22942475",
      email: "spctrcid@ksp.gov.in"
    }
  },
  {
    serialNumber: 17,
    stateUT: "KERALA",
    nodalOfficer: {
      name: "HARI SANKAR IPS",
      rank: "Superintendent of Police",
      email: "spcyberops.pol@kerala.gov.in"
    },
    grievanceOfficer: {
      name: "Sh H Venkatesh, IPS",
      rank: "ADCP",
      contact: "0471-2300042",
      email: "adgpcyberops.pol@kerala.gov.in"
    }
  },
  {
    serialNumber: 18,
    stateUT: "LADAKH",
    nodalOfficer: {
      name: "Farhan Jehanzeb Naqash",
      rank: "SP IT PHQ Ladakh",
      email: "spcrime-phq@police.ladakh.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Deepak Digra- JKPS",
      rank: "SP (AIG CIV PHQ UT Ladakh)",
      contact: "9541902324",
      email: "spcivil@police.ladakh.gov.in"
    }
  },
  {
    serialNumber: 19,
    stateUT: "LAKSHADWEEP",
    nodalOfficer: {
      name: "Sh. Prakshay Kumar Singh DANIPS",
      rank: "DSP (HQ)",
      email: "ictus-lk@nic.in"
    },
    grievanceOfficer: {
      name: "Sh.Hareshwar V Swami, IPS",
      rank: "SP (L&O)",
      contact: "04896262258",
      email: "lak-sop@nic.in"
    }
  },
  {
    serialNumber: 20,
    stateUT: "MADHYA PRADESH",
    nodalOfficer: {
      name: "Shri A. Sai Manohar",
      rank: "ADG Cyber",
      email: "adg-cybercell@mppolice.gov.in"
    },
    grievanceOfficer: {
      name: "Shri Shiyas A",
      rank: "DIG Cyber",
      contact: "Not Available",
      email: "dig2-cybercell@mppolice.gov.in"
    }
  },
  {
    serialNumber: 21,
    stateUT: "MAHARASHTRA",
    nodalOfficer: {
      name: "Sh. Yashasvi Yadav",
      rank: "Special IGP",
      email: "ig.cbr-mah@gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Sanjay Vilas Shintre",
      rank: "SP",
      contact: "022-22160080",
      email: "sp.cbr-mah@gov.in"
    }
  },
  {
    serialNumber: 22,
    stateUT: "MANIPUR",
    nodalOfficer: {
      name: "Shri N. John",
      rank: "Superintendent of Police",
      email: "sp-cybercrime.mn@manipur.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Ningshem Worngam",
      rank: "DIGP (Int)",
      contact: "0385-2444888",
      email: "grievance.ncrp@gmail.com"
    }
  },
  {
    serialNumber: 23,
    stateUT: "MEGHALAYA",
    nodalOfficer: {
      name: "Miss. Neena Rabha, MPS",
      rank: "DSP, ACB/CCW",
      email: "ccw-meg@gov.in"
    },
    grievanceOfficer: {
      name: "Pankaj Kumar Rasgania, IPS",
      rank: "SP(Cyber), PHQ",
      contact: "9402519391",
      email: "ccw-meg@gov.in"
    }
  },
  {
    serialNumber: 24,
    stateUT: "MIZORAM",
    nodalOfficer: {
      name: "LALHULIANA FANAI",
      rank: "DIG (CID)",
      email: "cidcrime-mz@nic.in"
    },
    grievanceOfficer: {
      name: "Sh Dewesh Chandra Srivastava, IPS",
      rank: "DGP",
      contact: "0389-2334682",
      email: "polmizo@rediffmail.com"
    }
  },
  {
    serialNumber: 25,
    stateUT: "NAGALAND",
    nodalOfficer: {
      name: "Vikram M Khalate, IPS",
      rank: "IGP(CID)",
      email: "igpcrime-ngl@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Sandeep M. Tamgadge, IPS",
      rank: "ADCP (L&O)",
      contact: "6009308003",
      email: "adgplo.ngl@gov.in"
    }
  },
  {
    serialNumber: 26,
    stateUT: "ODISHA",
    nodalOfficer: {
      name: "Shri. Shefeen Ahamed K, IPS",
      rank: "IGP, CID CB",
      email: "igp2-cidcb@odishapolice.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Arun Bothra, IPS",
      rank: "ADCP",
      contact: "0674-2913100",
      email: "adgcidcb.orpol@nic.in"
    }
  },
  {
    serialNumber: 27,
    stateUT: "PUDUCHERRY",
    nodalOfficer: {
      name: "Sh. Narra Chaitanya, IPS",
      rank: "SSP(Traffic)",
      email: "ssptraffic@py.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. Dr. V.J Chandran",
      rank: "IGP",
      contact: "0413-2231313",
      email: "igp@py.gov.in"
    }
  },
  {
    serialNumber: 28,
    stateUT: "PUNJAB",
    nodalOfficer: {
      name: "Jashandeep Singh Gill",
      rank: "Superintendent of Police",
      email: "aigcc@punjabpolice.gov.in"
    },
    grievanceOfficer: {
      name: "Sh. P. K. Sinha, IPS",
      rank: "ADCP, Cyber Crime",
      contact: "0172-2226258",
      email: "igp.cyber.c.police@punjab.police.gov.in"
    }
  },
  {
    serialNumber: 29,
    stateUT: "RAJASTHAN",
    nodalOfficer: {
      name: "Shri Shantanu Kumar Singh",
      rank: "Superintendent of Police",
      email: "sp.cybercrime@rajpolice.gov.in"
    },
    grievanceOfficer: {
      name: "Shri Sharat Kaviraj",
      rank: "Inspector General of Police",
      contact: "01412821741",
      email: "sp.cybercrime@rajpolice.gov.in"
    }
  },
  {
    serialNumber: 30,
    stateUT: "SIKKIM",
    nodalOfficer: {
      name: "Sh. Kunzang Dorjee Shangdarpa",
      rank: "DIGP",
      email: "spcid@sikkimpolice.nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Abhishek Dahal",
      rank: "Police Inspector/CID",
      contact: "8695622134",
      email: "cybercrime666sk@gmail.com"
    }
  },
  {
    serialNumber: 31,
    stateUT: "TAMIL NADU",
    nodalOfficer: {
      name: "Tmt.M.Kingshlin",
      rank: "Superintendent of Police",
      email: "sp2cwc@gmail.com"
    },
    grievanceOfficer: {
      name: "Sh. D. Ashok Kumar",
      rank: "SP(for OTHER CYBER CRIMES)",
      contact: "044-29580300",
      email: "sp1-ccdtnpolice@gov.in"
    }
  },
  {
    serialNumber: 32,
    stateUT: "TELANGANA",
    nodalOfficer: {
      name: "Shri Devender Singh",
      rank: "SP, Cyber Crimes, TSCSB",
      email: "spoperations-csb-ts@tspolice.gov.in"
    },
    grievanceOfficer: {
      name: "Smt. Shikha Goel, IPS",
      rank: "Director, TSCSB",
      contact: "040-29320049",
      email: "director-tscsb@tspolice.gov.in"
    }
  },
  {
    serialNumber: 33,
    stateUT: "TRIPURA",
    nodalOfficer: {
      name: "MIHIR LAL DAS, TPS",
      rank: "Superintendent of Police",
      email: "spcybercrime@tripurapolice.nic.in"
    },
    grievanceOfficer: {
      name: "Smt. Sudeshna Bhattacharya, TPS",
      rank: "SP (SCRB)",
      contact: "0381-2376979",
      email: "spscrb@tripurapolice.nic.in"
    }
  },
  {
    serialNumber: 34,
    stateUT: "UTTARAKHAND",
    nodalOfficer: {
      name: "P RENUKA DEVI IPS",
      rank: "DIG",
      email: "spstf-uk@nic.in"
    },
    grievanceOfficer: {
      name: "Sh. Ayush Agarwal",
      rank: "SSP/STF",
      contact: "0135-2655900",
      email: "spstf-uk@nic.in"
    }
  },
  {
    serialNumber: 35,
    stateUT: "UTTAR PRADESH",
    nodalOfficer: {
      name: "Rajesh Kumar Yadav",
      rank: "SP",
      email: "sp-cyber.lu@up.gov.in"
    },
    grievanceOfficer: {
      name: "Binod Kumar Singh",
      rank: "ADG",
      contact: "0522-2390538",
      email: "adg-cybercrime.lu@up.gov.in"
    }
  },
  {
    serialNumber: 36,
    stateUT: "WEST BENGAL",
    nodalOfficer: {
      name: "Alok Rajoria, IPS",
      rank: "DIG-1, Cyber Crime Wing",
      email: "ccwwb-ncrp@policewb.gov.in"
    },
    grievanceOfficer: {
      name: "Shri Sanjay Singh, IPS",
      rank: "DG & IGP, Cyber Crime Wing",
      contact: "33-23248072",
      email: "ccwwb-ncrp@policewb.gov.in"
    }
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('🔄 Starting database seeding...\n');
    
    // Clear existing data
    await StateContacts.deleteMany({});
    console.log('✅ Cleared existing contact data\n');
    
    // Insert all contacts
    const result = await StateContacts.insertMany(contactsData);
    console.log(`✅ Successfully inserted ${result.length} state/UT contacts\n`);
    
    // Display summary
    console.log('📊 SUMMARY:');
    console.log('─'.repeat(70));
    result.forEach(contact => {
      console.log(`${contact.serialNumber}. ${contact.stateUT}`);
      console.log(`   Nodal: ${contact.nodalOfficer.name} (${contact.nodalOfficer.email})`);
      console.log(`   Grievance: ${contact.grievanceOfficer.name} (${contact.grievanceOfficer.email})\n`);
    });
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});
