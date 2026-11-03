const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '../../Auth_Registration_Postman_Collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

const inquiryFolder = {
  name: 'Inquiry & Lead Management Module',
  description: 'Complete Phase 3 Inquiry & Lead Management module for Manufacturer dashboard with search, 4 status tabs, requirement details, 4-stage progress tracker, quotation calculations, side-by-side comparison matrix, communication threads, and branded PDF generation.',
  item: [
    {
      name: '1. Main Screen & Listing',
      item: [
        {
          name: 'Get All Inquiries (Cards & Pagination)',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries?status=all&page=1&limit=15',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries'],
              query: [
                { key: 'status', value: 'all' },
                { key: 'page', value: '1' },
                { key: 'limit', value: '15' }
              ]
            }
          }
        },
        {
          name: 'Filter Quotes Received Tab',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries?status=quotes_received',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries'],
              query: [{ key: 'status', value: 'quotes_received' }]
            }
          }
        },
        {
          name: 'Filter Pending Tab',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries?status=pending',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries'],
              query: [{ key: 'status', value: 'pending' }]
            }
          }
        },
        {
          name: 'Filter Closed Tab',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries?status=closed',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries'],
              query: [{ key: 'status', value: 'closed' }]
            }
          }
        },
        {
          name: 'Search Inquiries (Requirement, City, ID)',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries?search=Jaipur',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries'],
              query: [{ key: 'search', value: 'Jaipur' }]
            }
          }
        },
        {
          name: 'Dedicated Search Endpoint',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/search?q=Galaxy',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', 'search'],
              query: [{ key: 'q', value: 'Galaxy' }]
            }
          }
        },
        {
          name: 'Get Inquiry Tab Counts & Lead Statistics',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/statistics',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', 'statistics']
            }
          }
        }
      ]
    },
    {
      name: '2. Inquiry Details Screen',
      item: [
        {
          name: 'Get Complete Inquiry Details (Summary & 4-Stage Progress Tracker)',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}']
            }
          }
        },
        {
          name: 'Get Requirement Specifications & Delivery Info',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/requirements',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'requirements']
            }
          }
        },
        {
          name: 'Get Inquiry Attachments',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/attachments',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'attachments']
            }
          }
        },
        {
          name: 'Get Inquiry Activity History Logs',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/activity',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'activity']
            }
          }
        },
        {
          name: 'Download Branded Inquiry PDF Stream',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/download',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'download']
            }
          }
        }
      ]
    },
    {
      name: '3. Quotations Management & Comparison',
      item: [
        {
          name: 'Submit Quotation against Requirement',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/quotes',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'quotes']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                quoted_quantity: 500,
                quantity_unit: 'Sq.ft',
                unit_price: 175,
                tax_rate: 18,
                shipping_charges: 4500,
                discount: 1000,
                material: 'Granite',
                size: '10 × 6 ft',
                thickness: '18 mm',
                finish: 'Mirror Polished',
                quality: 'Export Quality Grade A',
                delivery_timeline: '7-10 Business Days',
                payment_terms: '50% Advance, 50% on Dispatch',
                advance_payment: 50,
                balance_payment: 50,
                validity_days: 15,
                warranty: '1 Year Quality Guarantee',
                notes: 'Premium export Gangsaw cut Black Galaxy slabs from Jalore facility.'
              }, null, 2)
            }
          }
        },
        {
          name: 'Get Quotations Received List',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/quotes',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'quotes']
            }
          }
        },
        {
          name: 'Compare Competing Quotations Matrix',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/quotes/compare',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'quotes', 'compare']
            }
          }
        },
        {
          name: 'Get Quotation Detailed View Screen',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/quotes/{{quote_id}}',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'quotes', '{{quote_id}}']
            }
          }
        },
        {
          name: 'Update Quotation',
          request: {
            method: 'PUT',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/quotes/{{quote_id}}',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'quotes', '{{quote_id}}']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                unit_price: 170,
                discount: 1500,
                notes: 'Special revised offer with priority factory loading.'
              }, null, 2)
            }
          }
        },
        {
          name: 'Withdraw Quotation',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/quotes/{{quote_id}}/withdraw',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'quotes', '{{quote_id}}', 'withdraw']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                reason: 'Raw block inventory allocated to export order'
              }, null, 2)
            }
          }
        }
      ]
    },
    {
      name: '4. Inquiry Lifecycle Management',
      item: [
        {
          name: 'Mark Requirement In Review (Stage 2)',
          request: {
            method: 'POST',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/review',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'review']
            }
          }
        },
        {
          name: 'Close Inquiry with Reason & Confirmation Dialog',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/close',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'close']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                closure_reason: 'Order finalized with offline buyer',
                comments: 'Material dispatched directly from factory.'
              }, null, 2)
            }
          }
        },
        {
          name: 'Reopen Closed Inquiry',
          request: {
            method: 'POST',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/reopen',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'reopen']
            }
          }
        }
      ]
    },
    {
      name: '5. Inquiry-Linked Messaging Thread',
      item: [
        {
          name: 'Get Conversation Thread & Unread Count',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/messages',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'messages']
            }
          }
        },
        {
          name: 'Send Message Linked to Inquiry',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/messages',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'messages']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                message: 'Hello, we have ready stock of 10x6 ft Black Galaxy slabs at our Jalore unit. Let us know if you need physical sample dispatch.'
              }, null, 2)
            }
          }
        },
        {
          name: 'Mark Unread Messages as Read',
          request: {
            method: 'POST',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
            ],
            url: {
              raw: '{{baseUrl}}/api/manufacturer/inquiries/{{inquiry_id}}/messages/read',
              host: ['{{baseUrl}}'],
              path: ['api', 'manufacturer', 'inquiries', '{{inquiry_id}}', 'messages', 'read']
            }
          }
        }
      ]
    }
  ]
};

// Check if Inquiry & Lead Management Module already exists
const existingIndex = collection.item.findIndex(i => i.name === 'Inquiry & Lead Management Module');
if (existingIndex >= 0) {
  collection.item[existingIndex] = inquiryFolder;
  console.log('Updated existing "Inquiry & Lead Management Module" folder.');
} else {
  collection.item.push(inquiryFolder);
  console.log('Appended "Inquiry & Lead Management Module" folder to collection.');
}

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Successfully updated Auth_Registration_Postman_Collection.json with Phase 3 Inquiry endpoints.');
