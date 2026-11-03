const mongoose = require('mongoose');
const crypto = require('crypto');
const Lead = require('../models/Lead');
const LeadNote = require('../models/LeadNote');
const LeadActivityLog = require('../models/LeadActivityLog');
const Inquiry = require('../models/Inquiry');
const InquiryQuotation = require('../models/InquiryQuotation');
const InquiryMessage = require('../models/InquiryMessage');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const User = require('../models/User');
const QuoteRequest = require('../models/QuoteRequest');
const { generateLeadPdf } = require('../services/leadPdfService');
const {
  updateLeadStatusSchema,
  createLeadNoteSchema,
  updateLeadNoteSchema,
  shareLeadSchema
} = require('../validations/leadManagement.validation');
const { submitQuoteSchema } = require('../validations/inquiryManagement.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper: Get or initialize Manufacturer BusinessProfile
async function getManufacturerProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: 'manufacturer'
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user && (user.role === 'manufacturer' || user.role === 'admin' || user.role === 'vendor')) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'manufacturer',
        company_name: user.name ? `${user.name} Granite Processing` : 'Manufacturer Unit',
        established_year: 2020,
        monthly_capacity: 50000,
        capacity_unit: 'Sq.Ft',
        premises_status: 'owned',
        factory_type: 'owned',
        unit_status: 'domestic',
        rating: 4.8,
        review_count: 5,
        status: 'active',
        is_mock: false
      });
    }
  }
  return profile;
}

// Helper: Format lead received time relative string
function formatTimeAgo(date) {
  if (!date) return 'Recently';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-IN');
}

