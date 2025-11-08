const axios = require('axios');

axios.get('http://localhost:3000/api/whatsapp/case/CC176251415829441143')
  .then(res => {
    console.log('✅ API Response Structure:');
    console.log('Has complaint:', !!res.data.data.complaint);
    console.log('Has user:', !!res.data.data.user);
    
    if (res.data.data.complaint) {
      console.log('\n✅ Complaint Data:', {
        caseId: res.data.data.complaint.caseId,
        status: res.data.data.complaint.status,
        typeOfFraud: res.data.data.complaint.typeOfFraud
      });
    }
    
    if (res.data.data.user) {
      console.log('\n✅ User Data:', {
        name: res.data.data.user.name,
        phoneNumber: res.data.data.user.phoneNumber,
        aadharNumber: res.data.data.user.aadharNumber
      });
    }
    
    if (!res.data.data.complaint && !res.data.data.user) {
      console.log('\n❌ OLD FORMAT - Data returned directly without complaint/user wrapper');
    }
  })
  .catch(err => console.error('Error:', err.message));
