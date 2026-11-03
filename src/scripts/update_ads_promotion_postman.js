const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '../../Auth_Registration_Postman_Collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Check if Ads & Promotion Module already exists
const existingIndex = collection.item.findIndex(i => i.name === 'Ads & Promotion Module');

const adsFolder = {
  name: 'Ads & Promotion Module',
  description: 'Stone Market India Phase 2 — Complete Ads & Promotion Management Module (Feed Promotion, Listing Boost, Orders, Payments, Invoices, Delivery, Admin)',
  item: [
    {
      name: 'Promotion Packages',
      item: [
        {
          name: 'Get All Promotion Packages',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/promotion-packages',
              host: ['{{base_url}}'],
              path: ['api', 'promotion-packages']
            },
            description: 'Fetch all active promotion packages publicly (both feed and listing)'
          }
        },
        {
          name: 'Get Feed Promotion Packages',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/promotion-packages?type=feed',
              host: ['{{base_url}}'],
              path: ['api', 'promotion-packages'],
              query: [{ key: 'type', value: 'feed' }]
            },
            description: 'Filter packages for product feed promotions (Starter, Growth, Mega Domination)'
          }
        },
        {
          name: 'Get Listing Boost Packages',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/promotion-packages?type=listing',
              host: ['{{base_url}}'],
              path: ['api', 'promotion-packages'],
              query: [{ key: 'type', value: 'listing' }]
            },
            description: 'Filter packages for manufacturer directory profile boosts (Top Rank, Diamond, State Dominance)'
          }
        },
        {
          name: 'Get Package by ID',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/promotion-packages/{{package_id}}',
              host: ['{{base_url}}'],
              path: ['api', 'promotion-packages', '{{package_id}}']
            }
          }
        }
      ]
    },
    {
      name: 'Ads Management Dashboard',
      item: [
        {
          name: 'Get Promotion Dashboard',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/dashboard',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'dashboard']
            },
            description: 'Main Ads Dashboard with promotion cards (blue/orange), KPI summary statistics, and recent campaigns'
          }
        },
        {
          name: 'Get Dynamic Campaign Statistics',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/statistics?period=30d',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'statistics'],
              query: [{ key: 'period', value: '30d' }]
            },
            description: 'Detailed campaign statistics: active campaigns, total inquiries, impressions, clicks, CTR, and growth'
          }
        },
        {
          name: 'Get Performance Growth Chart',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/performance?filter=30d',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'performance'],
              query: [{ key: 'filter', value: '30d' }]
            },
            description: 'Daily impressions, inquiries, and clicks time-series for interactive chart'
          }
        },
        {
          name: 'List All Manufacturer Campaigns',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions?type=all&status=all&page=1&limit=20',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions'],
              query: [
                { key: 'type', value: 'all' },
                { key: 'status', value: 'all' },
                { key: 'page', value: '1' },
                { key: 'limit', value: '20' }
              ]
            },
            description: 'Filterable promotion list with remaining days, CTR, and status'
          }
        },
        {
          name: 'List Feed Ads Only',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions?type=feed',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions'],
              query: [{ key: 'type', value: 'feed' }]
            }
          }
        },
        {
          name: 'List Listing Boosts Only',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions?type=listing',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions'],
              query: [{ key: 'type', value: 'listing' }]
            }
          }
        }
      ]
    },
    {
      name: 'Feed Promotion Workflow',
      item: [
        {
          name: 'Get Eligible Products for Feed Boost',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/eligible-products',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'eligible-products']
            },
            description: 'Selectable published products belonging to manufacturer'
          }
        },
        {
          name: 'Preview Feed Promotion Order & GST (18%)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                package_id: '{{feed_package_id}}',
                product_id: '{{product_id}}',
                targeting: {
                  all_india: false,
                  states: ['Rajasthan', 'Gujarat'],
                  districts: ['Jaipur', 'Ahmedabad']
                }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/feed/preview',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'feed', 'preview']
            },
            description: 'Calculates Subtotal, 18% GST (CGST/SGST or IGST), and Total Payable'
          }
        },
        {
          name: 'Launch Feed Promotion (Create Order)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                package_id: '{{feed_package_id}}',
                product_id: '{{product_id}}',
                campaign_name: 'Steel Grey Discovery Feed Blast',
                targeting: {
                  all_india: true
                }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/feed/create',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'feed', 'create']
            },
            description: 'Generates campaign in pending_payment, creates order, and returns Razorpay gateway order details'
          }
        }
      ]
    },
    {
      name: 'Listing Promotion Workflow',
      item: [
        {
          name: 'Preview Listing Boost Order & GST (18%)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                package_id: '{{listing_package_id}}',
                targeting: {
                  all_india: true
                }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/listing/preview',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'listing', 'preview']
            }
          }
        },
        {
          name: 'Activate Profile Boost (Create Order)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                package_id: '{{listing_package_id}}',
                campaign_name: 'Royal Rajasthan Top 3 Directory Boost',
                targeting: {
                  all_india: true
                }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/listing/create',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', 'listing', 'create']
            }
          }
        }
      ]
    },
    {
      name: 'Payment Gateway & Activation',
      item: [
        {
          name: 'Create Gateway Order',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                order_id: '{{order_number}}'
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/payments/create-order',
              host: ['{{base_url}}'],
              path: ['api', 'payments', 'create-order']
            }
          }
        },
        {
          name: 'Verify Payment Signature & Activate Campaign',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                order_id: '{{order_number}}',
                gateway_order_id: '{{gateway_order_id}}',
                gateway_payment_id: 'pay_mock_12345',
                gateway_signature: '{{valid_hmac_signature}}'
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/payments/verify',
              host: ['{{base_url}}'],
              path: ['api', 'payments', 'verify']
            },
            description: 'Verifies HMAC SHA256 signature, activates campaign, updates product/profile boost in marketplace, and generates tax invoice'
          }
        },
        {
          name: 'Payment Gateway Webhook',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'x-razorpay-signature', value: 'webhook_sig' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                event: 'payment.captured',
                payload: {
                  payment: {
                    entity: {
                      id: 'pay_webhook_999',
                      order_id: '{{gateway_order_id}}'
                    }
                  }
                }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/payments/webhook',
              host: ['{{base_url}}'],
              path: ['api', 'payments', 'webhook']
            }
          }
        },
        {
          name: 'Get Payment Status',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/payments/{{payment_id}}/status',
              host: ['{{base_url}}'],
              path: ['api', 'payments', '{{payment_id}}', 'status']
            }
          }
        }
      ]
    },
    {
      name: 'Campaign Management & Lifecycle',
      item: [
        {
          name: 'Get Campaign Details & Ad Preview',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}']
            },
            description: 'Detailed campaign view with KPIs, growth percentages, targeting, budget, and live marketplace ad preview'
          }
        },
        {
          name: 'Ad Preview in Marketplace Format',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}/preview',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}', 'preview']
            }
          }
        },
        {
          name: 'Pause Active Campaign',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ reason: 'Temporary pause' }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}/pause',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}', 'pause']
            }
          }
        },
        {
          name: 'Resume Paused Campaign',
          request: {
            method: 'POST',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}/resume',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}', 'resume']
            }
          }
        },
        {
          name: 'End Campaign Permanently',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ reason: 'Campaign ended by manufacturer' }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}/end',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}', 'end']
            }
          }
        },
        {
          name: 'Record Campaign Delivery Event',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                event_type: 'impression',
                source: 'buyer_feed',
                location: { state: 'Rajasthan', district: 'Jaipur' }
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/manufacturer/promotions/{{campaign_id}}/event',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'promotions', '{{campaign_id}}', 'event']
            }
          }
        }
      ]
    },
    {
      name: 'Invoices & PDF Stream',
      item: [
        {
          name: 'List Manufacturer Invoices',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/invoices',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'invoices']
            }
          }
        },
        {
          name: 'Get Invoice Details',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/invoices/{{invoice_id}}',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'invoices', '{{invoice_id}}']
            }
          }
        },
        {
          name: 'Download Invoice PDF Stream',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{manufacturer_token}}' }],
            url: {
              raw: '{{base_url}}/api/manufacturer/invoices/{{invoice_id}}/download',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturer', 'invoices', '{{invoice_id}}', 'download']
            },
            description: 'Streams immutable A4 Tax Invoice PDF with GST breakdown'
          }
        }
      ]
    },
    {
      name: 'Marketplace Ad Delivery',
      item: [
        {
          name: 'Get Home Feed with Sponsored Products',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/feed',
              host: ['{{base_url}}'],
              path: ['api', 'feed']
            },
            description: 'Displays active sponsored products prioritized at top with is_sponsored: true and Sponsored badge'
          }
        },
        {
          name: 'Get Directory with Promoted Suppliers Ranked Top',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: '{{base_url}}/api/manufacturers',
              host: ['{{base_url}}'],
              path: ['api', 'manufacturers']
            },
            description: 'Ranks boosted manufacturers at top with is_promoted: true and Featured Supplier badge'
          }
        }
      ]
    },
    {
      name: 'Admin Promotion Management',
      item: [
        {
          name: 'List Admin Packages',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/packages',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'packages']
            }
          }
        },
        {
          name: 'Create Promotion Package (Admin)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{admin_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                promotion_type: 'feed',
                package_name: 'Custom Trade Blast',
                price: 1299,
                duration_days: 20,
                promotional_multiplier: '7x Inquiries',
                benefits: ['High priority trade discovery', 'Verified sponsored badge']
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/admin/promotions/packages',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'packages']
            }
          }
        },
        {
          name: 'Update Package Pricing (Admin)',
          request: {
            method: 'PUT',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{admin_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ price: 1499 }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/admin/promotions/packages/{{package_id}}',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'packages', '{{package_id}}']
            }
          }
        },
        {
          name: 'Deactivate Package (Admin)',
          request: {
            method: 'DELETE',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/packages/{{package_id}}',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'packages', '{{package_id}}']
            }
          }
        },
        {
          name: 'List All Campaigns (Admin)',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/campaigns?page=1&limit=20',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'campaigns']
            }
          }
        },
        {
          name: 'Admin Pause Campaign',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{admin_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ reason: 'Admin moderation pause' }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/admin/promotions/campaigns/{{campaign_id}}/pause',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'campaigns', '{{campaign_id}}', 'pause']
            }
          }
        },
        {
          name: 'Admin Resume Campaign',
          request: {
            method: 'POST',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/campaigns/{{campaign_id}}/resume',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'campaigns', '{{campaign_id}}', 'resume']
            }
          }
        },
        {
          name: 'Admin End Campaign',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{admin_token}}' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ reason: 'Terminated by admin' }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/admin/promotions/campaigns/{{campaign_id}}/end',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'campaigns', '{{campaign_id}}', 'end']
            }
          }
        },
        {
          name: 'List All Promotion Orders (Admin)',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/orders',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'orders']
            }
          }
        },
        {
          name: 'List All Invoices (Admin)',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/invoices',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'invoices']
            }
          }
        },
        {
          name: 'Get Admin Promotion Financial Statistics',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{admin_token}}' }],
            url: {
              raw: '{{base_url}}/api/admin/promotions/statistics',
              host: ['{{base_url}}'],
              path: ['api', 'admin', 'promotions', 'statistics']
            }
          }
        }
      ]
    }
  ]
};

if (existingIndex >= 0) {
  collection.item[existingIndex] = adsFolder;
  console.log('Updated existing "Ads & Promotion Module" folder in collection.');
} else {
  collection.item.push(adsFolder);
  console.log('Added new "Ads & Promotion Module" folder to collection.');
}

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Successfully updated Auth_Registration_Postman_Collection.json!');