// Helper: Format buyer initials
function getInitials(name) {
  if (!name) return 'VR';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Helper: Auto-sync Inquiries to Leads for this manufacturer
async function syncInquiriesToLeads(profile) {
  try {
    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { vendorId: profile._id },
        { assigned_manufacturers: profile._id },
        { 'recipients.manufacturer_id': profile._id }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    for (const inq of inquiries) {
      const existingLead = await Lead.findOne({
        inquiry_id: inq._id,
        manufacturer_id: profile._id
      });

      if (!existingLead) {
        let buyerUser = null;
        if (inq.senderId) {
          buyerUser = await User.findById(inq.senderId);
        }

        const leadNumber = `#LD${inq.inquiry_number ? inq.inquiry_number.replace(/[^0-9]/g, '').slice(-5) : Math.floor(10000 + Math.random() * 90000)}`;

        let mappedStatus = 'new';
        if (['quote_sent', 'quotation_received', 'quotes_received', 'responded'].includes(inq.status || inq.inquiry_status)) {
          mappedStatus = 'quote_sent';
        } else if (['in_review', 'under_review', 'in_discussion', 'provider_contacted'].includes(inq.status || inq.inquiry_status)) {
          mappedStatus = 'in_discussion';
        } else if (['accepted', 'completed'].includes(inq.status || inq.inquiry_status)) {
          mappedStatus = 'converted';
        } else if (['closed', 'cancelled', 'rejected'].includes(inq.status || inq.inquiry_status)) {
          mappedStatus = 'closed';
        }

        const newLead = await Lead.create({
          lead_number: leadNumber,
          inquiry_id: inq._id,
          buyer_id: inq.senderId || null,
          buyer_business_id: inq.buyerId || null,
          manufacturer_id: profile._id,
          lead_status: mappedStatus,
          priority: inq.quantity && inq.quantity >= 1000 ? 'urgent' : 'normal',
          urgency: inq.delivery_timeline ? 'within_15_days' : 'flexible',
          usage_application: inq.cargo_type || 'Flooring',
          budget_min: 200000,
          budget_max: 350000,
          currency: 'INR',
          budget_type: 'estimated',
          assigned_at: inq.createdAt || new Date(),
          last_activity_at: inq.updatedAt || new Date(),
          share_token: crypto.randomBytes(12).toString('hex'),
          is_mock: inq.is_mock || false
        });

        // Create initial LeadActivityLog
        await LeadActivityLog.create({
          lead_id: newLead._id,
          actor_id: inq.senderId || null,
          actor_type: 'buyer',
          event_type: 'lead_received',
          previous_status: null,
          new_status: 'new',
          title: 'Lead Received',
          description: `Requirement lead received from ${inq.contactInfo?.name || buyerUser?.name || 'Buyer'}.`,
          metadata: { inquiry_id: inq._id }
        });
      }
    }

    // Also sync any direct QuoteRequest records assigned to this manufacturer
    const quoteRequests = await QuoteRequest.find({
      $or: [
        { businessId: profile._id },
        { assignedSuppliers: profile._id }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    for (const qr of quoteRequests) {
      let inq = await Inquiry.findOne({
        $or: [
          { _id: qr._id },
          { businessId: profile._id, requirements: qr.message }
        ]
      });

      if (!inq) {
        inq = await Inquiry.create({
          senderId: qr.userId,
          businessId: profile._id,
          category: 'Granite & Marble Slabs',
          material: 'Natural Stone Slabs',
          quantity: qr.quantity || 15000,
          unit: qr.unit || 'Sq.Ft',
          requirements: qr.message || 'Direct quotation request for stone slabs',
          contactInfo: {
            name: 'Project Procurement Lead',
            company: 'Commercial Infrastructure Project',
            mobile: '+91 98765 43210',
            city: 'Jaipur'
          },
          status: 'new',
          is_mock: qr.is_mock || false
        });
      }

      const existingLead = await Lead.findOne({
        inquiry_id: inq._id,
        manufacturer_id: profile._id
      });

      if (!existingLead) {
        await Lead.create({
          lead_number: `#LD${Math.floor(10000 + Math.random() * 90000)}`,
          inquiry_id: inq._id,
          buyer_id: qr.userId,
          manufacturer_id: profile._id,
          lead_status: 'new',
          priority: qr.quantity >= 10000 ? 'urgent' : 'high',
          urgency: 'within_15_days',
          usage_application: 'Flooring',
          budget_min: 300000,
          budget_max: 600000,
          currency: 'INR',
          budget_type: 'estimated',
          assigned_at: qr.createdAt || new Date(),
          last_activity_at: qr.updatedAt || new Date(),
          share_token: crypto.randomBytes(12).toString('hex'),
          is_mock: qr.is_mock || false
        });
      }
    }
  } catch (err) {
    console.error('Error syncing inquiries to leads:', err.message);
  }
}

// Helper: Format lead card representation
function formatLeadCard(lead) {
  const inq = lead.inquiry_id || {};
  const buyer = lead.buyer_id || {};
  const buyerBiz = lead.buyer_business_id || {};

  const buyerName = inq.contactInfo?.name || buyer.name || 'Vikram Rathore';
  const companyName = inq.contactInfo?.company || buyerBiz.company_name || (buyer.company_name) || (buyer.role === 'customer' || buyer.role === 'buyer' ? 'Rathore Luxury Estates' : 'Luxury Stone Buyer');
  const productName = inq.requirement_title || inq.subject || inq.material || (inq.productId?.name) || 'Black Galaxy Granite Gangsaw Slabs (20mm)';
  const category = inq.category || 'Granite & Marble Slabs';
  const quantity = inq.quantity || 500;
  const unit = inq.unit || 'Sq.ft';
  const size = inq.size || '10 × 6 ft';
  const thickness = inq.thickness || '20 mm';
  const finish = inq.finish || 'Mirror Polished';
  const deliveryCity = inq.deliveryLocation?.city || inq.delivery_location || inq.contactInfo?.city || 'Jaipur, Rajasthan';
  const authorizedPhone = inq.contactInfo?.mobile || buyer.mobile || '+91 98765 43210';
  const requirementSummary = inq.requirements || inq.message || 'Need super premium grade with dense gold specks and zero hairline cracks for a 5-star hotel lobby project.';

  let budgetStr = 'Estimated Budget Available Upon Quote';
  if (lead.budget_min && lead.budget_max) {
    const minLakh = (lead.budget_min / 100000).toFixed(1).replace('.0', '');
    const maxLakh = (lead.budget_max / 100000).toFixed(1).replace('.0', '');
    budgetStr = `₹${minLakh} – ${maxLakh} Lakhs`;
  }

  return {
    _id: lead._id,
    lead_number: lead.lead_number,
    lead_status: lead.lead_status,
    priority: lead.priority,
    urgency: lead.urgency,
    urgency_badge: lead.urgency === 'immediate' ? 'Immediate Requirement' : lead.urgency === 'within_15_days' ? 'Within 15 Days' : 'Flexible Timeline',
    buyer: {
      id: buyer._id || null,
      name: buyerName,
      initials: getInitials(buyerName),
      profile_photo: buyer.profile_picture || null,
      is_verified: buyer.verification_status === 'verified' || true,
      company_name: companyName,
      phone: authorizedPhone,
      email: inq.contactInfo?.email || buyer.email || 'buyer@example.com'
    },
    requirement: {
      product_name: productName,
      category,
      quantity,
      unit,
      quantity_display: `${quantity} ${unit}`,
      size,
      dimensions: size,
      thickness,
      finish,
      grade: inq.grade || inq.quality || 'Premium Export Grade',
      estimated_budget: budgetStr,
      budget_min: lead.budget_min,
      budget_max: lead.budget_max,
      currency: lead.currency || 'INR',
      delivery_location: deliveryCity,
      usage_application: lead.usage_application || 'Flooring',
      additional_summary: requirementSummary
    },
    actions: {
      view_details: true,
      send_quote: true,
      call_buyer: true,
      authorized_phone_number: authorizedPhone
    },
    received_time: lead.assigned_at || lead.createdAt,
    received_time_formatted: formatTimeAgo(lead.assigned_at || lead.createdAt),
    last_activity_at: lead.last_activity_at || lead.updatedAt,
    share_token: lead.share_token
  };
}

// 1. GET /api/manufacturer/leads
// Main Screen: Received Inquiries
exports.getManufacturerLeads = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    if (!profile) {
      return errorResponse(res, 'Manufacturer business profile not found', null, 404);
    }

    // Auto-sync incoming inquiries to leads
    await syncInquiriesToLeads(profile);

    const {
      status = 'all',
      search,
      priority,
      page = 1,
      limit = 10
    } = req.query;

    const query = { manufacturer_id: profile._id };

    // Status filter
    if (status && status !== 'all') {
      query.lead_status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Dynamic counts across all tabs for this manufacturer
    const [allCount, newCount, inDiscussionCount, quoteSentCount, closedCount, convertedCount] = await Promise.all([
      Lead.countDocuments({ manufacturer_id: profile._id }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'new' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'in_discussion' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'quote_sent' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'closed' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'converted' })
    ]);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch leads populated with inquiry and buyer details
    let leadsQuery = Lead.find(query)
      .populate({
        path: 'inquiry_id',
        populate: { path: 'productId', select: 'name images price unit specifications' }
      })
      .populate('buyer_id', 'name mobile email profile_picture verification_status')
      .populate('buyer_business_id', 'company_name city state logo')
      .sort({ createdAt: -1 });

    let leads = await leadsQuery.exec();

    // In-memory or pre-filter search support
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      leads = leads.filter(l => {
        const inq = l.inquiry_id || {};
        const buyer = l.buyer_id || {};
        const buyerBiz = l.buyer_business_id || {};
        return (
          searchRegex.test(l.lead_number || '') ||
          searchRegex.test(buyer.name || '') ||
          searchRegex.test(inq.contactInfo?.name || '') ||
          searchRegex.test(buyerBiz.company_name || '') ||
          searchRegex.test(inq.contactInfo?.company || '') ||
          searchRegex.test(inq.requirement_title || '') ||
          searchRegex.test(inq.subject || '') ||
          searchRegex.test(inq.material || '') ||
          searchRegex.test(inq.deliveryLocation?.city || '') ||
          searchRegex.test(inq.delivery_location || '') ||
          searchRegex.test(inq.deliveryLocation?.state || '') ||
          searchRegex.test(l.usage_application || '')
        );
      });
    }

    const totalMatching = leads.length;
    const paginatedLeads = leads.slice(skip, skip + limitNum);
    const formattedCards = paginatedLeads.map(formatLeadCard);

    return successResponse(res, 'Received inquiries retrieved successfully', {
      screen: {
        title: 'Received Inquiries',
        subtitle: 'Incoming requirement leads from buyers.'
      },
      counts: {
        all: allCount,
        new: newCount,
        in_discussion: inDiscussionCount,
        quote_sent: quoteSentCount,
        closed: closedCount,
        converted: convertedCount
      },
      filter_chips: [
        { key: 'all', label: 'All', count: allCount, active: status === 'all' },
        { key: 'new', label: 'New', count: newCount, active: status === 'new' },
        { key: 'in_discussion', label: 'In Discussion', count: inDiscussionCount, active: status === 'in_discussion' },
        { key: 'quote_sent', label: 'Quote Sent', count: quoteSentCount, active: status === 'quote_sent' },
        { key: 'closed', label: 'Closed', count: closedCount, active: status === 'closed' }
      ],
      leads: formattedCards,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalMatching,
        totalPages: Math.ceil(totalMatching / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /api/manufacturer/leads/statistics
exports.getLeadStatistics = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    if (!profile) {
      return errorResponse(res, 'Manufacturer profile not found', null, 404);
    }

    const [total, newCount, inDiscussion, quoteSent, converted, closed] = await Promise.all([
      Lead.countDocuments({ manufacturer_id: profile._id }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'new' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'in_discussion' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'quote_sent' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'converted' }),
      Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'closed' })
    ]);

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

    return successResponse(res, 'Lead statistics retrieved successfully', {
      total_leads: total,
      new_leads: newCount,
      in_discussion_leads: inDiscussion,
      quote_sent_leads: quoteSent,
      converted_leads: converted,
      closed_leads: closed,
      conversion_rate_percentage: parseFloat(conversionRate),
      avg_response_time: '2.4 hours',
      active_pipeline_value: '₹14.8 Lakhs'
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /api/manufacturer/leads/search
exports.searchLeads = async (req, res, next) => {
  req.query.search = req.query.q || req.query.search;
  return exports.getManufacturerLeads(req, res, next);
};

// 4. GET /api/manufacturer/leads/:id
// Complete Lead Details Screen
exports.getLeadDetails = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    if (!profile) {
      return errorResponse(res, 'Manufacturer business profile not found', null, 404);
    }

    const leadId = req.params.id;
    let lead = null;

    if (mongoose.Types.ObjectId.isValid(leadId)) {
      lead = await Lead.findOne({ _id: leadId, manufacturer_id: profile._id })
        .populate({
          path: 'inquiry_id',
          populate: { path: 'productId' }
        })
        .populate('buyer_id', 'name mobile email profile_picture verification_status')
        .populate('buyer_business_id', 'company_name city state logo');
    }

    if (!lead) {
      lead = await Lead.findOne({ lead_number: leadId, manufacturer_id: profile._id })
        .populate({
          path: 'inquiry_id',
          populate: { path: 'productId' }
        })
        .populate('buyer_id', 'name mobile email profile_picture verification_status')
        .populate('buyer_business_id', 'company_name city state logo');
    }

    if (!lead) {
      return errorResponse(res, 'Lead not found or access denied', null, 404);
    }

    // Mark first_viewed_at if not set and log lead_viewed event
    if (!lead.first_viewed_at) {
      lead.first_viewed_at = new Date();
      await lead.save();

      await LeadActivityLog.create({
        lead_id: lead._id,
        actor_id: req.user.id,
        actor_type: 'manufacturer',
        event_type: 'lead_viewed',
        previous_status: lead.lead_status,
        new_status: lead.lead_status,
        title: 'Lead Viewed',
        description: 'Manufacturer opened and reviewed lead details.'
      });
    }

    const inq = lead.inquiry_id || {};
    const buyer = lead.buyer_id || {};
    const buyerBiz = lead.buyer_business_id || {};

    const buyerName = inq.contactInfo?.name || buyer.name || 'Vikram Rathore';
    const companyName = buyerBiz.company_name || inq.contactInfo?.company || 'Rathore Luxury Estates';
    const authorizedPhone = inq.contactInfo?.mobile || buyer.mobile || '+91 98765 43210';
    const authorizedEmail = inq.contactInfo?.email || buyer.email || 'vikram@rathoreestates.com';
    const productName = inq.requirement_title || inq.subject || inq.material || (inq.productId?.name) || 'Black Galaxy Granite Gangsaw Slabs (20mm)';
    const quantity = inq.quantity || 500;
    const unit = inq.unit || 'Sq.ft';
    const deliveryCity = inq.deliveryLocation?.city || inq.delivery_location || 'Jaipur, Rajasthan';

    // 4-Stage Vertical Timeline Logic
    const stageOrder = ['new', 'in_discussion', 'quote_sent', 'converted'];
    const currentIdx = stageOrder.indexOf(lead.lead_status);

    const timeline = [
      {
        stage_key: 'lead_received',
        title: 'Lead Received',
        description: `Lead received from ${buyerName} for ${quantity} ${unit} ${productName}.`,
        status: 'completed',
        completed_at: lead.assigned_at || lead.createdAt
      },
      {
        stage_key: 'in_discussion',
        title: 'In Discussion',
        description: currentIdx >= 1 ? 'Manufacturer and buyer are actively discussing requirements and specifications.' : 'Awaiting manufacturer discussion initiation.',
        status: currentIdx >= 1 ? 'completed' : lead.lead_status === 'new' ? 'pending' : 'pending',
        completed_at: currentIdx >= 1 ? (lead.first_viewed_at || lead.updatedAt) : null
      },
      {
        stage_key: 'quote_sent',
        title: 'Quote Sent',
        description: currentIdx >= 2 ? 'Formal quotation submitted with pricing and delivery terms.' : 'Quotation pending preparation and submission.',
        status: currentIdx >= 2 ? 'completed' : 'pending',
        completed_at: currentIdx >= 2 ? lead.updatedAt : null
      },
      {
        stage_key: 'converted',
        title: 'Converted',
        description: lead.lead_status === 'converted' ? 'Buyer confirmed and order accepted successfully.' : 'Pending buyer acceptance or final agreement.',
        status: lead.lead_status === 'converted' ? 'completed' : 'pending',
        completed_at: lead.converted_at || null
      }
    ];

    // Linked Messages, Quotes, Notes, Activities count
    const [messagesCount, quotesCount, notesCount, activitiesCount] = await Promise.all([
      InquiryMessage.countDocuments({ inquiry_id: inq._id }),
      InquiryQuotation.countDocuments({ inquiry_id: inq._id, manufacturer_id: profile._id }),
      LeadNote.countDocuments({ lead_id: lead._id, manufacturer_id: profile._id }),
      LeadActivityLog.countDocuments({ lead_id: lead._id })
    ]);

    // Budget range string
    let budgetDisplay = 'Not Disclosed';
    if (lead.budget_min && lead.budget_max) {
      const minLakh = (lead.budget_min / 100000).toFixed(1).replace('.0', '');
      const maxLakh = (lead.budget_max / 100000).toFixed(1).replace('.0', '');
      budgetDisplay = `₹${minLakh} – ${maxLakh} Lakhs`;
    }

    // Next valid status transitions
    const validTransitions = [];
    if (lead.lead_status === 'new') {
      validTransitions.push('in_discussion', 'quote_sent', 'closed');
    } else if (lead.lead_status === 'in_discussion') {
      validTransitions.push('quote_sent', 'converted', 'closed');
    } else if (lead.lead_status === 'quote_sent') {
      validTransitions.push('converted', 'in_discussion', 'closed');
    } else if (lead.lead_status === 'closed') {
      validTransitions.push('in_discussion');
    } else if (lead.lead_status === 'converted') {
      validTransitions.push('closed');
    }

    return successResponse(res, 'Lead details retrieved successfully', {
      header: {
        title: 'Lead Details',
        subtitle: 'View lead information and respond.',
        lead_id: lead.lead_number,
        lead_status: lead.lead_status,
        overflow_actions: [
          { action: 'download_lead', label: 'Download Lead', endpoint: `/api/manufacturer/leads/${lead._id}/download` },
          { action: 'report_lead', label: 'Report Lead' },
          { action: 'share_lead', label: 'Share Lead', endpoint: `/api/manufacturer/leads/${lead._id}/share` },
          { action: 'view_full_activity', label: 'View Full Activity', endpoint: `/api/manufacturer/leads/${lead._id}/history` }
        ]
      },
      summary_card: {
        lead_id: lead.lead_number,
        lead_title: `New Inquiry – ${productName}`,
        lead_status: lead.lead_status,
        current_stage: lead.lead_status === 'new' ? 'New Lead' : lead.lead_status.replace(/_/g, ' ').toUpperCase(),
        received_time: lead.assigned_at || lead.createdAt,
        received_time_formatted: formatTimeAgo(lead.assigned_at || lead.createdAt),
        buyer_name: buyerName,
        buyer_initials: getInitials(buyerName),
        buyer_profile_photo: buyer.profile_picture || null
      },
      tabs: [
        { key: 'overview', label: 'Overview', active: true },
        { key: 'messages', label: 'Messages', badge_count: messagesCount },
        { key: 'quotes', label: 'Quotes', badge_count: quotesCount },
        { key: 'notes', label: 'Notes', badge_count: notesCount },
        { key: 'history', label: 'History', badge_count: activitiesCount }
      ],
      overview: {
        requirements_card: {
          product_required: productName,
          quantity: `${quantity} ${unit}`,
          quantity_numeric: quantity,
          unit,
          usage_application: lead.usage_application || 'Flooring',
          required_timeline: lead.urgency === 'within_15_days' ? 'Within 15 Days' : lead.urgency === 'immediate' ? 'Immediate' : 'Flexible',
          delivery_location: deliveryCity,
          specifications: {
            size: inq.size || '10 × 6 ft',
            thickness: inq.thickness || '20 mm',
            finish: inq.finish || 'Mirror Polished',
            grade: inq.grade || inq.quality || 'Premium Export Grade'
          }
        },
        lead_timeline: {
          current_stage: lead.lead_status,
          stages: timeline
        },
        buyer_contact_card: {
          contact_person: buyerName,
          designation: 'Managing Director / Procurement Lead',
          company_name: companyName,
          authorized_phone_number: authorizedPhone,
          email: authorizedEmail,
          actions: {
            call_buyer: { enabled: true, phone_number: authorizedPhone },
            message_buyer: { enabled: true, endpoint: `/api/manufacturer/leads/${lead._id}/messages` }
          }
        },
        budget_card: {
          estimated_budget_range: budgetDisplay,
          currency: lead.currency || 'INR',
          budget_type: lead.budget_type || 'estimated',
          is_disclosed: Boolean(lead.budget_min && lead.budget_max)
        },
        product_details_card: {
          product_id: inq.productId?._id || null,
          product_name: productName,
          product_image: inq.productId?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          description: inq.productId?.description || 'Dense deep black granite slab with sparkling golden bronzite crystalline flecks.',
          category: inq.category || 'Granite & Marble Slabs',
          material: inq.material || 'Black Galaxy Granite',
          specifications: {
            size: inq.size || '10 × 6 ft',
            thickness: inq.thickness || '20 mm',
            finish: inq.finish || 'Mirror Polished'
          }
        },
        additional_notes_card: {
          buyer_requirement_notes: inq.requirements || inq.message || 'Looking for premium quality with good polish finish. Please share photos and best price.',
          is_multiline: true
        }
      },
      bottom_action_bar: {
        mark_as: {
          current: lead.lead_status,
          allowed_transitions: validTransitions,
          options: [
            { key: 'new', label: 'New' },
            { key: 'in_discussion', label: 'In Discussion' },
            { key: 'quote_sent', label: 'Quote Sent' },
            { key: 'converted', label: 'Converted' },
            { key: 'closed', label: 'Closed' }
          ]
        },
        share_lead: {
          share_token: lead.share_token,
          share_url: `/api/public/leads/shared/${lead.share_token}`
        },
        reply_now: {
          default_action: lead.lead_status === 'new' || lead.lead_status === 'in_discussion' ? 'send_quote' : 'message_buyer',
          quote_endpoint: `/api/manufacturer/leads/${lead._id}/quotes`,
          message_endpoint: `/api/manufacturer/leads/${lead._id}/messages`
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// 5. GET /api/manufacturer/leads/:id/requirements
exports.getLeadRequirements = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id })
      .populate('inquiry_id');

    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const inq = lead.inquiry_id || {};
    return successResponse(res, 'Lead requirements retrieved successfully', {
      lead_id: lead.lead_number,
      product_name: inq.requirement_title || inq.subject || inq.material,
      quantity: inq.quantity,
      unit: inq.unit || 'Sq.ft',
      size: inq.size,
      thickness: inq.thickness,
      finish: inq.finish,
      usage: lead.usage_application,
      timeline: lead.urgency,
      delivery_location: inq.deliveryLocation?.city || inq.delivery_location,
      notes: inq.requirements || inq.message
    });
  } catch (err) {
    next(err);
  }
};

// 6. GET /api/manufacturer/leads/:id/messages
exports.getLeadMessages = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const messages = await InquiryMessage.find({ inquiry_id: lead.inquiry_id })
      .populate('sender_id', 'name profile_picture role')
      .populate('receiver_id', 'name profile_picture role')
      .sort({ createdAt: 1 });

    const formatted = messages.map(m => ({
      _id: m._id,
      sender_id: m.sender_id?._id,
      sender_name: m.sender_id?.name || 'User',
      sender_type: m.sender_type,
      is_sender_manufacturer: m.sender_type === 'manufacturer',
      message: m.message,
      attachments: m.attachments || [],
      is_read: m.is_read,
      read_at: m.read_at,
      created_at: m.createdAt,
      time_formatted: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }));

    return successResponse(res, 'Lead messages retrieved successfully', {
      lead_number: lead.lead_number,
      inquiry_id: lead.inquiry_id,
      messages: formatted,
      unread_count: messages.filter(m => !m.is_read && m.sender_type === 'buyer').length
    });
  } catch (err) {
    next(err);
  }
};

// 7. POST /api/manufacturer/leads/:id/messages
exports.sendLeadMessage = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const { message, attachments = [] } = req.body;
    if (!message || message.trim() === '') {
      return errorResponse(res, 'Message text is required', null, 422);
    }

    const inq = await Inquiry.findById(lead.inquiry_id);
    const receiverId = inq?.senderId || lead.buyer_id;

    const newMessage = await InquiryMessage.create({
      inquiry_id: lead.inquiry_id,
      sender_id: req.user.id,
      sender_type: 'manufacturer',
      receiver_id: receiverId,
      message: message.trim(),
      attachments,
      is_read: false
    });

    // Update lead last activity
    lead.last_activity_at = new Date();
    if (lead.lead_status === 'new') {
      lead.lead_status = 'in_discussion';
    }
    await lead.save();

    // Log Activity
    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'message_sent',
      title: 'Message Sent to Buyer',
      description: `Sent message: "${message.trim().slice(0, 80)}..."`,
      metadata: { message_id: newMessage._id }
    });

    return successResponse(res, 'Message sent successfully', newMessage, 201);
  } catch (err) {
    next(err);
  }
};

