const fs = require('fs');

const collection = {
  info: {
    name: "Stone Market - Auth & Registration Upgrade",
    description: "Contains all endpoints for Authentication (Email, OTP, Google) and Multi-Step Registration for all 8 business roles.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:5000",
      type: "string"
    },
    {
      key: "token",
      value: "YOUR_AUTH_TOKEN",
      type: "string"
    },
    {
      key: "registration_id",
      value: "REG_XXXXXXXX",
      type: "string"
    }
  ],
  item: []
};

// Add Auth Folder
const authFolder = {
  name: "Authentication",
  item: [
    {
      name: "Login (Email)",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }, 
        body: { mode: "raw", raw: JSON.stringify({ email: "admin@stonemarket.com", password: "password123" }, null, 2), options: { raw: { language: "json" } } } 
      }
    },
    {
      name: "Login (OTP/Mobile)",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }, 
        body: { mode: "raw", raw: JSON.stringify({ mobile: "9999999999", otp: "123456" }, null, 2), options: { raw: { language: "json" } } } 
      }
    },
    {
      name: "OTP Request",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/auth/otp/request", host: ["{{baseUrl}}"], path: ["api", "auth", "otp", "request"] }, 
        body: { mode: "raw", raw: JSON.stringify({ mobile_number: "9876543210" }, null, 2), options: { raw: { language: "json" } } } 
      }
    },
    {
      name: "OTP Verify",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/auth/otp/verify", host: ["{{baseUrl}}"], path: ["api", "auth", "otp", "verify"] }, 
        body: { mode: "raw", raw: JSON.stringify({ mobile: "9876543210", code: "123456" }, null, 2), options: { raw: { language: "json" } } } 
      }
    },
    {
      name: "Google Login",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/auth/google", host: ["{{baseUrl}}"], path: ["api", "auth", "google"] }, 
        body: { mode: "raw", raw: JSON.stringify({ token: "GOOGLE_JWT_TOKEN", role: "buyer" }, null, 2), options: { raw: { language: "json" } } } 
      }
    },
    {
      name: "Get Current User Profile",
      request: { 
        method: "GET", 
        url: { raw: "{{baseUrl}}/api/auth/me", host: ["{{baseUrl}}"], path: ["api", "auth", "me"] },
        header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }]
      }
    }
  ]
};
collection.item.push(authFolder);

// Helper for dynamic step 1 payloads based on Joi validation schemas
const getStep1Body = (role) => {
  const common = {
    company_name: "Example Business Co.",
    gst_number: "22AAAAA0000A1Z5",
    established_year: 2020,
    company_details: "Leading provider in the market."
  };

  if (role === 'mining') {
    return {
      ...common,
      ec_number: "EC-987654321",
      granite_colors: ["6aaad1586dc9dfd362a76fde", "6aaad1586dc9dfd362a76fdf"],
      monthly_capacity_ton: 5000,
      machines: [
        { machine_name: "Excavator", quantity: 2 },
        { machine_name: "Driller", quantity: 1 }
      ],
      working_times: "Mon-Sat 9AM-6PM"
    };
  }
  
  if (role === 'manufacturer') {
    return {
      ...common,
      iec_number: "IEC-123456789",
      is_export_unit: true,
      granite_colors: ["6aaad1586dc9dfd362a76fde"],
      monthly_capacity_sqf: 15000,
      machines: [
        { machine_name: "Cutter", quantity: 5 }
      ],
      working_times: "24/7 Shift"
    };
  }
  
  if (role === 'showroom') {
    return {
      showroom_name: "Premium Stones Gallery",
      gst_number: "22AAAAA0000A1Z5",
      established_year: 2018,
      company_details: "Exclusive granite showroom",
      granite_colors: ["6aaad1586dc9dfd362a76fde"]
    };
  }

  // Fallback for trader, buyer, etc.
  return common;
};

// Generic steps
const step2Body = {
  owner_1: {
    name: "John Doe",
    phone: "9876543210",
    whatsapp: "9876543210",
    birth_date: "1985-05-15",
    anniversary_date: "2010-11-20"
  },
  owner_2: {
    name: "Jane Doe",
    phone: "9123456780"
  }
};

