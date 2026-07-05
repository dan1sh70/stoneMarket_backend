const fs = require('fs');

const collection = {
  info: {
    name: "Stone Market India API",
    description: "Complete API collection for Stone Market India Backend",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:5000/api/v1",
      type: "string"
    },
    {
      key: "token",
      value: "YOUR_JWT_TOKEN",
      type: "string"
    }
  ],
  item: [
    {
      name: "1. Authentication",
      item: [
        { name: "Register User/Vendor", request: { method: "POST", url: "{{baseUrl}}/auth/register", body: { mode: "raw", raw: JSON.stringify({ name: "John Doe", mobile: "9876543210", role: "vendor" }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Verify OTP", request: { method: "POST", url: "{{baseUrl}}/auth/verify-otp", body: { mode: "raw", raw: JSON.stringify({ userId: "USER_ID", otp: "123456" }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Login", request: { method: "POST", url: "{{baseUrl}}/auth/login", body: { mode: "raw", raw: JSON.stringify({ mobile: "9876543210", otp: "123456" }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Get Current User", request: { method: "GET", url: "{{baseUrl}}/auth/me", header: [{ key: "Authorization", value: "Bearer {{token}}" }] } },
        { name: "Forgot Password", request: { method: "POST", url: "{{baseUrl}}/auth/forgot-password", body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com" }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Reset Password", request: { method: "POST", url: "{{baseUrl}}/auth/reset-password", body: { mode: "raw", raw: JSON.stringify({ token: "RESET_TOKEN", password: "new_secure_password" }, null, 2), options: { raw: { language: "json" } } } } }
      ]
    },
    {
      name: "2. Vendors",
      item: [
        { name: "List Active Vendors", request: { method: "GET", url: "{{baseUrl}}/vendors" } },
        { name: "Create/Update Profile", request: { method: "POST", url: "{{baseUrl}}/vendors/profile", header: [{ key: "Authorization", value: "Bearer {{token}}" }], body: { mode: "raw", raw: JSON.stringify({ businessName: "Premium Marble", category: "Mining", address: { state: "Rajasthan", city: "Jaipur" }, location: { type: "Point", coordinates: [75.7873, 26.9124] } }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Get Vendor by Slug", request: { method: "GET", url: "{{baseUrl}}/vendors/premium-marble" } }
      ]
    },
    {
      name: "3. Products",
      item: [
        { name: "List Products", request: { method: "GET", url: "{{baseUrl}}/products" } },
        { name: "Add Product", request: { method: "POST", url: "{{baseUrl}}/products", header: [{ key: "Authorization", value: "Bearer {{token}}" }], body: { mode: "raw", raw: JSON.stringify({ name: "White Marble Slab", category: "Marble", price: 1500, unit: "sq_ft" }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Get Product by ID", request: { method: "GET", url: "{{baseUrl}}/products/PRODUCT_ID" } }
      ]
    },
    {
      name: "4. Inquiries",
      item: [
        { name: "Submit Inquiry", request: { method: "POST", url: "{{baseUrl}}/inquiries", header: [{ key: "Authorization", value: "Bearer {{token}}" }], body: { mode: "raw", raw: JSON.stringify({ productCategory: "Marble", message: "I need 1000 sq_ft of white marble." }, null, 2), options: { raw: { language: "json" } } } } },
        { name: "Get Sent Inquiries", request: { method: "GET", url: "{{baseUrl}}/inquiries/sent", header: [{ key: "Authorization", value: "Bearer {{token}}" }] } },
        { name: "Get Received Inquiries", request: { method: "GET", url: "{{baseUrl}}/inquiries/received", header: [{ key: "Authorization", value: "Bearer {{token}}" }] } }
      ]
    },
    {
      name: "5. Admin",
      item: [
        { name: "Admin Dashboard Stats", request: { method: "GET", url: "{{baseUrl}}/admin/analytics", header: [{ key: "Authorization", value: "Bearer {{token}}" }] } },
        { name: "Verify Vendor", request: { method: "PUT", url: "{{baseUrl}}/admin/vendors/VENDOR_ID/verify", header: [{ key: "Authorization", value: "Bearer {{token}}" }], body: { mode: "raw", raw: JSON.stringify({ gstVerified: true, documentsVerified: true }, null, 2), options: { raw: { language: "json" } } } } }
      ]
    },
    {
      name: "6. Advertisements",
      item: [
        { name: "Get Active Ads", request: { method: "GET", url: "{{baseUrl}}/ads" } },
        { name: "Create Ad (Admin)", request: { method: "POST", url: "{{baseUrl}}/ads", header: [{ key: "Authorization", value: "Bearer {{token}}" }], body: { mode: "raw", raw: JSON.stringify({ title: "Summer Sale", adType: "home_banner", imageUrl: "http://example.com/img.jpg" }, null, 2), options: { raw: { language: "json" } } } } }
      ]
    },
    {
      name: "7. Search",
      item: [
        { name: "Global Search", request: { method: "GET", url: "{{baseUrl}}/search?q=Marble" } },
        { name: "Nearby Search", request: { method: "GET", url: "{{baseUrl}}/search/nearby?lat=26.9124&lng=75.7873&radius=50" } }
      ]
    },
    {
      name: "8. Users",
      item: [
        { name: "Get Saved Vendors", request: { method: "GET", url: "{{baseUrl}}/users/favorites", header: [{ key: "Authorization", value: "Bearer {{token}}" }] } }
      ]
    }
  ]
};

fs.writeFileSync('stone_market_india_postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection generated successfully.');