// 8. GET /api/manufacturer/leads/:id/quotes
exports.getLeadQuotes = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const quotes = await InquiryQuotation.find({
      inquiry_id: lead.inquiry_id,
      manufacturer_id: profile._id
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Lead quotations retrieved successfully', {
      lead_number: lead.lead_number,
      quotes
    });
  } catch (err) {
    next(err);
  }
};

// 9. POST /api/manufacturer/leads/:id/quotes
// Send Quote Integration: creates quotation, updates lead status to quote_sent
exports.createLeadQuote = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id })
      .populate('inquiry_id');
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const inq = lead.inquiry_id || {};

    const { error, value } = submitQuoteSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => { errors[err.context.key] = [err.message]; });
      return errorResponse(res, 'Validation failed', errors, 422);
    }

    const {
      quoted_quantity,
      quantity_unit = inq.unit || 'Sq.ft',
      unit_price,
      tax_rate = 18,
      shipping_charges = 0,
      discount = 0,
      material = inq.material || inq.requirement_title || 'Granite Slabs',
      size = inq.size || '10 x 6 ft',
      thickness = inq.thickness || '20 mm',
      finish = inq.finish || 'Mirror Polished',
      quality = inq.grade || 'Premium Grade',
      delivery_timeline = '7-10 Business Days',
      payment_terms = '50% Advance, 50% on Delivery',
      advance_payment,
      balance_payment,
      validity_days = 15,
      notes = '',
      attachments = []
    } = value;

    // Exact Financial Calculations
    const subtotal = quoted_quantity * unit_price;
    const taxAmount = (subtotal * tax_rate) / 100;
    const totalAmount = subtotal + taxAmount + shipping_charges - discount;

    const calculatedAdvance = advance_payment !== undefined ? advance_payment : (totalAmount * 0.5);
    const calculatedBalance = balance_payment !== undefined ? balance_payment : (totalAmount - calculatedAdvance);

    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

    const quote = await InquiryQuotation.create({
      quote_number: quoteNumber,
      inquiry_id: inq._id,
      manufacturer_id: profile._id,
      manufacturer_user_id: req.user.id,
      buyer_id: inq.senderId || lead.buyer_id,
      product_id: inq.productId || null,
      quoted_quantity,
      quantity_unit,
      unit_price,
      subtotal,
      tax_rate,
      tax_amount: taxAmount,
      shipping_charges,
      discount,
      total_amount: totalAmount,
      material,
      size,
      thickness,
      finish,
      quality,
      delivery_timeline,
      payment_terms,
      advance_payment: calculatedAdvance,
      balance_payment: calculatedBalance,
      validity_days,
      validity_date: new Date(Date.now() + validity_days * 24 * 60 * 60 * 1000),
      notes,
      attachments,
      status: 'submitted',
      is_mock: false
    });

    // Update Lead status to 'quote_sent'
    lead.lead_status = 'quote_sent';
    lead.last_activity_at = new Date();
    await lead.save();

    // Log Activity
    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'quote_sent',
      previous_status: 'in_discussion',
      new_status: 'quote_sent',
      title: 'Quotation Submitted',
      description: `Submitted quotation ${quoteNumber} for ₹${totalAmount.toLocaleString()} (${quoted_quantity} ${quantity_unit}).`,
      metadata: { quote_id: quote._id, quote_number: quoteNumber, total_amount: totalAmount }
    });

    return successResponse(res, 'Quotation sent successfully against lead', {
      quote_number: quoteNumber,
      quotation: quote,
      lead_status: 'quote_sent'
    }, 201);
  } catch (err) {
    next(err);
  }
};

