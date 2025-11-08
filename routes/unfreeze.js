const express = require('express');
const { AccountFreezeInquiry, StateContacts } = require('../models');
const router = express.Router();

// Get all unfreeze inquiries
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await AccountFreezeInquiry.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  } catch (error) {
    console.error('Error fetching unfreeze inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unfreeze inquiries',
      message: error.message
    });
  }
});

// Get single inquiry by ID
router.get('/inquiry/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const inquiry = await AccountFreezeInquiry.findOne({ inquiryId }).lean();

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiry',
      message: error.message
    });
  }
});

// Get inquiries by state
router.get('/inquiries/state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const inquiries = await AccountFreezeInquiry.find({
      'accountDetails.freezeState': new RegExp(state, 'i')
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  } catch (error) {
    console.error('Error fetching inquiries by state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
      message: error.message
    });
  }
});

// Get inquiries by bank
router.get('/inquiries/bank/:bankName', async (req, res) => {
  try {
    const { bankName } = req.params;
    const inquiries = await AccountFreezeInquiry.find({
      'accountDetails.bankName': new RegExp(bankName, 'i')
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  } catch (error) {
    console.error('Error fetching inquiries by bank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
      message: error.message
    });
  }
});

// Get inquiries frozen by specific state police
router.get('/inquiries/frozen-by/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const inquiries = await AccountFreezeInquiry.find({
      'accountDetails.frozenByStatePolice': new RegExp(state, 'i')
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  } catch (error) {
    console.error('Error fetching inquiries by frozen state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
      message: error.message
    });
  }
});

// Lookup account by account number (simulates WhatsApp flow)
router.post('/lookup', async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'Account number is required'
      });
    }

    // Find inquiry by account number
    const inquiry = await AccountFreezeInquiry.findOne({
      'accountDetails.accountNumber': accountNumber
    }).lean();

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Account not found in frozen accounts database',
        message: 'This account number is not found in our records of frozen accounts.'
      });
    }

    // Get state contacts for the state police who froze the account
    const frozenByState = inquiry.accountDetails.frozenByStatePolice;
    const stateContact = await StateContacts.findOne({
      stateUT: new RegExp(frozenByState, 'i')
    }).lean();

    res.json({
      success: true,
      data: {
        inquiry,
        frozenByState,
        contacts: stateContact || null
      },
      message: `Your account was frozen by ${frozenByState} Police. Contact details provided.`
    });
  } catch (error) {
    console.error('Error looking up account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup account',
      message: error.message
    });
  }
});

// Statistics endpoint
router.get('/stats', async (req, res) => {
  try {
    const totalInquiries = await AccountFreezeInquiry.countDocuments();
    
    // Group by state
    const byState = await AccountFreezeInquiry.aggregate([
      {
        $group: {
          _id: '$accountDetails.freezeState',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Group by bank
    const byBank = await AccountFreezeInquiry.aggregate([
      {
        $group: {
          _id: '$accountDetails.bankName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Group by frozen by state
    const byFrozenState = await AccountFreezeInquiry.aggregate([
      {
        $group: {
          _id: '$accountDetails.frozenByStatePolice',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        total: totalInquiries,
        byState: byState.map(item => ({ state: item._id, count: item.count })),
        byBank: byBank.map(item => ({ bank: item._id, count: item.count })),
        byFrozenState: byFrozenState.map(item => ({ state: item._id, count: item.count }))
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

module.exports = router;
