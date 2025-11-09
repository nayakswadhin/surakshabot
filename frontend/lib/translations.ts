// Static translations for common UI elements
// This avoids API calls for standard interface text

export const translations: Record<string, Record<string, string>> = {
  // Navigation
  'Dashboard': {
    hi: 'डैशबोर्ड',
    or: 'ଡ୍ୟାସବୋର୍ଡ',
  },
  'Complaints': {
    hi: 'शिकायतें',
    or: 'ଅଭିଯୋଗଗୁଡିକ',
  },
  'Analytics & Reports': {
    hi: 'विश्लेषण और रिपोर्ट',
    or: 'ବିଶ୍ଳେଷଣ ଏବଂ ରିପୋର୍ଟଗୁଡିକ',
  },
  'Users': {
    hi: 'उपयोगकर्ता',
    or: 'ବ୍ୟବହାରକାରୀଗଣ',
  },
  'Unfreeze Complaints': {
    hi: 'शिकायतों को अनफ्रीज करें',
    or: 'ଅଭିଯୋଗଗୁଡିକୁ ଅନଫ୍ରିଜ୍ କରନ୍ତୁ',
  },
  'Assistant': {
    hi: 'सहायक',
    or: 'ସହାୟକ',
  },

  // Dashboard
  'Dashboard Overview': {
    hi: 'डैशबोर्ड अवलोकन',
    or: 'ଡ୍ୟାସବୋର୍ଡ ସାରାଂଶ',
  },
  'Total Complaints': {
    hi: 'कुल शिकायतें',
    or: 'ମୋଟ ଅଭିଯୋଗ',
  },
  'Total Solved': {
    hi: 'कुल हल',
    or: 'ମୋଟ ସମାଧାନ',
  },
  'Total Pending': {
    hi: 'कुल लंबित',
    or: 'ମୋଟ ବିଚାରାଧୀନ',
  },
  'Registered Users': {
    hi: 'पंजीकृत उपयोगकर्ता',
    or: 'ପଞ୍ଜୀକୃତ ବ୍ୟବହାରକାରୀ',
  },
  'All time total complaints': {
    hi: 'सभी समय की कुल शिकायतें',
    or: 'ସମସ୍ତ ସମୟର ମୋଟ ଅଭିଯୋଗ',
  },
  'All time total solved': {
    hi: 'सभी समय के कुल हल',
    or: 'ସମସ୍ତ ସମୟର ମୋଟ ସମାଧାନ',
  },
  'All time total pending': {
    hi: 'सभी समय की कुल लंबित',
    or: 'ସମସ୍ତ ସମୟର ମୋଟ ବିଚାରାଧୀନ',
  },
  'All time registered users': {
    hi: 'सभी समय के पंजीकृत उपयोगकर्ता',
    or: 'ସମସ୍ତ ସମୟର ପଞ୍ଜୀକୃତ ବ୍ୟବହାରକାରୀ',
  },
  'Most Common Type of Fraud': {
    hi: 'धोखाधड़ी का सबसे सामान्य प्रकार',
    or: 'ଠକାମର ସବୁଠାରୁ ସାଧାରଣ ପ୍ରକାର',
  },
  'Recent Activity': {
    hi: 'हाल की गतिविधि',
    or: 'ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ',
  },
  'No data available': {
    hi: 'कोई डेटा उपलब्ध नहीं',
    or: 'କୌଣସି ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ',
  },
  'No recent activities': {
    hi: 'कोई हाल की गतिविधि नहीं',
    or: 'କୌଣସି ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ ନାହିଁ',
  },
  'Connection Error': {
    hi: 'कनेक्शन त्रुटि',
    or: 'ସଂଯୋଗ ତ୍ରୁଟି',
  },
  'Make sure the backend server is running on port 3000': {
    hi: 'सुनिश्चित करें कि बैकएंड सर्वर पोर्ट 3000 पर चल रहा है',
    or: 'ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ବ୍ୟାକଏଣ୍ଡ ସର୍ଭର ପୋର୍ଟ 3000 ରେ ଚାଲୁଛି',
  },
  'Try Again': {
    hi: 'पुनः प्रयास करें',
    or: 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ',
  },
  'Run Diagnostic': {
    hi: 'निदान चलाएं',
    or: 'ନିଦାନ ଚଲାନ୍ତୁ',
  },

  // Complaints Page
  'All Complaints': {
    hi: 'सभी शिकायतें',
    or: 'ସମସ୍ତ ଅଭିଯୋଗ',
  },
  'Recent Complaints': {
    hi: 'हाल की शिकायतें',
    or: 'ସାମ୍ପ୍ରତିକ ଅଭିଯୋଗ',
  },
  'View All': {
    hi: 'सभी देखें',
    or: 'ସବୁ ଦେଖନ୍ତୁ',
  },
  'Case ID': {
    hi: 'केस आईडी',
    or: 'କେସ୍ ଆଇଡି',
  },
  'User Name': {
    hi: 'उपयोगकर्ता नाम',
    or: 'ବ୍ୟବହାରକାରୀ ନାମ',
  },
  'User Details': {
    hi: 'उपयोगकर्ता विवरण',
    or: 'ବ୍ୟବହାରକାରୀ ବିବରଣୀ',
  },
  'Fraud Type': {
    hi: 'धोखाधड़ी का प्रकार',
    or: 'ଠକାମ ପ୍ରକାର',
  },
  'Status': {
    hi: 'स्थिति',
    or: 'ସ୍ଥିତି',
  },
  'Date': {
    hi: 'तारीख',
    or: 'ତାରିଖ',
  },
  'Actions': {
    hi: 'कार्य',
    or: 'କାର୍ଯ୍ୟ',
  },
  'View': {
    hi: 'देखें',
    or: 'ଦେଖନ୍ତୁ',
  },
  'Category': {
    hi: 'श्रेणी',
    or: 'ବର୍ଗ',
  },
  'SOLVED': {
    hi: 'हल',
    or: 'ସମାଧାନ',
  },
  'PENDING': {
    hi: 'लंबित',
    or: 'ବିଚାରାଧୀନ',
  },
  'All Status': {
    hi: 'सभी स्थिति',
    or: 'ସମସ୍ତ ସ୍ଥିତି',
  },
  'All Categories': {
    hi: 'सभी श्रेणियां',
    or: 'ସମସ୍ତ ବର୍ଗ',
  },
  'Search by Case ID, Name, Phone...': {
    hi: 'केस आईडी, नाम, फोन से खोजें...',
    or: 'କେସ୍ ଆଇଡି, ନାମ, ଫୋନ୍ ଦ୍ୱାରା ଖୋଜନ୍ତୁ...',
  },
  'Financial': {
    hi: 'वित्तीय',
    or: 'ଆର୍ଥିକ',
  },
  'Social': {
    hi: 'सामाजिक',
    or: 'ସାମାଜିକ',
  },

  // Analytics Page
  'Export': {
    hi: 'निर्यात',
    or: 'ରପ୍ତାନି',
  },
  'Clear': {
    hi: 'साफ़',
    or: 'ସଫା',
  },
  'Solved': {
    hi: 'हल',
    or: 'ସମାଧାନ',
  },
  'Pending': {
    hi: 'लंबित',
    or: 'ବିଚାରାଧୀନ',
  },
  'Resolution Rate': {
    hi: 'समाधान दर',
    or: 'ସମାଧାନ ହାର',
  },
  'Fraud Types': {
    hi: 'धोखाधड़ी के प्रकार',
    or: 'ଠକାମ ପ୍ରକାରଗୁଡିକ',
  },
  'Complaints by Category': {
    hi: 'श्रेणी के अनुसार शिकायतें',
    or: 'ବର୍ଗ ଅନୁଯାୟୀ ଅଭିଯୋଗ',
  },
  'Status Distribution': {
    hi: 'स्थिति वितरण',
    or: 'ସ୍ଥିତି ବଣ୍ଟନ',
  },

  // Users Page
  'Total': {
    hi: 'कुल',
    or: 'ମୋଟ',
  },
  'users': {
    hi: 'उपयोगकर्ता',
    or: 'ବ୍ୟବହାରକାରୀ',
  },
  'complaints': {
    hi: 'शिकायतें',
    or: 'ଅଭିଯୋଗ',
  },
  'Name': {
    hi: 'नाम',
    or: 'ନାମ',
  },
  'Phone': {
    hi: 'फ़ोन',
    or: 'ଫୋନ୍',
  },
  'Email': {
    hi: 'ईमेल',
    or: 'ଇମେଲ୍',
  },
  'District': {
    hi: 'जिला',
    or: 'ଜିଲ୍ଲା',
  },
  'Total Cases': {
    hi: 'कुल मामले',
    or: 'ମୋଟ ମାମଲା',
  },
  'Registered On': {
    hi: 'पंजीकरण तिथि',
    or: 'ପଞ୍ଜୀକରଣ ତାରିଖ',
  },
  'Search by name, phone, email, Aadhar, or district...': {
    hi: 'नाम, फोन, ईमेल, आधार या जिले से खोजें...',
    or: 'ନାମ, ଫୋନ୍, ଇମେଲ୍, ଆଧାର କିମ୍ବା ଜିଲ୍ଲା ଦ୍ୱାରା ଖୋଜନ୍ତୁ...',
  },

  // Unfreeze Page
  'Account Unfreeze Inquiries': {
    hi: 'खाता अनफ्रीज पूछताछ',
    or: 'ଆକାଉଣ୍ଟ ଅନଫ୍ରିଜ୍ ଅନୁସନ୍ଧାନ',
  },
  'Manage and track frozen account inquiries': {
    hi: 'फ्रोजन खाता पूछताछ का प्रबंधन और ट्रैकिंग करें',
    or: 'ଫ୍ରିଜ୍ ହୋଇଥିବା ଆକାଉଣ୍ଟ ଅନୁସନ୍ଧାନର ପରିଚାଳନା ଏବଂ ଟ୍ରାକିଂ',
  },
  'Total Inquiries': {
    hi: 'कुल पूछताछ',
    or: 'ମୋଟ ଅନୁସନ୍ଧାନ',
  },
  'Total Records': {
    hi: 'कुल रिकॉर्ड',
    or: 'ମୋଟ ରେକର୍ଡ',
  },
  'States Covered': {
    hi: 'कवर किए गए राज्य',
    or: 'ଆଚ୍ଛାଦିତ ରାଜ୍ୟ',
  },
  'Banks Involved': {
    hi: 'शामिल बैंक',
    or: 'ସମ୍ପୃକ୍ତ ବ୍ୟାଙ୍କ',
  },
  'Showing Results': {
    hi: 'परिणाम दिखा रहे हैं',
    or: 'ଫଳାଫଳ ଦେଖାଉଛି',
  },
  'Search by Inquiry ID, Name, Phone, Account Number, or Bank...': {
    hi: 'पूछताछ आईडी, नाम, फोन, खाता संख्या या बैंक से खोजें...',
    or: 'ଅନୁସନ୍ଧାନ ଆଇଡି, ନାମ, ଫୋନ୍, ଆକାଉଣ୍ଟ ନମ୍ବର କିମ୍ବା ବ୍ୟାଙ୍କ ଦ୍ୱାରା ଖୋଜନ୍ତୁ...',
  },
  'Filters': {
    hi: 'फ़िल्टर',
    or: 'ଫିଲ୍ଟର',
  },
  'Inquiry ID': {
    hi: 'पूछताछ आईडी',
    or: 'ଅନୁସନ୍ଧାନ ଆଇଡି',
  },
  'Account Number': {
    hi: 'खाता संख्या',
    or: 'ଆକାଉଣ୍ଟ ନମ୍ବର',
  },
  'Bank': {
    hi: 'बैंक',
    or: 'ବ୍ୟାଙ୍କ',
  },
  'Account State': {
    hi: 'खाता स्थिति',
    or: 'ଆକାଉଣ୍ଟ ସ୍ଥିତି',
  },
  'Frozen By': {
    hi: 'फ्रीज किया गया',
    or: 'ଫ୍ରିଜ୍ କରିଛନ୍ତି',
  },
  'Freeze Date': {
    hi: 'फ्रीज की तारीख',
    or: 'ଫ୍ରିଜ୍ ତାରିଖ',
  },

  // Additional UI Elements
  'Monthly Trend': {
    hi: 'मासिक प्रवृत्ति',
    or: 'ମାସିକ ଧାରା',
  },
  'Complaints per Month': {
    hi: 'प्रति माह शिकायतें',
    or: 'ମାସିକ ଅଭିଯୋଗ',
  },
  'District-wise Analysis (Top 10)': {
    hi: 'जिलेवार विश्लेषण (शीर्ष 10)',
    or: 'ଜିଲ୍ଲାଭିତ୍ତିକ ବିଶ୍ଳେଷଣ (ଶୀର୍ଷ 10)',
  },
  'Detailed Breakdown': {
    hi: 'विस्तृत विवरण',
    or: 'ବିସ୍ତୃତ ବିବରଣୀ',
  },
  'Rank': {
    hi: 'रैंक',
    or: 'ର୍ୟାଙ୍କ',
  },
  'Number of Cases': {
    hi: 'मामलों की संख्या',
    or: 'ମାମଲା ସଂଖ୍ୟା',
  },
  'Percentage': {
    hi: 'प्रतिशत',
    or: 'ଶତକଡ଼ା',
  },
  'Previous': {
    hi: 'पिछला',
    or: 'ପୂର୍ବ',
  },
  'Next': {
    hi: 'अगला',
    or: 'ପରବର୍ତ୍ତୀ',
  },
  'to': {
    hi: 'से',
    or: 'ରୁ',
  },
  'Social Media': {
    hi: 'सोशल मीडिया',
    or: 'ସୋସିଆଲ ମିଡିଆ',
  },
  
  // Fraud Types - ALL types that appear in database
  'Debit Card Fraud': {
    hi: 'डेबिट कार्ड धोखाधड़ी',
    or: 'ଡେବିଟ କାର୍ଡ ଠକାମ',
  },
  'UPI Fraud': {
    hi: 'यूपीआई धोखाधड़ी',
    or: 'ୟୁପିଆଇ ଠକାମ',
  },
  'Telegram Fraud': {
    hi: 'टेलीग्राम धोखाधड़ी',
    or: 'ଟେଲିଗ୍ରାମ ଠକାମ',
  },
  'Online Job Fraud': {
    hi: 'ऑनलाइन जॉब धोखाधड़ी',
    or: 'ଅନଲାଇନ ଚାକିରି ଠକାମ',
  },
  'Social Media - Others': {
    hi: 'सोशल मीडिया - अन्य',
    or: 'ସୋସିଆଲ ମିଡିଆ - ଅନ୍ୟାନ୍ୟ',
  },
  'Social Media Fraud': {
    hi: 'सोशल मीडिया धोखाधड़ी',
    or: 'ସୋସିଆଲ ମିଡିଆ ଠକାମ',
  },
  'Facebook Fraud': {
    hi: 'फेसबुक धोखाधड़ी',
    or: 'ଫେସବୁକ ଠକାମ',
  },
  'Instagram Fraud': {
    hi: 'इंस्टाग्राम धोखाधड़ी',
    or: 'ଇନଷ୍ଟାଗ୍ରାମ ଠକାମ',
  },
  'WhatsApp Fraud': {
    hi: 'व्हाट्सएप धोखाधड़ी',
    or: 'ୱାଟସଆପ ଠକାମ',
  },
  'X (Twitter) Fraud': {
    hi: 'एक्स (ट्विटर) धोखाधड़ी',
    or: 'ଏକ୍ସ (ଟ୍ୱିଟର) ଠକାମ',
  },
  'Gmail Fraud': {
    hi: 'जीमेल धोखाधड़ी',
    or: 'ଜିମେଲ ଠକାମ',
  },
  'Fraud Call': {
    hi: 'धोखाधड़ी कॉल',
    or: 'ଠକାମ କଲ',
  },
  'Investment Fraud': {
    hi: 'निवेश धोखाधड़ी',
    or: 'ନିବେଶ ଠକାମ',
  },
  'Phishing': {
    hi: 'फ़िशिंग',
    or: 'ଫିସିଂ',
  },
  'OLX Fraud': {
    hi: 'ओएलएक्स धोखाधड़ी',
    or: 'ଓଏଲଏକ୍ସ ଠକାମ',
  },
  'Credit Card Fraud': {
    hi: 'क्रेडिट कार्ड धोखाधड़ी',
    or: 'କ୍ରେଡିଟ କାର୍ଡ ଠକାମ',
  },
  'Net Banking Fraud': {
    hi: 'नेट बैंकिंग धोखाधड़ी',
    or: 'ନେଟ ବ୍ୟାଙ୍କିଂ ଠକାମ',
  },
  'Lottery Fraud': {
    hi: 'लॉटरी धोखाधड़ी',
    or: 'ଲଟେରୀ ଠକାମ',
  },
  'Romance Fraud': {
    hi: 'रोमांस धोखाधड़ी',
    or: 'ରୋମାନ୍ସ ଠକାମ',
  },
  'Cryptocurrency Fraud': {
    hi: 'क्रिप्टोकरेंसी धोखाधड़ी',
    or: 'କ୍ରିପ୍ଟୋକରେନ୍ସି ଠକାମ',
  },
  'E-Wallet Fraud': {
    hi: 'ई-वॉलेट धोखाधड़ी',
    or: 'ଇ-ୱାଲେଟ ଠକାମ',
  },
  'Customer Care Fraud': {
    hi: 'ग्राहक सेवा धोखाधड़ी',
    or: 'ଗ୍ରାହକ ସେବା ଠକାମ',
  },
  'E-Commerce Fraud': {
    hi: 'ई-कॉमर्स धोखाधड़ी',
    or: 'ଇ-କମର୍ସ ଠକାମ',
  },
  
  // Activity messages
  'New Financial fraud complaint registered': {
    hi: 'नया वित्तीय धोखाधड़ी शिकायत दर्ज',
    or: 'ନୂଆ ଆର୍ଥିକ ଠକାମ ଅଭିଯୋଗ ପଞ୍ଜୀକୃତ',
  },
  'New Social fraud complaint registered': {
    hi: 'नया सोशल धोखाधड़ी शिकायत दर्ज',
    or: 'ନୂଆ ସୋସିଆଲ ଠକାମ ଅଭିଯୋଗ ପଞ୍ଜୀକୃତ',
  },
  'days ago': {
    hi: 'दिन पहले',
    or: 'ଦିନ ପୂର୍ବେ',
  },
  'day ago': {
    hi: 'दिन पहले',
    or: 'ଦିନ ପୂର୍ବେ',
  },
  'hours ago': {
    hi: 'घंटे पहले',
    or: 'ଘଣ୍ଟା ପୂର୍ବେ',
  },
  'hour ago': {
    hi: 'घंटा पहले',
    or: 'ଘଣ୍ଟା ପୂର୍ବେ',
  },
  'minutes ago': {
    hi: 'मिनट पहले',
    or: 'ମିନିଟ୍ ପୂର୍ବେ',
  },
  'minute ago': {
    hi: 'मिनट पहले',
    or: 'ମିନିଟ୍ ପୂର୍ବେ',
  },
  'just now': {
    hi: 'अभी',
    or: 'ବର୍ତ୍ତମାନ',
  },
  'N/A': {
    hi: 'उपलब्ध नहीं',
    or: 'ଉପଲବ୍ଧ ନାହିଁ',
  },
  
  // Header
  'SurakshaBot': {
    hi: 'सुरक्षाबोट',
    or: 'ସୁରକ୍ଷାବଟ୍',
  },
  '1930 Cyber Helpline, India': {
    hi: '1930 साइबर हेल्पलाइन, भारत',
    or: '1930 ସାଇବର ହେଲ୍ପଲାଇନ୍, ଭାରତ',
  },
  'Notifications': {
    hi: 'सूचनाएं',
    or: 'ବିଜ୍ଞପ୍ତି',
  },
  'Mark all': {
    hi: 'सभी को चिह्नित करें',
    or: 'ସମସ୍ତଙ୍କୁ ଚିହ୍ନଟ କରନ୍ତୁ',
  },
  'No notifications yet': {
    hi: 'अभी तक कोई सूचना नहीं',
    or: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ବିଜ୍ଞପ୍ତି ନାହିଁ',
  },
  "You'll see new updates here": {
    hi: 'आपको यहां नए अपडेट दिखाई देंगे',
    or: 'ଆପଣ ଏଠାରେ ନୂତନ ଅପଡେଟ୍ ଦେଖିବେ',
  },
  'Mark as read': {
    hi: 'पढ़ा हुआ चिह्नित करें',
    or: 'ପଢିଥିବା ଭାବରେ ଚିହ୍ନଟ କରନ୍ତୁ',
  },
  'Delete': {
    hi: 'हटाएं',
    or: 'ଡିଲିଟ୍ କରନ୍ତୁ',
  },
  'Admin': {
    hi: 'प्रशासक',
    or: 'ପ୍ରଶାସକ',
  },
  'Settings': {
    hi: 'सेटिंग्स',
    or: 'ସେଟିଂସ୍',
  },
  'Logout': {
    hi: 'लॉगआउट',
    or: 'ଲଗଆଉଟ',
  },
  
  // Common Indian Names (Transliteration to native scripts)
  // Names from your actual database
  'Aditya Shravan': {
    hi: 'आदित्य श्रावण',
    or: 'ଆଦିତ୍ୟ ଶ୍ରାବଣ',
  },
  'Amit Sharma': {
    hi: 'अमित शर्मा',
    or: 'ଅମିତ ଶର୍ମା',
  },
  'Anjali Verma': {
    hi: 'अंजलि वर्मा',
    or: 'ଅଞ୍ଜଲି ବର୍ମା',
  },
  'Asha Reddy': {
    hi: 'आशा रेड्डी',
    or: 'ଆଶା ରେଡ୍ଡି',
  },
  'Deepak Joshi': {
    hi: 'दीपक जोशी',
    or: 'ଦୀପକ ଜୋଶୀ',
  },
  'Kavita Gupta': {
    hi: 'कविता गुप्ता',
    or: 'କବିତା ଗୁପ୍ତା',
  },
  'Manoj Singh': {
    hi: 'मनोज सिंह',
    or: 'ମନୋଜ ସିଂ',
  },
  'Meena Kumari': {
    hi: 'मीना कुमारी',
    or: 'ମୀନା କୁମାରୀ',
  },
  'Neha Singh': {
    hi: 'नेहा सिंह',
    or: 'ନେହା ସିଂ',
  },
  'Pooja Patel': {
    hi: 'पूजा पटेल',
    or: 'ପୂଜା ପଟେଲ',
  },
  'Priya Sharma': {
    hi: 'प्रिया शर्मा',
    or: 'ପ୍ରିୟା ଶର୍ମା',
  },
  'Rahul Verma': {
    hi: 'राहुल वर्मा',
    or: 'ରାହୁଲ ବର୍ମା',
  },
  'Rajesh Kumar': {
    hi: 'राजेश कुमार',
    or: 'ରାଜେଶ କୁମାର',
  },
  'Ravi Shankar': {
    hi: 'रवि शंकर',
    or: 'ରବି ଶଙ୍କର',
  },
  'Rekha Yadav': {
    hi: 'रेखा यादव',
    or: 'ରେଖା ଯାଦବ',
  },
  'Sandeep Yadav': {
    hi: 'संदीप यादव',
    or: 'ସନ୍ଦୀପ ଯାଦବ',
  },
  'Sonia Rao': {
    hi: 'सोनिया राव',
    or: 'ସୋନିଆ ରାଓ',
  },
  'Sunita Devi': {
    hi: 'सुनीता देवी',
    or: 'ସୁନୀତା ଦେବୀ',
  },
  'Suresh Patel': {
    hi: 'सुरेश पटेल',
    or: 'ସୁରେଶ ପଟେଲ',
  },
  'Vijay Gupta': {
    hi: 'विजय गुप्ता',
    or: 'ବିଜୟ ଗୁପ୍ତା',
  },
  
  // Status values
  'solved': {
    hi: 'सुलझा',
    or: 'ସମାଧାନ',
  },
  'pending': {
    hi: 'लंबित',
    or: 'ବିଚାରାଧୀନ',
  },
  
  'No complaints found matching your filters': {
    hi: 'आपके फ़िल्टर से मेल खाने वाली कोई शिकायत नहीं मिली',
    or: 'ଆପଣଙ୍କ ଫିଲ୍ଟର ସହିତ ମେଳ ଖାଉଥିବା କୌଣସି ଅଭିଯୋଗ ମିଳିଲା ନାହିଁ',
  },
  'No users found matching your search': {
    hi: 'आपकी खोज से मेल खाने वाला कोई उपयोगकर्ता नहीं मिला',
    or: 'ଆପଣଙ୍କ ଅନୁସନ୍ଧାନ ସହିତ ମେଳ ଖାଉଥିବା କୌଣସି ବ୍ୟବହାରକାରୀ ମିଳିଲେ ନାହିଁ',
  },
  'Jan': {
    hi: 'जनवरी',
    or: 'ଜାନୁଆରୀ',
  },
  'Feb': {
    hi: 'फरवरी',
    or: 'ଫେବୃଆରୀ',
  },
  'Mar': {
    hi: 'मार्च',
    or: 'ମାର୍ଚ୍ଚ',
  },
  'Apr': {
    hi: 'अप्रैल',
    or: 'ଏପ୍ରିଲ',
  },
  'May': {
    hi: 'मई',
    or: 'ମେ',
  },
  'Jun': {
    hi: 'जून',
    or: 'ଜୁନ',
  },
  'Jul': {
    hi: 'जुलाई',
    or: 'ଜୁଲାଇ',
  },
  'Aug': {
    hi: 'अगस्त',
    or: 'ଅଗଷ୍ଟ',
  },
  'Sep': {
    hi: 'सितंबर',
    or: 'ସେପ୍ଟେମ୍ବର',
  },
  'Oct': {
    hi: 'अक्टूबर',
    or: 'ଅକ୍ଟୋବର',
  },
  'Nov': {
    hi: 'नवंबर',
    or: 'ନଭେମ୍ବର',
  },
  'Dec': {
    hi: 'दिसंबर',
    or: 'ଡିସେମ୍ବର',
  },

  // Heatmap Widget
  'Fraud Heatmap - India': {
    hi: 'धोखाधड़ी हीटमैप - भारत',
    or: 'ଠକାମ ହିଟମ୍ୟାପ - ଭାରତ',
  },
  'Refresh': {
    hi: 'रीफ्रेश',
    or: 'ରିଫ୍ରେସ',
  },
  'Loading heatmap data...': {
    hi: 'हीटमैप डेटा लोड हो रहा है...',
    or: 'ହିଟମ୍ୟାପ ତଥ୍ୟ ଲୋଡ ହେଉଛି...',
  },
  'No location data available': {
    hi: 'कोई स्थान डेटा उपलब्ध नहीं',
    or: 'କୌଣସି ସ୍ଥାନ ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ',
  },
  'Failed to load heatmap data': {
    hi: 'हीटमैप डेटा लोड करने में विफल',
    or: 'ହିଟମ୍ୟାପ ତଥ୍ୟ ଲୋଡ କରିବାରେ ବିଫଳ',
  },
  'Error loading Google Maps. Please check your API key.': {
    hi: 'Google मानचित्र लोड करने में त्रुटि। कृपया अपनी API कुंजी जांचें।',
    or: 'Google ମାନଚିତ୍ର ଲୋଡ କରିବାରେ ତ୍ରୁଟି। ଦୟାକରି ଆପଣଙ୍କର API କି ଯାଞ୍ଚ କରନ୍ତୁ।',
  },
  'Heatmap Legend:': {
    hi: 'हीटमैप किंवदंती:',
    or: 'ହିଟମ୍ୟାପ ଲେଜେଣ୍ଡ:',
  },
  'Low Density': {
    hi: 'कम घनत्व',
    or: 'କମ୍ ଘନତା',
  },
  'Medium Density': {
    hi: 'मध्यम घनत्व',
    or: 'ମଧ୍ୟମ ଘନତା',
  },
  'High Density': {
    hi: 'उच्च घनत्व',
    or: 'ଉଚ୍ଚ ଘନତା',
  },
  'Updated:': {
    hi: 'अद्यतन:',
    or: 'ଅପଡେଟ୍:',
  },
  'Send Alert': {
    hi: 'अलर्ट भेजें',
    or: 'ଆଲର୍ଟ ପଠାନ୍ତୁ',
  },
  'Sending...': {
    hi: 'भेजा जा रहा है...',
    or: 'ପଠାଯାଉଛି...',
  },
  'Alert sent successfully!': {
    hi: 'अलर्ट सफलतापूर्वक भेजा गया!',
    or: 'ଆଲର୍ଟ ସଫଳତାର ସହିତ ପଠାଗଲା!',
  },
  'Failed to send alert': {
    hi: 'अलर्ट भेजने में विफल',
    or: 'ଆଲର୍ଟ ପଠାଇବାରେ ବିଫଳ',
  },
}

/**
 * Get translated text for a given key and language
 * @param text - The English text to translate
 * @param lang - Target language code (hi, or, en)
 * @returns Translated text or original if not found
 */
export function translate(text: string, lang: string = 'en'): string {
  if (lang === 'en' || !text) {
    return text
  }

  const translationEntry = translations[text]
  if (translationEntry && translationEntry[lang]) {
    return translationEntry[lang]
  }

  // Return original text if translation not found
  return text
}

/**
 * Get all translations for a list of texts
 * @param texts - Array of English texts
 * @param lang - Target language code
 * @returns Array of translated texts
 */
export function translateBatch(texts: string[], lang: string = 'en'): string[] {
  return texts.map((text) => translate(text, lang))
}