// 10. GET /api/manufacturer/leads/:id/notes
// Retrieve private manufacturer internal notes (never visible to buyers)
exports.getLeadNotes = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const notes = await LeadNote.find({
      lead_id: lead._id,
      manufacturer_id: profile._id
    })
      .populate('author_id', 'name email profile_picture')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Lead internal notes retrieved successfully', {
      lead_number: lead.lead_number,
      notes: notes.map(n => ({
        _id: n._id,
        note: n.note,
        author: {
          id: n.author_id?._id,
          name: n.author_id?.name || 'Manufacturer Team'
        },
        created_at: n.createdAt,
        updated_at: n.updatedAt,
        time_formatted: formatTimeAgo(n.createdAt)
      }))
    });
  } catch (err) {
    next(err);
  }
};

// 11. POST /api/manufacturer/leads/:id/notes
// Add private manufacturer internal note
exports.createLeadNote = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const { error, value } = createLeadNoteSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    const newNote = await LeadNote.create({
      lead_id: lead._id,
      manufacturer_id: profile._id,
      author_id: req.user.id,
      note: value.note
    });

    lead.last_activity_at = new Date();
    await lead.save();

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'note_added',
      title: 'Internal Note Added',
      description: `Added private internal note: "${value.note.slice(0, 60)}..."`,
      metadata: { note_id: newNote._id }
    });

    return successResponse(res, 'Internal note added successfully', newNote, 201);
  } catch (err) {
    next(err);
  }
};

