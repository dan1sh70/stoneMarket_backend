const fs = require('fs');
const path = require('path');

// ==========================================
// 1. POSTMAN COLLECTION GENERATION
// ==========================================
const postmanCollection = {
  info: {
    name: "Stone Market India - Customer Module APIs",
    description: "Production-ready Postman collection covering all endpoints of the Customer Module (Profile, Inquiries, Quotes, Estimates, Favorites, Addresses, Notifications, Security, Support, and Policies).",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000/api", type: "string" },
    { key: "customerToken", value: "YOUR_CUSTOMER_JWT_TOKEN", type: "string" }
  ],
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{customerToken}}", type: "string" }]
  },
  item: [
    {
      name: "1. Profile & Dashboard",
      item: [
        {
          name: "GET Customer Profile",
          request: { method: "GET", url: "{{baseUrl}}/customer/profile" }
        },
        {
          name: "PUT Update Customer Profile",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/profile",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                full_name: "Vikram Malhotra",
                whatsapp_number: "9111111118",
                email: "vikram.malhotra@gmail.com",
                city: "Jaipur",
                state: "Rajasthan",
                bio: "Real Estate Developer and Natural Stone Connoisseur"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "POST Upload Profile Photo",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/profile/photo",
            body: {
              mode: "raw",
              raw: JSON.stringify({ photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "DELETE Remove Profile Photo",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/profile/photo" }
        },
        {
          name: "GET Customer Dashboard Metrics",
          request: { method: "GET", url: "{{baseUrl}}/customer/dashboard" }
        }
      ]
    },
    {
      name: "2. Personal Details Management",
      item: [
        {
          name: "GET Personal Details",
          request: { method: "GET", url: "{{baseUrl}}/customer/personal-details" }
        },
        {
          name: "PUT Update Personal Details",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/personal-details",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                full_name: "Vikram R. Malhotra",
                whatsapp_number: "9111111118",
                date_of_birth: "1990-05-15"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "POST Request Mobile Change OTP",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/personal-details/verify-mobile",
            body: {
              mode: "raw",
              raw: JSON.stringify({ new_mobile: "9829012345" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "POST Verify Mobile Change OTP",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/personal-details/verify-otp",
            body: {
              mode: "raw",
              raw: JSON.stringify({ code: "123456" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        }
      ]
    },
    {
      name: "3. My Inquiries Module",
      item: [
        {
          name: "GET All Inquiries (Search & Filters)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/customer/inquiries?status=All&search=Granite&page=1&limit=10"
          }
        },
        {
          name: "GET Inquiry Details",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/details" }
        },
        {
          name: "GET Inquiry Progress Tracking",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/tracking" }
        },
        {
          name: "GET Inquiry Status History",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/status-history" }
        },
        {
          name: "GET Inquiry Attachments",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/attachments" }
        },
        {
          name: "GET Download Inquiry PDF",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/download" }
        },
        {
          name: "POST Close Inquiry",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/close",
            body: {
              mode: "raw",
              raw: JSON.stringify({ remarks: "Fulfilled by local supplier in Kishangarh" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        }
      ]
    },
    {
      name: "4. Get Quotes Module",
      item: [
        {
          name: "GET Quote Request Dropdown Options",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotes/request-options" }
        },
        {
          name: "POST Submit Quotation Request",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/quotes/request",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                category: "Granite",
                product_name: "Black Galaxy Granite Slabs",
                quantity: 2500,
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
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Submitted Quote Requests",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotes/requests" }
        },
        {
          name: "GET Quote Request Details",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotes/requests/REQUEST_ID" }
        }
      ]
    },
    {
      name: "5. Customer Quotations & Comparison",
      item: [
        {
          name: "GET Received Quotations",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotations?page=1&limit=10" }
        },
        {
          name: "GET Quotation Details",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotations/QUOTE_ID" }
        },
        {
          name: "GET Inquiry Received Quotations",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/quotations" }
        },
        {
          name: "GET Download Quotation PDF",
          request: { method: "GET", url: "{{baseUrl}}/customer/quotations/QUOTE_ID/download" }
        },
        {
          name: "POST Compare Quotations",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/quotations/compare",
            body: {
              mode: "raw",
              raw: JSON.stringify({ quote_ids: ["QUOTE_ID_1", "QUOTE_ID_2"] }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Compare All Inquiry Quotations",
          request: { method: "GET", url: "{{baseUrl}}/customer/inquiries/INQUIRY_ID/quotations/compare" }
        }
      ]
    },
    {
      name: "6. Quotes & Estimates History",
      item: [
        {
          name: "GET Customer Estimates",
          request: { method: "GET", url: "{{baseUrl}}/customer/estimates?type=slab&page=1" }
        },
        {
          name: "POST Create Slab Estimate",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/estimates",
            body: {
              mode: "raw",
              raw: JSON.stringify({
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
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "POST Create Particular Estimate",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/estimates",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                estimate_type: "particular",
                party_name: "Heritage Resorts",
                particular_details: {
                  items: [
                    { particular_name: "Black Granite Kitchen Countertop", quantity: 300, unit: "sqft", unit_price: 180 },
                    { particular_name: "Baluster Pillar Railings", quantity: 25, unit: "pieces", unit_price: 1400 }
                  ],
                  payments: [
                    { amount: 35000, payment_method: "upi", notes: "Token advance payment" }
                  ]
                }
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Download Estimate PDF",
          request: { method: "GET", url: "{{baseUrl}}/customer/estimates/ESTIMATE_ID/download" }
        },
        {
          name: "DELETE Customer Estimate",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/estimates/ESTIMATE_ID" }
        }
      ]
    },
    {
      name: "7. Saved Stones & Favorites",
      item: [
        {
          name: "GET Saved Stones",
          request: { method: "GET", url: "{{baseUrl}}/customer/favorites?page=1&limit=10" }
        },
        {
          name: "POST Save Stone to Favorites",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/favorites",
            body: {
              mode: "raw",
              raw: JSON.stringify({ product_id: "PRODUCT_ID" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Check Favorite Status",
          request: { method: "GET", url: "{{baseUrl}}/customer/favorites/check/PRODUCT_ID" }
        },
        {
          name: "DELETE Remove from Favorites",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/favorites/PRODUCT_ID" }
        }
      ]
    },
    {
      name: "8. Delivery & Project Addresses",
      item: [
        {
          name: "GET Saved Addresses",
          request: { method: "GET", url: "{{baseUrl}}/customer/addresses" }
        },
        {
          name: "POST Add New Address",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/addresses",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                state: "Rajasthan",
                district: "Jaipur",
                area: "C-Scheme",
                full_address: "B-14 Subhash Marg, C-Scheme",
                pin_code: "302001",
                address_label: "Home",
                is_default: true
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "PUT Update Address",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/addresses/ADDRESS_ID",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                full_address: "B-14 Subhash Marg, 2nd Floor",
                address_label: "Office"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "PATCH Set Default Address",
          request: { method: "PATCH", url: "{{baseUrl}}/customer/addresses/ADDRESS_ID/default" }
        },
        {
          name: "DELETE Address",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/addresses/ADDRESS_ID" }
        }
      ]
    },
    {
      name: "9. Notifications & Settings",
      item: [
        {
          name: "GET Customer Notifications",
          request: { method: "GET", url: "{{baseUrl}}/customer/notifications?page=1&limit=15" }
        },
        {
          name: "GET Unread Notification Count",
          request: { method: "GET", url: "{{baseUrl}}/customer/notifications/unread-count" }
        },
        {
          name: "PATCH Mark Single Notification Read",
          request: { method: "PATCH", url: "{{baseUrl}}/customer/notifications/NOTIFICATION_ID/read" }
        },
        {
          name: "PATCH Mark All Notifications Read",
          request: { method: "PATCH", url: "{{baseUrl}}/customer/notifications/read-all" }
        },
        {
          name: "GET Notification Preferences",
          request: { method: "GET", url: "{{baseUrl}}/customer/settings/notifications" }
        },
        {
          name: "PUT Update Notification Preferences",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/settings/notifications",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                new_inquiry: true,
                lead_messages: true,
                quote_requests: true,
                ad_performance: true,
                subscription_billing: true,
                marketing_emails: false
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Quiet Hours Settings",
          request: { method: "GET", url: "{{baseUrl}}/customer/settings/quiet-hours" }
        },
        {
          name: "PUT Update Quiet Hours",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/settings/quiet-hours",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                enabled: true,
                start_time: "22:00",
                end_time: "08:00",
                timezone: "Asia/Kolkata"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        }
      ]
    },
    {
      name: "10. Security & Sessions",
      item: [
        {
          name: "GET Account Information",
          request: { method: "GET", url: "{{baseUrl}}/customer/account-information" }
        },
        {
          name: "PUT Change Password",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/security/change-password",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                current_password: "password123",
                new_password: "NewStrongPassword123",
                confirm_new_password: "NewStrongPassword123"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Active Sessions",
          request: { method: "GET", url: "{{baseUrl}}/customer/security/sessions" }
        },
        {
          name: "DELETE Revoke Single Session",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/security/sessions/SESSION_ID" }
        },
        {
          name: "DELETE Revoke All Other Sessions",
          request: { method: "DELETE", url: "{{baseUrl}}/customer/security/sessions" }
        },
        {
          name: "GET Language & Appearance Preferences",
          request: { method: "GET", url: "{{baseUrl}}/customer/settings/preferences" }
        },
        {
          name: "PUT Update Language & Appearance",
          request: {
            method: "PUT",
            url: "{{baseUrl}}/customer/settings/preferences",
            body: {
              mode: "raw",
              raw: JSON.stringify({ language: "en", appearance: "dark" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "POST Customer Logout",
          request: { method: "POST", url: "{{baseUrl}}/customer/logout" }
        }
      ]
    },
    {
      name: "11. Help & Support",
      item: [
        {
          name: "GET Categorized FAQs",
          request: { method: "GET", url: "{{baseUrl}}/customer/support/faqs?category=Orders%20%26%20Delivery" }
        },
        {
          name: "GET Customer Support Tickets",
          request: { method: "GET", url: "{{baseUrl}}/customer/support/tickets?page=1&limit=10" }
        },
        {
          name: "POST Create Support Ticket",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/support/tickets",
            body: {
              mode: "raw",
              raw: JSON.stringify({
                subject: "Inquiry regarding transit insurance for stone transport",
                category: "Orders & Delivery",
                description: "Does the transport partner provide insurance for fragile white marble slabs?",
                priority: "medium"
              }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        },
        {
          name: "GET Support Ticket Details",
          request: { method: "GET", url: "{{baseUrl}}/customer/support/tickets/TICKET_ID" }
        },
        {
          name: "POST Add Message to Ticket Thread",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/support/tickets/TICKET_ID/messages",
            body: {
              mode: "raw",
              raw: JSON.stringify({ message: "Attached delivery receipt for reference" }, null, 2),
              options: { raw: { language: "json" } }
            }
          }
        }
      ]
    },
    {
      name: "12. About Stone Market & Policies",
      item: [
        {
          name: "GET About App",
          request: { method: "GET", url: "{{baseUrl}}/app/about" }
        },
        {
          name: "GET App Version & Updates",
          request: { method: "GET", url: "{{baseUrl}}/app/version" }
        },
        {
          name: "GET Legal Policies",
          request: { method: "GET", url: "{{baseUrl}}/app/policies" }
        }
      ]
    }
  ]
};

// ==========================================
// 2. OPENAPI 3.0 SPECIFICATION GENERATION
// ==========================================
const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Stone Market India - Customer Module REST API",
    version: "1.0.0",
    description: "Complete, production-ready REST API documentation for the Customer Module of Stone Market India, covering profile, personal details, inquiries, quotations, estimates, favorites, addresses, notifications, security, support, and platform policies."
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local Development Server" },
    { url: "https://api.stonemarketindia.com/api", description: "Production Server" }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Standard JWT Bearer token obtained via /api/v1/auth/login or /api/auth/login"
      }
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" },
          errors: { type: "object", nullable: true, example: null },
          meta: {
            type: "object",
            nullable: true,
            properties: {
              current_page: { type: "integer", example: 1 },
              per_page: { type: "integer", example: 10 },
              total: { type: "integer", example: 45 },
              last_page: { type: "integer", example: 5 }
            }
          }
        }
      },
      CustomerProfile: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "6ae467433fd4377ea5c62125" },
          full_name: { type: "string", example: "Vikram Malhotra" },
          profile_picture: { type: "string", example: "https://images.unsplash.com/photo-1534528741775" },
          registered_mobile: { type: "string", example: "9111111118" },
          whatsapp_number: { type: "string", example: "9111111118" },
          email: { type: "string", example: "customer.test@stonemarketindia.com" },
          city: { type: "string", example: "Jaipur" },
          state: { type: "string", example: "Rajasthan" },
          account_type: { type: "string", example: "customer" },
          account_verification_status: { type: "string", enum: ["unverified", "pending", "verified", "rejected"], example: "verified" },
          customer_rating: { type: "number", example: 4.8 },
          number_of_reviews: { type: "integer", example: 5 },
          membership_date: { type: "string", format: "date-time" }
        }
      }
    }
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/customer/profile": {
      get: {
        summary: "Retrieve authenticated customer profile",
        tags: ["Profile"],
        responses: { 200: { description: "Customer profile retrieved" }, 401: { description: "Unauthenticated" } }
      },
      put: {
        summary: "Update editable customer profile information",
        tags: ["Profile"],
        responses: { 200: { description: "Profile updated" }, 400: { description: "Validation error" } }
      }
    },
    "/customer/profile/photo": {
      post: {
        summary: "Upload or update customer profile picture",
        tags: ["Profile"],
        responses: { 200: { description: "Photo updated" } }
      },
      delete: {
        summary: "Remove customer profile picture and restore avatar",
        tags: ["Profile"],
        responses: { 200: { description: "Photo removed" } }
      }
    },
    "/customer/dashboard": {
      get: {
        summary: "Aggregated real-time metrics and dashboard summary",
        tags: ["Profile"],
        responses: { 200: { description: "Dashboard data" } }
      }
    },
    "/customer/personal-details": {
      get: { summary: "Retrieve personal details", tags: ["Personal Details"] },
      put: { summary: "Update personal details", tags: ["Personal Details"] }
    },
    "/customer/personal-details/verify-mobile": {
      post: { summary: "Request OTP to update registered mobile phone", tags: ["Personal Details"] }
    },
    "/customer/personal-details/verify-otp": {
      post: { summary: "Verify OTP and finalize mobile update", tags: ["Personal Details"] }
    },
    "/customer/inquiries": {
      get: { summary: "List customer inquiries with search and filters", tags: ["Inquiries"] }
    },
    "/customer/inquiries/{inquiry_id}/details": {
      get: { summary: "Retrieve full inquiry details", tags: ["Inquiries"] }
    },
    "/customer/inquiries/{inquiry_id}/tracking": {
      get: { summary: "Retrieve 5-step inquiry workflow tracking", tags: ["Inquiries"] }
    },
    "/customer/inquiries/{inquiry_id}/download": {
      get: { summary: "Generate and download customer inquiry PDF", tags: ["Inquiries"] }
    },
    "/customer/inquiries/{inquiry_id}/close": {
      post: { summary: "Customer closes inquiry with reason", tags: ["Inquiries"] }
    },
    "/customer/quotes/request": {
      post: { summary: "Submit stone requirement quotation request", tags: ["Quotes"] }
    },
    "/customer/quotes/request-options": {
      get: { summary: "Get quotation form dropdown options", tags: ["Quotes"] }
    },
    "/customer/quotations": {
      get: { summary: "List all quotations received from suppliers", tags: ["Quotations"] }
    },
    "/customer/quotations/{quote_id}": {
      get: { summary: "Retrieve detailed supplier quotation", tags: ["Quotations"] }
    },
    "/customer/quotations/{quote_id}/download": {
      get: { summary: "Download supplier quotation PDF", tags: ["Quotations"] }
    },
    "/customer/quotations/compare": {
      post: { summary: "Compare multiple quotations side-by-side", tags: ["Quotations"] }
    },
    "/customer/estimates": {
      get: { summary: "List customer estimates (slab and particular)", tags: ["Estimates"] },
      post: { summary: "Create slab or particular estimate with automated area/amount calculation", tags: ["Estimates"] }
    },
    "/customer/estimates/{estimate_id}/download": {
      get: { summary: "Download slab or particular estimate PDF", tags: ["Estimates"] }
    },
    "/customer/favorites": {
      get: { summary: "List customer saved stones", tags: ["Favorites"] },
      post: { summary: "Save stone product to favorites", tags: ["Favorites"] }
    },
    "/customer/favorites/{product_id}": {
      delete: { summary: "Remove product from favorites", tags: ["Favorites"] }
    },
    "/customer/addresses": {
      get: { summary: "List customer delivery and project addresses", tags: ["Addresses"] },
      post: { summary: "Create new delivery address", tags: ["Addresses"] }
    },
    "/customer/addresses/{address_id}/default": {
      patch: { summary: "Set address as default", tags: ["Addresses"] }
    },
    "/customer/notifications": {
      get: { summary: "List customer in-app notifications", tags: ["Notifications"] },
      delete: { summary: "Clear customer notifications", tags: ["Notifications"] }
    },
    "/customer/settings/quiet-hours": {
      get: { summary: "Retrieve quiet hours configuration", tags: ["Settings"] },
      put: { summary: "Update quiet hours schedule and timezone", tags: ["Settings"] }
    },
    "/customer/security/change-password": {
      put: { summary: "Change account password with verification", tags: ["Security"] }
    },
    "/customer/security/sessions": {
      get: { summary: "List active customer login sessions", tags: ["Security"] },
      delete: { summary: "Revoke all other active sessions", tags: ["Security"] }
    },
    "/customer/support/tickets": {
      get: { summary: "List customer support tickets", tags: ["Help & Support"] },
      post: { summary: "Create new support ticket", tags: ["Help & Support"] }
    },
    "/app/about": {
      get: { summary: "Get About Stone Market India details", tags: ["App Info"] }
    },
    "/app/version": {
      get: { summary: "Get app version and update requirements", tags: ["App Info"] }
    },
    "/app/policies": {
      get: { summary: "Get legal policies and URLs", tags: ["App Info"] }
    }
  }
};

// Write files
const rootDir = path.resolve(__dirname, '../../');
fs.writeFileSync(
  path.join(rootDir, 'Customer_Module_Postman_Collection.json'),
  JSON.stringify(postmanCollection, null, 2),
  'utf8'
);
fs.writeFileSync(
  path.join(rootDir, 'Customer_Module_OpenAPI.json'),
  JSON.stringify(openApiSpec, null, 2),
  'utf8'
);

console.log('Customer Module Documentation & Postman collection generated successfully:');
console.log('  - Customer_Module_Postman_Collection.json');
console.log('  - Customer_Module_OpenAPI.json');