const getStep3Body = (role) => {
  const common = {
    state: "Rajasthan",
    district: "Udaipur",
    area: "Sukher",
    address: "Plot 42, Marble Industrial Area",
    google_map_location: "https://maps.google.com/?q=24.5854,73.7125",
    terms_accepted: true,
    privacy_policy_accepted: true
  };

  if (role === 'showroom') {
    return {
      state: common.state,
      district: common.district,
      area: common.area,
      google_map_location: common.google_map_location,
      premises_status: "owned",
      showroom_address: "Shop 12, City Mall",
      terms_accepted: true,
      privacy_policy_accepted: true
    };
  }

  return common;
};

// Add Registration Folders for each role
const roles = ['mining', 'manufacturer', 'showroom', 'trader', 'buyer', 'transport_national', 'transport_local', 'customer'];

roles.forEach(role => {
  const roleFolder = {
    name: `Registration - ${role.toUpperCase()}`,
    item: [
      {
        name: "Step 1 - Company Info",
        request: { 
          method: "POST", 
          url: { raw: `{{baseUrl}}/api/registration/${role}/step-1`, host: ["{{baseUrl}}"], path: ["api", "registration", role, "step-1"] }, 
          header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }],
          body: { mode: "raw", raw: JSON.stringify(getStep1Body(role), null, 2), options: { raw: { language: "json" } } } 
        }
      },
      {
        name: "Step 2 - Owners",
        request: { 
          method: "POST", 
          url: { raw: `{{baseUrl}}/api/registration/${role}/step-2`, host: ["{{baseUrl}}"], path: ["api", "registration", role, "step-2"] }, 
          header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }],
          body: { mode: "raw", raw: JSON.stringify(step2Body, null, 2), options: { raw: { language: "json" } } } 
        }
      },
      {
        name: "Step 3 - Location & Terms",
        request: { 
          method: "POST", 
          url: { raw: `{{baseUrl}}/api/registration/${role}/step-3`, host: ["{{baseUrl}}"], path: ["api", "registration", role, "step-3"] }, 
          header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }],
          body: { mode: "raw", raw: JSON.stringify(getStep3Body(role), null, 2), options: { raw: { language: "json" } } } 
        }
      }
    ]
  };
  collection.item.push(roleFolder);
});

// Add Draft Submission APIs
collection.item.push({
  name: "Registration Submission",
  item: [
    {
      name: "Resume / Get Draft",
      request: { 
        method: "GET", 
        url: { raw: "{{baseUrl}}/api/registration/{{registration_id}}", host: ["{{baseUrl}}"], path: ["api", "registration", "{{registration_id}}"] },
        header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }]
      }
    },
    {
      name: "Submit Final Registration",
      request: { 
        method: "POST", 
        url: { raw: "{{baseUrl}}/api/registration/{{registration_id}}/submit", host: ["{{baseUrl}}"], path: ["api", "registration", "{{registration_id}}", "submit"] },
        header: [{ key: "Authorization", value: "Bearer {{token}}", type: "text" }]
      }
    }
  ]
});

// Add Master Data
collection.item.push({
  name: "Master Data",
  item: [
    {
      name: "Get Granite Colors",
      request: { method: "GET", url: { raw: "{{baseUrl}}/api/granite-colors", host: ["{{baseUrl}}"], path: ["api", "granite-colors"] } }
    },
    {
      name: "Get States",
      request: { method: "GET", url: { raw: "{{baseUrl}}/api/locations/states", host: ["{{baseUrl}}"], path: ["api", "locations", "states"] } }
    },
    {
      name: "Get Districts",
      request: { method: "GET", url: { raw: "{{baseUrl}}/api/locations/states/STATE_ID/districts", host: ["{{baseUrl}}"], path: ["api", "locations", "states", "STATE_ID", "districts"] } }
    },
    {
      name: "Get Areas",
      request: { method: "GET", url: { raw: "{{baseUrl}}/api/locations/districts/DISTRICT_ID/areas", host: ["{{baseUrl}}"], path: ["api", "locations", "districts", "DISTRICT_ID", "areas"] } }
    }
  ]
});

fs.writeFileSync('Auth_Registration_Postman_Collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection generated at Auth_Registration_Postman_Collection.json');
