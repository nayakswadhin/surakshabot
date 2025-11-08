const express = require("express");
const router = express.Router();
const Cases = require("../models/Cases");
const Users = require("../models/Users");

// Chatbot query endpoint
router.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await handleChatbotQuery(message);

    res.json({
      success: true,
      response: response.message,
      data: response.data,
      links: response.links,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chatbot query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process query",
      error: error.message,
    });
  }
});

// Get statistics endpoint
router.get("/stats", async (req, res) => {
  try {
    const stats = await getComplaintStatistics();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

// Helper function to get complaint statistics
async function getComplaintStatistics() {
  try {
    const [
      totalComplaints,
      solvedComplaints,
      pendingComplaints,
      underReviewComplaints,
      investigatingComplaints,
      rejectedComplaints,
      urgentComplaints,
      highPriorityComplaints,
      longPendingComplaints,
      todayComplaints,
      thisWeekComplaints,
      thisMonthComplaints,
      categoryStats,
      fraudTypeStats,
    ] = await Promise.all([
      // Total complaints
      Cases.countDocuments(),

      // Status-based counts
      Cases.countDocuments({ status: "solved" }),
      Cases.countDocuments({ status: "pending" }),
      Cases.countDocuments({ status: "under_review" }),
      Cases.countDocuments({ status: "investigating" }),
      Cases.countDocuments({ status: "rejected" }),

      // Priority-based counts
      Cases.countDocuments({ priority: "urgent" }),
      Cases.countDocuments({ priority: "high" }),

      // Long pending (more than 30 days old and still pending)
      Cases.countDocuments({
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),

      // Time-based counts
      Cases.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Cases.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Cases.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),

      // Category breakdown
      Cases.aggregate([
        { $group: { _id: "$caseCategory", count: { $sum: 1 } } },
      ]),

      // Fraud type breakdown (top 10)
      Cases.aggregate([
        { $group: { _id: "$typeOfFraud", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const categoryBreakdown = {};
    categoryStats.forEach((cat) => {
      categoryBreakdown[cat._id] = cat.count;
    });

    const fraudTypeBreakdown = {};
    fraudTypeStats.forEach((fraud) => {
      fraudTypeBreakdown[fraud._id] = fraud.count;
    });

    return {
      total: totalComplaints,
      byStatus: {
        solved: solvedComplaints,
        pending: pendingComplaints,
        under_review: underReviewComplaints,
        investigating: investigatingComplaints,
        rejected: rejectedComplaints,
      },
      byPriority: {
        urgent: urgentComplaints,
        high: highPriorityComplaints,
      },
      longPending: longPendingComplaints,
      timeBasedStats: {
        today: todayComplaints,
        thisWeek: thisWeekComplaints,
        thisMonth: thisMonthComplaints,
      },
      categoryBreakdown,
      topFraudTypes: fraudTypeBreakdown,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}

// Helper function to handle chatbot queries with natural language understanding
async function handleChatbotQuery(message) {
  const lowerMessage = message.toLowerCase();

  try {
    // Get statistics for various queries
    const stats = await getComplaintStatistics();

    // ============================================
    // LOCATION-BASED QUERIES
    // ============================================

    // District/City/Location-based queries
    if (
      lowerMessage.includes("from") &&
      (lowerMessage.includes("district") ||
        lowerMessage.includes("city") ||
        lowerMessage.includes("area") ||
        lowerMessage.includes("hyderabad") ||
        lowerMessage.includes("bhubaneswar") ||
        lowerMessage.includes("cuttack") ||
        lowerMessage.includes("puri") ||
        lowerMessage.includes("berhampur"))
    ) {
      // Extract location name
      let location = "";
      const locationKeywords = [
        "hyderabad",
        "bhubaneswar",
        "cuttack",
        "puri",
        "berhampur",
        "khorda",
        "ganjam",
        "balasore",
        "sambalpur",
      ];

      for (const keyword of locationKeywords) {
        if (lowerMessage.includes(keyword)) {
          location = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }

      if (!location) {
        // Try to extract location after "from"
        const fromIndex = lowerMessage.indexOf("from");
        if (fromIndex !== -1) {
          const afterFrom = lowerMessage.substring(fromIndex + 4).trim();
          const words = afterFrom.split(/[\s,?!.]+/);
          location = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        }
      }

      if (location) {
        // Search in Users collection for matching district/area
        const usersFromLocation = await Users.find({
          $or: [
            { "address.district": new RegExp(location, "i") },
            { "address.area": new RegExp(location, "i") },
            { "address.village": new RegExp(location, "i") },
          ],
        });

        const aadharNumbers = usersFromLocation.map((u) => u.aadharNumber);

        if (aadharNumbers.length > 0) {
          const casesFromLocation = await Cases.find({
            aadharNumber: { $in: aadharNumbers },
          });

          // Get status breakdown
          const statusBreakdown = {};
          const fraudTypeBreakdown = {};

          casesFromLocation.forEach((c) => {
            statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
            fraudTypeBreakdown[c.typeOfFraud] =
              (fraudTypeBreakdown[c.typeOfFraud] || 0) + 1;
          });

          let responseMsg = `Cases from ${location}: ${casesFromLocation.length}\n\n`;

          if (casesFromLocation.length > 0) {
            responseMsg += `Status Breakdown:\n`;
            Object.entries(statusBreakdown).forEach(([status, count]) => {
              responseMsg += `- ${status}: ${count}\n`;
            });

            responseMsg += `\nTop Fraud Types in ${location}:\n`;
            const topFrauds = Object.entries(fraudTypeBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);
            topFrauds.forEach(([type, count], idx) => {
              responseMsg += `${idx + 1}. ${type}: ${count}\n`;
            });
          } else {
            responseMsg += `No cases found from ${location}.`;
          }

          return {
            message: responseMsg,
            data: {
              location,
              totalCases: casesFromLocation.length,
              statusBreakdown,
              fraudTypeBreakdown,
            },
            links: [{ text: `View ${location} Cases`, url: "/complaints" }],
          };
        } else {
          return {
            message: `No users or cases found from ${location}.\n\nThis could mean:\n- No complaints registered from this location\n- Location name might be spelled differently\n\nTry another location or check the spelling.`,
            data: { location, totalCases: 0 },
            links: [{ text: "View All Cases", url: "/complaints" }],
          };
        }
      }
    }

    // ============================================
    // AADHAR-BASED QUERIES
    // ============================================

    // Aadhar number queries
    if (
      (lowerMessage.includes("aadhar") || lowerMessage.includes("aadhaar")) &&
      (lowerMessage.includes("number") || /\d{12}/.test(message))
    ) {
      const aadharMatch = message.match(/\d{12}/);

      if (aadharMatch) {
        const aadharNumber = aadharMatch[0];

        const user = await Users.findOne({ aadharNumber });
        const userCases = await Cases.find({ aadharNumber });

        if (user) {
          let responseMsg = `User Details:\n`;
          responseMsg += `Name: ${user.name}\n`;
          responseMsg += `Phone: ${user.phoneNumber}\n`;
          responseMsg += `Location: ${user.address.district}, ${user.address.area}\n\n`;
          responseMsg += `Total Cases: ${userCases.length}\n\n`;

          if (userCases.length > 0) {
            const statusCount = {};
            userCases.forEach((c) => {
              statusCount[c.status] = (statusCount[c.status] || 0) + 1;
            });

            responseMsg += `Status Breakdown:\n`;
            Object.entries(statusCount).forEach(([status, count]) => {
              responseMsg += `- ${status}: ${count}\n`;
            });

            responseMsg += `\nRecent Cases:\n`;
            userCases.slice(0, 3).forEach((c, idx) => {
              responseMsg += `${idx + 1}. ${c.caseId} - ${c.typeOfFraud} (${
                c.status
              })\n`;
            });
          }

          return {
            message: responseMsg,
            data: { user, cases: userCases },
            links: [{ text: "View All User Cases", url: "/complaints" }],
          };
        } else {
          return {
            message: `No user found with Aadhar number: ${aadharNumber}`,
            data: null,
            links: [],
          };
        }
      } else {
        return {
          message: `Please provide a valid 12-digit Aadhar number.\n\nExample: "Show cases for Aadhar 123456789012"`,
          data: null,
          links: [],
        };
      }
    }

    // ============================================
    // FRAUD TYPE SPECIFIC QUERIES
    // ============================================

    // Specific fraud type queries
    const fraudTypes = [
      "upi",
      "investment",
      "customer care",
      "apk",
      "job",
      "debit card",
      "credit card",
      "e-commerce",
      "loan",
      "sextortion",
      "olx",
      "lottery",
      "hotel booking",
      "gaming",
      "wallet",
      "digital arrest",
      "fake website",
      "ticket booking",
      "insurance",
      "facebook",
      "instagram",
      "twitter",
      "whatsapp",
      "telegram",
      "gmail",
      "youtube",
      "fraud call",
    ];

    for (const fraudType of fraudTypes) {
      if (lowerMessage.includes(fraudType)) {
        const matchingCases = await Cases.find({
          typeOfFraud: new RegExp(fraudType, "i"),
        });

        if (matchingCases.length > 0) {
          const statusBreakdown = {};
          matchingCases.forEach((c) => {
            statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
          });

          let responseMsg = `${fraudType.toUpperCase()} Fraud Cases: ${
            matchingCases.length
          }\n\n`;
          responseMsg += `Status Breakdown:\n`;
          Object.entries(statusBreakdown).forEach(([status, count]) => {
            responseMsg += `- ${status}: ${count}\n`;
          });

          // Recent cases
          responseMsg += `\nRecent Cases:\n`;
          matchingCases.slice(0, 5).forEach((c, idx) => {
            const daysOld = Math.floor(
              (Date.now() - new Date(c.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            responseMsg += `${idx + 1}. ${c.caseId} - ${
              c.status
            } (${daysOld} days old)\n`;
          });

          return {
            message: responseMsg,
            data: {
              fraudType,
              totalCases: matchingCases.length,
              statusBreakdown,
            },
            links: [{ text: `View ${fraudType} Cases`, url: "/complaints" }],
          };
        }
      }
    }

    // ============================================
    // DATE RANGE QUERIES
    // ============================================

    // Date range queries
    if (
      (lowerMessage.includes("last") &&
        (lowerMessage.includes("days") ||
          lowerMessage.includes("week") ||
          lowerMessage.includes("month"))) ||
      (lowerMessage.includes("between") && lowerMessage.includes("and")) ||
      lowerMessage.includes("since") ||
      lowerMessage.includes("before")
    ) {
      let dateFilter = {};
      let rangeDescription = "";

      // Last X days
      const lastDaysMatch = lowerMessage.match(/last\s+(\d+)\s+days?/);
      if (lastDaysMatch) {
        const days = parseInt(lastDaysMatch[1]);
        dateFilter = {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        };
        rangeDescription = `last ${days} days`;
      }

      // Last X weeks
      const lastWeeksMatch = lowerMessage.match(/last\s+(\d+)\s+weeks?/);
      if (lastWeeksMatch) {
        const weeks = parseInt(lastWeeksMatch[1]);
        dateFilter = {
          createdAt: {
            $gte: new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000),
          },
        };
        rangeDescription = `last ${weeks} weeks`;
      }

      // Last X months
      const lastMonthsMatch = lowerMessage.match(/last\s+(\d+)\s+months?/);
      if (lastMonthsMatch) {
        const months = parseInt(lastMonthsMatch[1]);
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        dateFilter = { createdAt: { $gte: date } };
        rangeDescription = `last ${months} months`;
      }

      if (Object.keys(dateFilter).length > 0) {
        const casesInRange = await Cases.find(dateFilter);

        const statusBreakdown = {};
        casesInRange.forEach((c) => {
          statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
        });

        let responseMsg = `📅 **Cases in ${rangeDescription}: ${casesInRange.length}**\n\n`;
        responseMsg += `**Status Breakdown:**\n`;
        Object.entries(statusBreakdown).forEach(([status, count]) => {
          responseMsg += `• ${status}: ${count}\n`;
        });

        return {
          message: responseMsg,
          data: {
            range: rangeDescription,
            totalCases: casesInRange.length,
            statusBreakdown,
          },
          links: [{ text: "View These Cases", url: "/complaints" }],
        };
      }
    }

    // ============================================
    // OFFICER ASSIGNMENT QUERIES
    // ============================================

    // Officer-related queries
    if (
      lowerMessage.includes("assigned") ||
      lowerMessage.includes("officer") ||
      lowerMessage.includes("unassigned")
    ) {
      if (
        lowerMessage.includes("unassigned") ||
        lowerMessage.includes("not assigned")
      ) {
        const unassignedCases = await Cases.find({
          $or: [
            { "assignedTo.officerId": { $exists: false } },
            { "assignedTo.officerId": null },
            { "assignedTo.officerId": "" },
          ],
        });

        return {
          message: `⚠️ **Unassigned Cases: ${unassignedCases.length}**\n\nThese cases need officer assignment urgently!`,
          data: { unassigned: unassignedCases.length },
          links: [{ text: "View Unassigned Cases", url: "/complaints" }],
        };
      } else {
        const assignedCases = await Cases.find({
          "assignedTo.officerId": { $exists: true, $ne: null, $ne: "" },
        });

        // Group by officer
        const officerCaseCount = {};
        assignedCases.forEach((c) => {
          const officerName = c.assignedTo.officerName || "Unknown";
          officerCaseCount[officerName] =
            (officerCaseCount[officerName] || 0) + 1;
        });

        let responseMsg = `👮 **Assigned Cases: ${assignedCases.length}**\n\n`;
        responseMsg += `**Cases by Officer:**\n`;
        Object.entries(officerCaseCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([officer, count], idx) => {
            responseMsg += `${idx + 1}. ${officer}: ${count} cases\n`;
          });

        return {
          message: responseMsg,
          data: {
            assigned: assignedCases.length,
            officerBreakdown: officerCaseCount,
          },
          links: [{ text: "View Assigned Cases", url: "/complaints" }],
        };
      }
    }

    // ============================================
    // PRIORITY COMBINATION QUERIES
    // ============================================

    // Priority + Status combination queries
    if (
      (lowerMessage.includes("urgent") ||
        lowerMessage.includes("high priority")) &&
      (lowerMessage.includes("pending") || lowerMessage.includes("unsolved"))
    ) {
      const urgentPendingCases = await Cases.find({
        priority: { $in: ["urgent", "high"] },
        status: "pending",
      }).sort({ createdAt: 1 });

      let responseMsg = `🚨 **Urgent Pending Cases: ${urgentPendingCases.length}**\n\n`;
      responseMsg += `These cases need IMMEDIATE attention!\n\n`;

      if (urgentPendingCases.length > 0) {
        responseMsg += `**Top 5 Oldest:**\n`;
        urgentPendingCases.slice(0, 5).forEach((c, idx) => {
          const daysOld = Math.floor(
            (Date.now() - new Date(c.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          responseMsg += `${idx + 1}. ${c.caseId} - ${
            c.typeOfFraud
          } (${daysOld} days old)\n`;
        });
      }

      return {
        message: responseMsg,
        data: {
          urgentPending: urgentPendingCases.length,
          cases: urgentPendingCases,
        },
        links: [
          {
            text: "View Urgent Pending",
            url: "/complaints?priority=urgent&status=pending",
          },
        ],
      };
    }

    // ============================================
    // COMPARATIVE QUERIES
    // ============================================

    // Comparison queries (more/most/highest)
    if (
      lowerMessage.includes("most") ||
      lowerMessage.includes("highest") ||
      lowerMessage.includes("maximum") ||
      (lowerMessage.includes("which") &&
        (lowerMessage.includes("area") || lowerMessage.includes("district")))
    ) {
      // Find area/district with most cases
      const allUsers = await Users.find();
      const locationCaseCount = {};

      for (const user of allUsers) {
        const location = user.address.district || user.address.area;
        const userCaseCount = await Cases.countDocuments({
          aadharNumber: user.aadharNumber,
        });
        locationCaseCount[location] =
          (locationCaseCount[location] || 0) + userCaseCount;
      }

      const sortedLocations = Object.entries(locationCaseCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let responseMsg = `Areas with Most Cases:\n\n`;
      sortedLocations.forEach(([location, count], idx) => {
        responseMsg += `${idx + 1}. ${location}: ${count} cases\n`;
      });

      return {
        message: responseMsg,
        data: { locationBreakdown: Object.fromEntries(sortedLocations) },
        links: [{ text: "View Analytics", url: "/analytics" }],
      };
    }

    // ============================================
    // DEMOGRAPHIC QUERIES (Gender, Age, etc.)
    // ============================================

    // Gender-based queries
    if (
      (lowerMessage.includes("male") ||
        lowerMessage.includes("female") ||
        lowerMessage.includes("gender")) &&
      (lowerMessage.includes("case") ||
        lowerMessage.includes("complaint") ||
        lowerMessage.includes("how many"))
    ) {
      let genderFilter = null;
      let genderName = "";

      if (lowerMessage.includes("male") && !lowerMessage.includes("female")) {
        genderFilter = "Male";
        genderName = "Male";
      } else if (lowerMessage.includes("female")) {
        genderFilter = "Female";
        genderName = "Female";
      }

      if (genderFilter) {
        // Find users of specific gender
        const usersOfGender = await Users.find({ gender: genderFilter });
        const aadharNumbers = usersOfGender.map((u) => u.aadharNumber);

        // Find cases for these users
        const casesOfGender = await Cases.find({
          aadharNumber: { $in: aadharNumbers },
        });

        // Get breakdown
        const statusBreakdown = {};
        const fraudTypeBreakdown = {};
        const ageGroups = {
          "18-25": 0,
          "26-35": 0,
          "36-45": 0,
          "46-60": 0,
          "60+": 0,
        };

        casesOfGender.forEach((c) => {
          statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
          fraudTypeBreakdown[c.typeOfFraud] =
            (fraudTypeBreakdown[c.typeOfFraud] || 0) + 1;
        });

        // Calculate age groups
        usersOfGender.forEach((user) => {
          if (user.dob) {
            const age = Math.floor(
              (Date.now() - new Date(user.dob).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25)
            );
            if (age >= 18 && age <= 25) ageGroups["18-25"]++;
            else if (age >= 26 && age <= 35) ageGroups["26-35"]++;
            else if (age >= 36 && age <= 45) ageGroups["36-45"]++;
            else if (age >= 46 && age <= 60) ageGroups["46-60"]++;
            else if (age > 60) ageGroups["60+"]++;
          }
        });

        let responseMsg = `${genderName} Cases: ${casesOfGender.length}\n`;
        responseMsg += `Total ${genderName} Users: ${usersOfGender.length}\n\n`;

        responseMsg += `Status Breakdown:\n`;
        Object.entries(statusBreakdown).forEach(([status, count]) => {
          responseMsg += `- ${status}: ${count}\n`;
        });

        responseMsg += `\nAge Groups:\n`;
        Object.entries(ageGroups)
          .filter(([_, count]) => count > 0)
          .forEach(([group, count]) => {
            responseMsg += `- ${group} years: ${count} users\n`;
          });

        responseMsg += `\nTop Fraud Types:\n`;
        Object.entries(fraudTypeBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([type, count], idx) => {
            responseMsg += `${idx + 1}. ${type}: ${count}\n`;
          });

        return {
          message: responseMsg,
          data: {
            gender: genderName,
            totalCases: casesOfGender.length,
            totalUsers: usersOfGender.length,
            statusBreakdown,
            ageGroups,
            fraudTypeBreakdown,
          },
          links: [
            { text: `View ${genderName} Cases`, url: "/complaints" },
            { text: "View Analytics", url: "/analytics" },
          ],
        };
      } else {
        // Show breakdown by all genders
        const genderStats = {};

        for (const gender of ["Male", "Female", "Others"]) {
          const usersOfGender = await Users.find({ gender });
          const aadharNumbers = usersOfGender.map((u) => u.aadharNumber);
          const casesCount = await Cases.countDocuments({
            aadharNumber: { $in: aadharNumbers },
          });

          genderStats[gender] = {
            users: usersOfGender.length,
            cases: casesCount,
          };
        }

        let responseMsg = `👥 **Cases by Gender:**\n\n`;
        Object.entries(genderStats).forEach(([gender, data]) => {
          responseMsg += `**${gender}:**\n`;
          responseMsg += `• Users: ${data.users}\n`;
          responseMsg += `• Cases: ${data.cases}\n\n`;
        });

        return {
          message: responseMsg,
          data: genderStats,
          links: [
            { text: "View All Cases", url: "/complaints" },
            { text: "View Analytics", url: "/analytics" },
          ],
        };
      }
    }

    // Age-based queries
    if (
      (lowerMessage.includes("age") ||
        lowerMessage.includes("young") ||
        lowerMessage.includes("old") ||
        lowerMessage.includes("senior") ||
        lowerMessage.includes("youth")) &&
      (lowerMessage.includes("case") ||
        lowerMessage.includes("complaint") ||
        lowerMessage.includes("how many"))
    ) {
      const allUsers = await Users.find();
      const ageGroups = {
        "18-25": { users: [], cases: 0 },
        "26-35": { users: [], cases: 0 },
        "36-45": { users: [], cases: 0 },
        "46-60": { users: [], cases: 0 },
        "60+": { users: [], cases: 0 },
      };

      // Categorize users by age
      allUsers.forEach((user) => {
        if (user.dob) {
          const age = Math.floor(
            (Date.now() - new Date(user.dob).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
          );

          if (age >= 18 && age <= 25)
            ageGroups["18-25"].users.push(user.aadharNumber);
          else if (age >= 26 && age <= 35)
            ageGroups["26-35"].users.push(user.aadharNumber);
          else if (age >= 36 && age <= 45)
            ageGroups["36-45"].users.push(user.aadharNumber);
          else if (age >= 46 && age <= 60)
            ageGroups["46-60"].users.push(user.aadharNumber);
          else if (age > 60) ageGroups["60+"].users.push(user.aadharNumber);
        }
      });

      // Count cases for each age group
      for (const [group, data] of Object.entries(ageGroups)) {
        if (data.users.length > 0) {
          data.cases = await Cases.countDocuments({
            aadharNumber: { $in: data.users },
          });
        }
      }

      let responseMsg = `Cases by Age Group:\n\n`;
      Object.entries(ageGroups).forEach(([group, data]) => {
        if (data.users.length > 0) {
          responseMsg += `${group} years:\n`;
          responseMsg += `- Users: ${data.users.length}\n`;
          responseMsg += `- Cases: ${data.cases}\n`;
          responseMsg += `- Avg cases per user: ${(
            data.cases / data.users.length
          ).toFixed(2)}\n\n`;
        }
      });

      // Find most vulnerable age group
      const mostVulnerable = Object.entries(ageGroups)
        .filter(([_, data]) => data.users.length > 0)
        .sort(
          (a, b) =>
            b[1].cases / b[1].users.length - a[1].cases / a[1].users.length
        )[0];

      if (mostVulnerable) {
        responseMsg += `Most vulnerable: ${mostVulnerable[0]} years age group`;
      }

      return {
        message: responseMsg,
        data: ageGroups,
        links: [{ text: "View Analytics", url: "/analytics" }],
      };
    }

    // Phone number pattern queries
    if (
      (lowerMessage.includes("phone") ||
        lowerMessage.includes("mobile") ||
        lowerMessage.includes("number")) &&
      /\d{10}/.test(message) &&
      (lowerMessage.includes("case") || lowerMessage.includes("complaint"))
    ) {
      const phoneMatch = message.match(/\d{10}/);

      if (phoneMatch) {
        const phoneNumber = phoneMatch[0];

        const user = await Users.findOne({ phoneNumber });

        if (user) {
          const userCases = await Cases.find({
            aadharNumber: user.aadharNumber,
          });

          let responseMsg = `User Details (Phone: ${phoneNumber}):\n`;
          responseMsg += `Name: ${user.name}\n`;
          responseMsg += `Gender: ${user.gender}\n`;
          responseMsg += `Location: ${user.address.district}, ${user.address.area}\n\n`;
          responseMsg += `Total Cases: ${userCases.length}\n\n`;

          if (userCases.length > 0) {
            responseMsg += `Recent Cases:\n`;
            userCases.slice(0, 5).forEach((c, idx) => {
              responseMsg += `${idx + 1}. ${c.caseId} - ${c.typeOfFraud} (${
                c.status
              })\n`;
            });
          }

          return {
            message: responseMsg,
            data: { user, cases: userCases },
            links: [{ text: "View User Cases", url: "/complaints" }],
          };
        } else {
          return {
            message: `No user found with phone number: ${phoneNumber}`,
            data: null,
            links: [],
          };
        }
      }
    }

    // Case ID specific queries
    if (
      (lowerMessage.includes("case") || lowerMessage.includes("complaint")) &&
      (lowerMessage.includes("id") || lowerMessage.includes("#")) &&
      (lowerMessage.includes("show") ||
        lowerMessage.includes("details") ||
        lowerMessage.includes("status"))
    ) {
      // Try to extract case ID pattern
      const caseIdMatch = message.match(/[A-Z0-9-]{10,}/i);

      if (caseIdMatch) {
        const caseId = caseIdMatch[0];

        const specificCase = await Cases.findOne({
          caseId: new RegExp(caseId, "i"),
        });

        if (specificCase) {
          const user = await Users.findOne({
            aadharNumber: specificCase.aadharNumber,
          });

          let responseMsg = `📋 **Case Details:**\n\n`;
          responseMsg += `**Case ID:** ${specificCase.caseId}\n`;
          responseMsg += `**Status:** ${specificCase.status}\n`;
          responseMsg += `**Priority:** ${specificCase.priority}\n`;
          responseMsg += `**Fraud Type:** ${specificCase.typeOfFraud}\n`;
          responseMsg += `**Category:** ${specificCase.caseCategory}\n`;

          const daysOld = Math.floor(
            (Date.now() - new Date(specificCase.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          responseMsg += `**Age:** ${daysOld} days old\n\n`;

          if (user) {
            responseMsg += `**Complainant:**\n`;
            responseMsg += `• Name: ${user.name}\n`;
            responseMsg += `• Location: ${user.address.district}\n`;
            responseMsg += `• Phone: ${user.phoneNumber}\n\n`;
          }

          if (specificCase.assignedTo && specificCase.assignedTo.officerName) {
            responseMsg += `**Assigned to:** ${specificCase.assignedTo.officerName}\n`;
          } else {
            responseMsg += `⚠️ **Status:** Not assigned to any officer\n`;
          }

          return {
            message: responseMsg,
            data: { case: specificCase, user },
            links: [
              {
                text: "View Case Details",
                url: `/complaints/${specificCase._id}`,
              },
            ],
          };
        } else {
          return {
            message: `❌ No case found with ID: ${caseId}`,
            data: null,
            links: [],
          };
        }
      }
    }

    // Police station wise queries
    if (
      lowerMessage.includes("police station") ||
      (lowerMessage.includes("station") &&
        (lowerMessage.includes("case") || lowerMessage.includes("complaint")))
    ) {
      const allUsers = await Users.find();
      const stationCaseCount = {};

      for (const user of allUsers) {
        const station = user.address.policeStation;
        if (station && station !== "TBD") {
          const userCaseCount = await Cases.countDocuments({
            aadharNumber: user.aadharNumber,
          });
          stationCaseCount[station] =
            (stationCaseCount[station] || 0) + userCaseCount;
        }
      }

      const sortedStations = Object.entries(stationCaseCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let responseMsg = `🚔 **Cases by Police Station:**\n\n`;

      if (sortedStations.length > 0) {
        sortedStations.forEach(([station, count], idx) => {
          responseMsg += `${idx + 1}. ${station}: ${count} cases\n`;
        });
      } else {
        responseMsg += `No police station data available.`;
      }

      return {
        message: responseMsg,
        data: { stationBreakdown: Object.fromEntries(sortedStations) },
        links: [{ text: "View All Cases", url: "/complaints" }],
      };
    }

    // Recent activity queries
    if (
      lowerMessage.includes("recent") ||
      lowerMessage.includes("latest") ||
      (lowerMessage.includes("new") &&
        (lowerMessage.includes("case") || lowerMessage.includes("complaint")))
    ) {
      const recentCases = await Cases.find().sort({ createdAt: -1 }).limit(10);

      let responseMsg = `🆕 **Recent Cases (Last 10):**\n\n`;

      recentCases.forEach((c, idx) => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const timeStr =
          daysAgo === 0
            ? "today"
            : daysAgo === 1
            ? "yesterday"
            : `${daysAgo} days ago`;
        responseMsg += `${idx + 1}. ${c.caseId}\n`;
        responseMsg += `   • ${c.typeOfFraud}\n`;
        responseMsg += `   • Status: ${c.status}\n`;
        responseMsg += `   • Registered: ${timeStr}\n\n`;
      });

      return {
        message: responseMsg,
        data: { recentCases },
        links: [{ text: "View All Cases", url: "/complaints" }],
      };
    }

    // ============================================
    // EXISTING QUERIES (Keep all previous functionality)
    // ============================================

    // Total complaints query
    if (
      lowerMessage.includes("total") &&
      (lowerMessage.includes("complaint") || lowerMessage.includes("case"))
    ) {
      return {
        message: `📊 **Total Complaints: ${stats.total}**\n\nHere's the breakdown:\n✅ Solved: ${stats.byStatus.solved}\n⏳ Pending: ${stats.byStatus.pending}\n🔍 Under Review: ${stats.byStatus.under_review}\n🕵️ Investigating: ${stats.byStatus.investigating}\n❌ Rejected: ${stats.byStatus.rejected}`,
        data: stats,
        links: [{ text: "View All Complaints", url: "/complaints" }],
      };
    }

    // Solved complaints query
    if (
      (lowerMessage.includes("solved") ||
        lowerMessage.includes("resolved") ||
        lowerMessage.includes("closed")) &&
      (lowerMessage.includes("complaint") ||
        lowerMessage.includes("case") ||
        lowerMessage.includes("how many"))
    ) {
      const percentage = ((stats.byStatus.solved / stats.total) * 100).toFixed(
        1
      );
      return {
        message: `✅ **Solved Complaints: ${stats.byStatus.solved}**\n\nThat's ${percentage}% of all complaints!\n\nWould you like to see the solved cases?`,
        data: { solved: stats.byStatus.solved, total: stats.total, percentage },
        links: [
          { text: "View Solved Cases", url: "/complaints?status=solved" },
        ],
      };
    }

    // Pending complaints query
    if (
      (lowerMessage.includes("pending") ||
        lowerMessage.includes("waiting") ||
        lowerMessage.includes("open")) &&
      (lowerMessage.includes("complaint") ||
        lowerMessage.includes("case") ||
        lowerMessage.includes("how many"))
    ) {
      return {
        message: `⏳ **Pending Complaints: ${stats.byStatus.pending}**\n\n⚠️ Long Pending (>30 days): ${stats.longPending}\n\nThese cases require immediate attention!`,
        data: {
          pending: stats.byStatus.pending,
          longPending: stats.longPending,
        },
        links: [
          { text: "View Pending Cases", url: "/complaints?status=pending" },
          {
            text: "View Long Pending",
            url: "/complaints?status=pending&days=30",
          },
        ],
      };
    }

    // Long pending query
    if (
      lowerMessage.includes("long") &&
      (lowerMessage.includes("pending") ||
        lowerMessage.includes("waiting") ||
        lowerMessage.includes("old"))
    ) {
      const longPendingCases = await Cases.find({
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .sort({ createdAt: 1 })
        .limit(5)
        .select("caseId typeOfFraud createdAt");

      let casesList = "";
      if (longPendingCases.length > 0) {
        casesList = "\n\n🚨 **Oldest Pending Cases:**\n";
        longPendingCases.forEach((c, idx) => {
          const daysOld = Math.floor(
            (Date.now() - new Date(c.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          casesList += `${idx + 1}. ${c.caseId} - ${
            c.typeOfFraud
          } (${daysOld} days old)\n`;
        });
      }

      return {
        message: `⚠️ **Long Pending Cases: ${stats.longPending}**\n\nThese cases have been pending for more than 30 days and need urgent attention!${casesList}`,
        data: {
          longPending: stats.longPending,
          cases: longPendingCases,
        },
        links: [
          {
            text: "View All Long Pending",
            url: "/complaints?status=pending&days=30",
          },
        ],
      };
    }

    // Under review query
    if (
      lowerMessage.includes("review") &&
      (lowerMessage.includes("complaint") ||
        lowerMessage.includes("case") ||
        lowerMessage.includes("under"))
    ) {
      return {
        message: `🔍 **Under Review: ${stats.byStatus.under_review}**\n\nThese cases are currently being reviewed by our team.`,
        data: { underReview: stats.byStatus.under_review },
        links: [
          {
            text: "View Cases Under Review",
            url: "/complaints?status=under_review",
          },
        ],
      };
    }

    // Investigating query
    if (
      lowerMessage.includes("investigat") &&
      (lowerMessage.includes("complaint") || lowerMessage.includes("case"))
    ) {
      return {
        message: `🕵️ **Under Investigation: ${stats.byStatus.investigating}**\n\nThese cases are currently being investigated by cyber crime officers.`,
        data: { investigating: stats.byStatus.investigating },
        links: [
          {
            text: "View Investigating Cases",
            url: "/complaints?status=investigating",
          },
        ],
      };
    }

    // Urgent/High priority query
    if (
      lowerMessage.includes("urgent") ||
      lowerMessage.includes("priority") ||
      lowerMessage.includes("critical")
    ) {
      return {
        message: `🚨 **Priority Cases:**\n\n🔴 Urgent: ${stats.byPriority.urgent}\n🟡 High Priority: ${stats.byPriority.high}\n\nThese cases require immediate action!`,
        data: stats.byPriority,
        links: [
          { text: "View Urgent Cases", url: "/complaints?priority=urgent" },
          { text: "View High Priority", url: "/complaints?priority=high" },
        ],
      };
    }

    // Today's complaints query
    if (
      (lowerMessage.includes("today") || lowerMessage.includes("today's")) &&
      (lowerMessage.includes("complaint") || lowerMessage.includes("case"))
    ) {
      return {
        message: `📅 **Today's Complaints: ${stats.timeBasedStats.today}**\n\nNew cases registered today.`,
        data: { today: stats.timeBasedStats.today },
        links: [{ text: "View Today's Cases", url: "/complaints?date=today" }],
      };
    }

    // This week's complaints query
    if (
      (lowerMessage.includes("week") || lowerMessage.includes("weekly")) &&
      (lowerMessage.includes("complaint") || lowerMessage.includes("case"))
    ) {
      return {
        message: `📅 **This Week's Complaints: ${stats.timeBasedStats.thisWeek}**\n\nCases registered in the last 7 days.`,
        data: { thisWeek: stats.timeBasedStats.thisWeek },
        links: [
          { text: "View This Week's Cases", url: "/complaints?date=week" },
        ],
      };
    }

    // This month's complaints query
    if (
      (lowerMessage.includes("month") || lowerMessage.includes("monthly")) &&
      (lowerMessage.includes("complaint") || lowerMessage.includes("case"))
    ) {
      return {
        message: `📅 **This Month's Complaints: ${stats.timeBasedStats.thisMonth}**\n\nCases registered this month.`,
        data: { thisMonth: stats.timeBasedStats.thisMonth },
        links: [
          { text: "View This Month's Cases", url: "/complaints?date=month" },
        ],
      };
    }

    // Category query (Financial/Social)
    if (
      lowerMessage.includes("financial") ||
      lowerMessage.includes("social") ||
      lowerMessage.includes("category") ||
      lowerMessage.includes("type")
    ) {
      let categoryMsg = "📊 **Complaints by Category:**\n\n";

      if (stats.categoryBreakdown.Financial) {
        categoryMsg += `💰 Financial Fraud: ${stats.categoryBreakdown.Financial}\n`;
      }
      if (stats.categoryBreakdown.Social) {
        categoryMsg += `📱 Social Media Fraud: ${stats.categoryBreakdown.Social}\n`;
      }

      categoryMsg += "\n**Top Fraud Types:**\n";
      Object.entries(stats.topFraudTypes).forEach(([type, count], idx) => {
        if (idx < 5) {
          categoryMsg += `${idx + 1}. ${type}: ${count}\n`;
        }
      });

      return {
        message: categoryMsg,
        data: {
          categories: stats.categoryBreakdown,
          topFraudTypes: stats.topFraudTypes,
        },
        links: [
          {
            text: "View Financial Frauds",
            url: "/complaints?category=Financial",
          },
          {
            text: "View Social Media Frauds",
            url: "/complaints?category=Social",
          },
          { text: "View Analytics", url: "/analytics" },
        ],
      };
    }

    // Fraud types query
    if (
      lowerMessage.includes("fraud") ||
      lowerMessage.includes("scam") ||
      lowerMessage.includes("upi") ||
      lowerMessage.includes("phishing")
    ) {
      let fraudMsg = "Top Fraud Types:\n\n";
      Object.entries(stats.topFraudTypes).forEach(([type, count], idx) => {
        fraudMsg += `${idx + 1}. ${type}: ${count} cases\n`;
      });

      fraudMsg += "\nClick below to see detailed breakdown.";

      return {
        message: fraudMsg,
        data: { fraudTypes: stats.topFraudTypes },
        links: [
          { text: "View Analytics Dashboard", url: "/analytics" },
          { text: "View All Complaints", url: "/complaints" },
        ],
      };
    }

    // Analytics/Reports query
    if (
      lowerMessage.includes("analytic") ||
      lowerMessage.includes("report") ||
      lowerMessage.includes("statistics") ||
      lowerMessage.includes("chart") ||
      lowerMessage.includes("graph")
    ) {
      return {
        message: `Analytics and Reports\n\nView comprehensive analytics including:\n- Complaint trends\n- Fraud type distribution\n- Status breakdown\n- Time-based analysis\n- Performance metrics`,
        data: stats,
        links: [
          { text: "View Analytics", url: "/analytics" },
          { text: "Generate Report", url: "/reports" },
        ],
      };
    }

    // Status check query
    if (
      lowerMessage.includes("status") &&
      (lowerMessage.includes("check") ||
        lowerMessage.includes("track") ||
        lowerMessage.includes("my"))
    ) {
      return {
        message: `Check Complaint Status\n\nYou can check your complaint status by:\n1. Entering your Case ID in the complaints section\n2. Using your Aadhar number to view all your cases\n\nClick below to go to the complaints page.`,
        data: null,
        links: [{ text: "Check Status", url: "/complaints" }],
      };
    }

    // Register complaint query
    if (
      lowerMessage.includes("register") ||
      lowerMessage.includes("file") ||
      lowerMessage.includes("new complaint") ||
      lowerMessage.includes("lodge")
    ) {
      return {
        message: `Register New Complaint\n\nTo register a new complaint:\n1. WhatsApp us at 1930\n2. Follow the guided process\n3. Provide necessary details\n4. Upload relevant documents\n\nFor immediate assistance, call our helpline.`,
        data: null,
        links: [{ text: "Contact Info", url: "/settings" }],
      };
    }

    // Users/Citizens query
    if (
      lowerMessage.includes("user") ||
      lowerMessage.includes("citizen") ||
      lowerMessage.includes("people")
    ) {
      const totalUsers = await Users.countDocuments();
      return {
        message: `Registered Users: ${totalUsers}\n\nTotal citizens registered in the system.`,
        data: { totalUsers },
        links: [{ text: "View Users", url: "/users" }],
      };
    }

    // Help/Guide query
    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("how") ||
      lowerMessage.includes("guide") ||
      lowerMessage.includes("assist")
    ) {
      return {
        message: `I can help you with:\n\nStatistics:\n- Total complaints\n- Solved cases\n- Pending cases\n- Long pending cases\n\nTime-based:\n- Today's complaints\n- This week/month's cases\n\nFilters:\n- Urgent cases\n- Financial frauds\n- Fraud types\n\nInsights:\n- Analytics\n- Reports\n\nPlease ask me any question.`,
        data: null,
        links: [
          { text: "View Dashboard", url: "/" },
          { text: "View Complaints", url: "/complaints" },
          { text: "View Analytics", url: "/analytics" },
        ],
      };
    }

    // Default response with suggestions
    return {
      message: `Hello! I am SurakshaBot, your cyber crime helpline assistant.\n\nQuick Statistics:\nTotal: ${stats.total} | Solved: ${stats.byStatus.solved} | Pending: ${stats.byStatus.pending}\n\nYou can ask:\n- How many complaints are pending?\n- Show me urgent cases\n- What are the long pending cases?\n- Today's complaints\n- Show fraud types\n\nHow may I assist you?`,
      data: stats,
      links: [
        { text: "View Dashboard", url: "/" },
        { text: "All Complaints", url: "/complaints" },
        { text: "Analytics", url: "/analytics" },
      ],
    };
  } catch (error) {
    console.error("Error processing chatbot query:", error);
    return {
      message: `Sorry, I encountered an error processing your query. Please try again or contact support at 1930.`,
      data: null,
      links: [{ text: "Contact Support", url: "/settings" }],
    };
  }
}

module.exports = router;