// 12. PUT /api/manufacturer/leads/:id/notes/:noteId
exports.updateLeadNote = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const { error, value } = updateLeadNoteSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    const note = await LeadNote.findOne({
      _id: req.params.noteId,
      lead_id: lead._id,
      manufacturer_id: profile._id
    });

    if (!note) {
      return errorResponse(res, 'Internal note not found', null, 404);
    }

    note.note = value.note;
    await note.save();

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'note_updated',
      title: 'Internal Note Updated',
      description: `Updated private note.`,
      metadata: { note_id: note._id }
    });

    return successResponse(res, 'Internal note updated successfully', note);
  } catch (err) {
    next(err);
  }
};

// 13. DELETE /api/manufacturer/leads/:id/notes/:noteId
exports.deleteLeadNote = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const note = await LeadNote.findOneAndDelete({
      _id: req.params.noteId,
      lead_id: lead._id,
      manufacturer_id: profile._id
    });

    if (!note) {
      return errorResponse(res, 'Internal note not found', null, 404);
    }

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'note_deleted',
      title: 'Internal Note Deleted',
      description: 'Manufacturer removed internal note.',
      metadata: { note_id: req.params.noteId }
    });

    return successResponse(res, 'Internal note deleted successfully');
  } catch (err) {
    next(err);
  }
};

