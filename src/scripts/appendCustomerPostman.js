const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '../../Auth_Registration_Postman_Collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to build URL object
function buildUrl(endpoint, queryParams = []) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const pathParts = cleanEndpoint.split('?')[0].split('/');
  const query = queryParams.map(q => ({ key: q.key, value: q.value, description: q.desc || '' }));

  return {
    raw: `{{baseUrl}}/${cleanEndpoint}`,
    host: ["{{baseUrl}}"],
    path: pathParts,
    query: query.length > 0 ? query : undefined
  };
}

// Helper to build request item
function reqItem(name, method, endpoint, bodyObj = null, queryParams = [], auth = true) {
  const item = {
    name,
    request: {
      method,
      header: auth ? [{ key: "Authorization", value: "Bearer {{token}}" }] : [],
      url: buildUrl(endpoint, queryParams)
    }
  };

  if (bodyObj) {
    item.request.header.push({ key: "Content-Type", value: "application/json" });
    item.request.body = {
      mode: "raw",
      raw: JSON.stringify(bodyObj, null, 2),
      options: { raw: { language: "json" } }
    };
  }

  return item;
}

const customerModuleFolder = {
  name: "Customer Module",
  item: [
    {
      name: "1. Profile & Dashboard",
      item: [
        reqItem("GET Customer Profile", "GET", "api/customer/profile"),
        reqItem("PUT Update Customer Profile", "PUT", "api/customer/profile", {
          full_name: "Vikram Malhotra",
          whatsapp_number: "9111111118",
          email: "vikram.malhotra@gmail.com",
          city: "Jaipur",
          state: "Rajasthan",
          bio: "Architectural stone buyer & developer"
        }),
        reqItem("POST Upload Profile Photo (URL)", "POST", "api/customer/profile/photo", {
          photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
        }),
        reqItem("DELETE Remove Profile Photo", "DELETE", "api/customer/profile/photo"),
        reqItem("GET Customer Dashboard Metrics", "GET", "api/customer/dashboard")
      ]
    },
    {
      name: "2. Personal Details Management",
      item: [
        reqItem("GET Personal Details", "GET", "api/customer/personal-details"),
        reqItem("PUT Update Personal Details", "PUT", "api/customer/personal-details", {
          full_name: "Vikram R. Malhotra",
          whatsapp_number: "9111111118",
          date_of_birth: "1990-05-15"
        }),
        reqItem("POST Request Mobile Change OTP", "POST", "api/customer/personal-details/verify-mobile", {
          new_mobile: "9829012345"
        }),
        reqItem("POST Verify Mobile Change OTP", "POST", "api/customer/personal-details/verify-otp", {
          code: "123456"
        })
      ]
    },
    {
      name: "3. My Inquiries Module",
      item: [
        reqItem("GET Customer Inquiries (Search & Filter)", "GET", "api/customer/inquiries", null, [
          { key: "status", value: "All" },
          { key: "search", value: "Granite" },
          { key: "page", value: "1" },
          { key: "limit", value: "10" }
        ]),
        reqItem("GET Inquiry Details", "GET", "api/customer/inquiries/{{inquiry_id}}/details"),
        reqItem("GET Inquiry Progress Tracking", "GET", "api/customer/inquiries/{{inquiry_id}}/tracking"),
        reqItem("GET Inquiry Status History", "GET", "api/customer/inquiries/{{inquiry_id}}/status-history"),
        reqItem("GET Inquiry Attachments", "GET", "api/customer/inquiries/{{inquiry_id}}/attachments"),
        reqItem("GET Download Inquiry PDF", "GET", "api/customer/inquiries/{{inquiry_id}}/download"),
        reqItem("POST Close Inquiry", "POST", "api/customer/inquiries/{{inquiry_id}}/close", {
          remarks: "Requirement fulfilled locally in Kishangarh"
        })
      ]
    },
    {
      name: "4. Get Quotes Module",
      item: [
        reqItem("GET Quote Request Dropdown Options", "GET", "api/customer/quotes/request-options"),
        reqItem("POST Submit Quotation Request (RFQ)", "POST", "api/customer/quotes/request", {
          category: "Granite",
          product_name: "Imperial Black Granite",
          quantity: 2000,
          unit: "Sq.Ft",
          size: "10x6 ft slabs",
          thickness: "20mm",
          finish: "Polished",
          edge_profile: "Full Bullnose",
          quality: "Premium Export Grade",
          delivery_location: {
            city: "Jaipur",
            state: "Rajasthan",
            address: "Sitapura Industrial Area Phase 3",
            pin_code: "302022"
          },
          budget_range: "Rs. 180 - 220 per Sq.Ft",
          delivery_timeline: "Within 15 Days",
          additional_specifications: "Pre-seal with high-grade stone penetrant. Export crating required.",
          referral_source: "Trade Exhibition"
        }),
        reqItem("GET Submitted Quote Requests", "GET", "api/customer/quotes/requests", null, [
          { key: "page", value: "1" },
          { key: "limit", value: "10" }
        ]),
        reqItem("GET Quote Request Details", "GET", "api/customer/quotes/requests/{{quote_request_id}}")
      ]
    },
    {
      name: "5. Customer Quotations & Comparison",
      item: [
        reqItem("GET Received Quotations", "GET", "api/customer/quotations", null, [
          { key: "page", value: "1" },
          { key: "limit", value: "10" }
        ]),
        reqItem("GET Quotation Details", "GET", "api/customer/quotations/{{quote_id}}"),
        reqItem("GET Quotations for Inquiry", "GET", "api/customer/inquiries/{{inquiry_id}}/quotations"),
        reqItem("GET Download Quotation PDF", "GET", "api/customer/quotations/{{quote_id}}/download"),
        reqItem("POST Compare Multiple Quotations", "POST", "api/customer/quotations/compare", {
          quote_ids: ["QUOTE_ID_1", "QUOTE_ID_2"]
        }),
        reqItem("GET Compare All Inquiry Quotations", "GET", "api/customer/inquiries/{{inquiry_id}}/quotations/compare")
      ]
    },
    {
      name: "6. Quotes & Estimates History",
      item: [
        reqItem("GET Customer Estimates", "GET", "api/customer/estimates", null, [
          { key: "type", value: "slab" },
          { key: "page", value: "1" }
        ]),
        reqItem("POST Create Slab Estimate", "POST", "api/customer/estimates", {
          estimate_type: "slab",
          party_name: "Royal Palace Villa Project",
          party_address: "Civil Lines, Jaipur",
          party_contact: "9829011223",
          slab_details: {
            colour_quality: "Imperial Black First Choice",
            measurement_unit: "inch",
            area_unit: "sqft",
            unit_price: 160,
            measurement_rows: [
              { length: 120, width: 60 },
              { length: 110, width: 55 }
            ]
          }
        }),
        reqItem("POST Create Particular Estimate", "POST", "api/customer/estimates", {
          estimate_type: "particular",
          party_name: "Heritage Resorts",
          particular_details: {
            items: [
              { particular_name: "Black Granite Countertop", quantity: 300, unit: "sqft", unit_price: 180 },
              { particular_name: "Baluster Pillar Railings", quantity: 25, unit: "pieces", unit_price: 1400 }
            ],
            payments: [
              { amount: 35000, payment_method: "upi", notes: "Token advance payment" }
            ]
          }
        }),
        reqItem("GET Download Estimate PDF", "GET", "api/customer/estimates/{{estimate_id}}/download"),
        reqItem("DELETE Customer Estimate", "DELETE", "api/customer/estimates/{{estimate_id}}")
      ]
    },
    {
      name: "7. Saved Stones & Favorites",
      item: [
        reqItem("GET Saved Stones List", "GET", "api/customer/favorites", null, [
          { key: "page", value: "1" },
          { key: "limit", value: "10" }
        ]),
        reqItem("POST Save Stone to Favorites", "POST", "api/customer/favorites", {
          product_id: "{{product_id}}"
        }),
        reqItem("GET Check Favorite Status", "GET", "api/customer/favorites/check/{{product_id}}"),
        reqItem("DELETE Remove Stone from Favorites", "DELETE", "api/customer/favorites/{{product_id}}")
      ]
    },
    {
      name: "8. Delivery & Project Addresses",
      item: [
        reqItem("GET Saved Addresses", "GET", "api/customer/addresses"),
        reqItem("POST Add New Delivery Address", "POST", "api/customer/addresses", {
          state: "Rajasthan",
          district: "Jaipur",
          area: "C-Scheme",
          full_address: "B-14 Subhash Marg, C-Scheme",
          pin_code: "302001",
          address_label: "Home",
          is_default: true
        }),
        reqItem("PUT Update Delivery Address", "PUT", "api/customer/addresses/{{address_id}}", {
          full_address: "B-14 Subhash Marg, 2nd Floor",
          address_label: "Office"
        }),
        reqItem("PATCH Set Address as Default", "PATCH", "api/customer/addresses/{{address_id}}/default"),
        reqItem("DELETE Delivery Address", "DELETE", "api/customer/addresses/{{address_id}}")
      ]
    },
    {
      name: "9. Notifications & Notification Preferences",
      item: [
        reqItem("GET Notifications List", "GET", "api/customer/notifications", null, [
          { key: "page", value: "1" },
          { key: "limit", value: "15" }
        ]),
        reqItem("GET Unread Notification Count", "GET", "api/customer/notifications/unread-count"),
        reqItem("PATCH Mark Single Notification Read", "PATCH", "api/customer/notifications/{{notification_id}}/read"),
        reqItem("PATCH Mark All Notifications Read", "PATCH", "api/customer/notifications/read-all"),
        reqItem("GET Notification Preferences", "GET", "api/customer/settings/notifications"),
        reqItem("PUT Update Notification Preferences", "PUT", "api/customer/settings/notifications", {
          new_inquiry: true,
          lead_messages: true,
          quote_requests: true,
          ad_performance: true,
          subscription_billing: true,
          marketing_emails: false
        }),
        reqItem("GET Quiet Hours Configuration", "GET", "api/customer/settings/quiet-hours"),
        reqItem("PUT Update Quiet Hours", "PUT", "api/customer/settings/quiet-hours", {
          enabled: true,
          start_time: "22:00",
          end_time: "08:00",
          timezone: "Asia/Kolkata"
        })
      ]
    },
    {
      name: "10. Account Security, Sessions & Settings",
      item: [
        reqItem("GET Account Information", "GET", "api/customer/account-information"),
        reqItem("PUT Change Password", "PUT", "api/customer/security/change-password", {
          current_password: "password123",
          new_password: "NewStrongPassword123",
          confirm_new_password: "NewStrongPassword123"
        }),
        reqItem("GET Active Login Sessions", "GET", "api/customer/security/sessions"),
        reqItem("DELETE Revoke Single Session", "DELETE", "api/customer/security/sessions/{{session_id}}"),
        reqItem("DELETE Revoke All Other Sessions", "DELETE", "api/customer/security/sessions"),
        reqItem("GET Language & Appearance Preferences", "GET", "api/customer/settings/preferences"),
        reqItem("PUT Update Language & Appearance", "PUT", "api/customer/settings/preferences", {
          language: "en",
          appearance: "dark"
        }),
        reqItem("POST Customer Logout", "POST", "api/customer/logout")
      ]
    },
    {
      name: "11. Help & Support",
      item: [
        reqItem("GET Categorized FAQs", "GET", "api/customer/support/faqs", null, [
          { key: "category", value: "Orders & Delivery" }
        ]),
        reqItem("GET Customer Support Tickets", "GET", "api/customer/support/tickets", null, [
          { key: "page", value: "1" },
          { key: "limit", value: "10" }
        ]),
        reqItem("POST Create Support Ticket", "POST", "api/customer/support/tickets", {
          subject: "Inquiry regarding transit insurance for stone transport",
          category: "Orders & Delivery",
          description: "Does the transport partner provide insurance for fragile white marble slabs?",
          priority: "medium"
        }),
        reqItem("GET Support Ticket Details", "GET", "api/customer/support/tickets/{{ticket_id}}"),
        reqItem("POST Add Message to Ticket Thread", "POST", "api/customer/support/tickets/{{ticket_id}}/messages", {
          message: "Attached delivery receipt for reference"
        })
      ]
    },
    {
      name: "12. About Stone Market & Legal Policies",
      item: [
        reqItem("GET About App Information", "GET", "api/app/about", null, [], false),
        reqItem("GET App Version & Updates", "GET", "api/app/version", null, [], false),
        reqItem("GET Legal Policies & Terms", "GET", "api/app/policies", null, [], false)
      ]
    }
  ]
};

// Check if "Customer Module" already exists in collection
const existingIndex = collection.item.findIndex(i => i.name === "Customer Module");
if (existingIndex >= 0) {
  collection.item[existingIndex] = customerModuleFolder;
  console.log('Updated existing "Customer Module" folder in collection.');
} else {
  collection.item.push(customerModuleFolder);
  console.log('Appended "Customer Module" folder to collection.');
}

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Successfully saved to Auth_Registration_Postman_Collection.json!');