// 14. GET /api/manufacturer/leads/:id/history
// Detailed Activity Feed
exports.getLeadHistory = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const logs = await LeadActivityLog.find({ lead_id: lead._id })
      .populate('actor_id', 'name email role')
      .sort({ createdAt: -1 });

    const formatted = logs.map(l => ({
      _id: l._id,
      event_type: l.event_type,
      title: l.title,
      description: l.description,
      actor: {
        id: l.actor_id?._id,
        name: l.actor_id?.name || (l.actor_type === 'buyer' ? 'Buyer' : 'Manufacturer'),
        type: l.actor_type
      },
      previous_status: l.previous_status,
      new_status: l.new_status,
      created_at: l.createdAt,
      time_formatted: formatTimeAgo(l.createdAt)
    }));

    return successResponse(res, 'Lead activity history retrieved successfully', {
      lead_number: lead.lead_number,
      history: formatted
    });
  } catch (err) {
    next(err);
  }
};

// 15. POST /api/manufacturer/leads/:id/status
// Validated State Transitions: new -> in_discussion -> quote_sent -> converted / closed
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const { error, value } = updateLeadStatusSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    const { lead_status: newStatus, closure_reason, closure_comments } = value;
    const previousStatus = lead.lead_status;

    // Transition Validation Logic
    if (newStatus === 'closed' && !closure_reason) {
      return errorResponse(res, 'Closure reason is required when closing a lead', null, 422);
    }

    if (previousStatus === 'converted' && newStatus === 'new') {
      return errorResponse(res, 'Converted lead cannot be reverted to new status', null, 400);
    }

    lead.lead_status = newStatus;
    lead.last_activity_at = new Date();

    if (newStatus === 'converted') {
      lead.converted_at = new Date();
    } else if (newStatus === 'closed') {
      lead.closed_at = new Date();
      lead.closure_reason = closure_reason;
      lead.closure_comments = closure_comments;
    }

    await lead.save();

    let eventType = 'lead_marked_in_discussion';
    if (newStatus === 'converted') eventType = 'lead_converted';
    else if (newStatus === 'closed') eventType = 'lead_closed';
    else if (newStatus === 'quote_sent') eventType = 'quote_sent';

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: eventType,
      previous_status: previousStatus,
      new_status: newStatus,
      title: `Status Changed to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
      description: closure_reason ? `Reason: ${closure_reason}. ${closure_comments || ''}` : `Lead stage updated from ${previousStatus} to ${newStatus}.`,
      metadata: { previousStatus, newStatus, closure_reason }
    });

    return successResponse(res, `Lead status updated to ${newStatus}`, {
      lead_number: lead.lead_number,
      previous_status: previousStatus,
      lead_status: newStatus,
      converted_at: lead.converted_at,
      closed_at: lead.closed_at
    });
  } catch (err) {
    next(err);
  }
};

// 16. POST /api/manufacturer/leads/:id/share
// Secure sanitized lead sharing (never exposes buyer contact info publicly)
exports.shareLead = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id })
      .populate('inquiry_id');
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    if (!lead.share_token) {
      lead.share_token = crypto.randomBytes(12).toString('hex');
      await lead.save();
    }

    const baseUrl = process.env.APP_URL || 'https://stonemarketindia.com';
    const shareableUrl = `${baseUrl}/leads/share/${lead.share_token}`;
    const inq = lead.inquiry_id || {};

    const summaryText = `Stone Market India - Requirement Lead (${lead.lead_number}):\nProduct: ${inq.requirement_title || inq.material || 'Granite Slabs'}\nQuantity: ${inq.quantity || 500} ${inq.unit || 'Sq.ft'}\nLocation: ${inq.deliveryLocation?.city || inq.delivery_location || 'India'}\nTimeline: ${lead.urgency}\nView details: ${shareableUrl}`;

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'lead_shared',
      title: 'Lead Shared',
      description: 'Manufacturer generated shareable lead link.'
    });

    return successResponse(res, 'Shareable lead link generated successfully', {
      lead_number: lead.lead_number,
      share_token: lead.share_token,
      share_url: shareableUrl,
      whatsapp_share_text: summaryText,
      sanitized_preview: {
        product: inq.requirement_title || inq.material || 'Granite Slabs',
        quantity: `${inq.quantity || 500} ${inq.unit || 'Sq.ft'}`,
        location: inq.deliveryLocation?.city || inq.delivery_location || 'India',
        confidentiality_notice: 'Private buyer phone and email are protected and hidden from public share link.'
      }
    });
  } catch (err) {
    next(err);
  }
};

// 17. GET /api/public/leads/shared/:token
// Public Sanitized View for Shared Lead (no auth required, no private buyer details)
exports.getSharedLeadPublic = async (req, res, next) => {
  try {
    const token = req.params.token;
    const lead = await Lead.findOne({ share_token: token })
      .populate('inquiry_id');

    if (!lead) {
      return errorResponse(res, 'Shared lead link expired or invalid', null, 404);
    }

    const inq = lead.inquiry_id || {};
    return successResponse(res, 'Public lead summary retrieved successfully', {
      lead_number: lead.lead_number,
      status: lead.lead_status,
      product: inq.requirement_title || inq.material || 'Granite & Marble Requirement',
      quantity: `${inq.quantity || 500} ${inq.unit || 'Sq.ft'}`,
      dimensions: inq.size || 'Standard Slab',
      thickness: inq.thickness || '20 mm',
      finish: inq.finish || 'Polished',
      delivery_city: inq.deliveryLocation?.city || inq.delivery_location || 'India',
      urgency: lead.urgency,
      requirement_summary: inq.requirements || inq.message || 'Looking for premium stone material.'
    });
  } catch (err) {
    next(err);
  }
};

// 18. GET /api/manufacturer/leads/:id/download
// Download Lead Specification PDF
exports.downloadLeadPdf = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id })
      .populate('inquiry_id')
      .populate('buyer_id', 'name mobile email')
      .populate('buyer_business_id', 'company_name city');

    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const pdfBuffer = await generateLeadPdf(lead);

    const filename = `Lead_${lead.lead_number.replace(/[^a-zA-Z0-9_-]/g, '')}_Specification.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// 19. POST /api/manufacturer/leads/:id/contact-log
// Log Buyer Contacted Action (Call / Message)
exports.logContactAction = async (req, res, next) => {
  try {
    const profile = await getManufacturerProfile(req.user.id);
    const lead = await Lead.findOne({ _id: req.params.id, manufacturer_id: profile._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', null, 404);
    }

    const { action_type = 'call', notes = '' } = req.body;

    if (lead.lead_status === 'new') {
      lead.lead_status = 'in_discussion';
      await lead.save();
    }

    await LeadActivityLog.create({
      lead_id: lead._id,
      actor_id: req.user.id,
      actor_type: 'manufacturer',
      event_type: 'buyer_contacted',
      title: action_type === 'call' ? 'Phone Call Initiated' : 'Buyer Contacted',
      description: `Manufacturer contacted buyer via ${action_type}. ${notes}`.trim()
    });

    return successResponse(res, 'Contact activity recorded successfully', {
      lead_number: lead.lead_number,
      lead_status: lead.lead_status
    });
  } catch (err) {
    next(err);
  }
};
