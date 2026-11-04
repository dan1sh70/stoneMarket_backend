const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const BusinessProfile = require('../models/BusinessProfile');
const NotificationPreference = require('../models/NotificationPreference');
const QuietHours = require('../models/QuietHours');
const UserPreferences = require('../models/UserPreferences');
const SupportFaq = require('../models/SupportFaq');
const SupportTicket = require('../models/SupportTicket');
const {
  notificationPreferencesSchema,
  quietHoursSchema,
  userPreferencesSchema,
  changePasswordSchema
} = require('../validations/accountSettings.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper: Get or initialize BusinessProfile (supports manufacturer, mining, showroom & trader)
async function getManufacturerProfile(userId) {
  const user = await User.findById(userId);
  let targetType = 'manufacturer';
  if (user) {
    if (user.role === 'buyer') targetType = 'buyer';
    else if (user.role === 'trader') targetType = 'trader';
    else if (user.role === 'showroom') targetType = 'showroom';
    else if (user.role === 'mining') targetType = 'mining';
  }

  let profile = await BusinessProfile.findOne({
    userId,
    business_type: targetType
  });

  if (!profile) {
    // Fallback: check any business profile for this user
    profile = await BusinessProfile.findOne({ userId });
  }

  if (!profile && user) {
    if (user.role === 'buyer') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'buyer',
        company_name: user.name ? `${user.name} Stone Sourcing` : 'Apex Infra Buildcon Stone Sourcing',
        business_category: 'Stone Buyer',
        business_subcategory: 'Infrastructure & Commercial Procurement',
        short_description: 'Premier infrastructure and commercial stone procurement organization sourcing high-grade marble, granite, and natural stones across India.',
        about_business: 'Leading stone buyer executing nationwide infrastructure, institutional, and commercial real estate stone procurement with stringent quality standards.',
        established_year: 2017,
        company_type: 'Private Limited',
        buyer_business_types: ['Infrastructure Company', 'Commercial Developer', 'Contractor'],
        purchasing_specializations: ['Granite Slabs', 'Marble Blocks', 'Paving Stones', 'Cut-to-Size Tiles'],
        ongoing_projects_count: 8,
        annual_purchasing_volume: 250000,
        purchasing_volume_unit: 'Sq.ft',
        procurement_capacity: '25,000+ Sq.ft / Month',
        sourcing_scope: 'Domestic',
        address: {
          state: 'Gujarat',
          district: 'Ahmedabad',
          area: 'SG Highway',
          commercial_area: 'Infra Towers',
          full_address: 'Level 6, Infra Towers, SG Highway, Ahmedabad, Gujarat 380054',
          postal_code: '380054',
          country: 'India'
        },
        rating: 4.9,
        review_count: 19,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'trader') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'trader',
        company_name: user.name ? `${user.name} Marble & Granite Traders` : 'Shree Shyam Marble & Granite Traders',
        business_category: 'Stone Trader',
        business_subcategory: 'Wholesale Stone Trader & Exporter',
        short_description: 'Leading commercial stone trading house sourcing and supplying natural stones across India and global markets.',
        about_business: 'Specializing in commercial intermediary sourcing, bulk supply, block dispatch, slab trading, and project procurement.',
        established_year: 2016,
        trading_business_types: ['Wholesale Stone Trader', 'Exporter', 'Bulk Material Supplier'],
        trading_specializations: ['Granite', 'Marble', 'Sandstone', 'Limestone', 'Tiles', 'Other Natural Stones'],
        trading_capabilities: ['Domestic Trading', 'International Trading', 'Wholesale Supply', 'Bulk Orders'],
        monthly_trading_volume: 8000,
        trading_volume_unit: 'Tons',
        min_order_quantity: 500,
        max_order_capacity: 15000,
        preferred_order_type: 'Full Truck Load & Container',
        supply_network_coverage: 'Pan-India & Export Markets',
        operating_markets: ['Domestic', 'International'],
        gst_number: '08AAACS1234E1Z9',
        iec_number: 'IEC-RJ-2016-8910',
        business_registration_number: 'REG-RJ-2016-5541',
        rating: 4.8,
        review_count: 24,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'showroom') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'showroom',
        company_name: user.name ? `${user.name} Stone Gallery & Godown` : 'Royal Stone Gallery & Godown',
        established_year: 2018,
        monthly_capacity: 50000,
        capacity_unit: 'Sq.Ft',
        total_display_area: 12000,
        display_area_unit: 'Sq.ft',
        total_storage_capacity: 50000,
        storage_capacity_unit: 'Sq.ft',
        showroom_type: 'Retail & Wholesale',
        property_type: 'Owned',
        premises_status: 'owned',
        unit_status: 'domestic',
        rating: 4.8,
        review_count: 18,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'mining') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'mining',
        company_name: user.name ? `${user.name} Mines & Quarries` : 'Aravalli Granites & Stone Mines',
        established_year: 2018,
        monthly_capacity: 6500,
        capacity_unit: 'Ton',
        ec_number: 'EC-RAJ-2018-9942',
        ec_clearance_status: 'Clearance Granted',
        mining_lease_number: 'ML-78/2018',
        mining_permit_number: 'MP-2022-4410',
        quarry_specialties: ['Rajasthan Black', 'Black Galaxy', 'Makrana White'],
        property_type: 'Owned',
        premises_status: 'owned',
        unit_status: 'both',
        rating: 4.8,
        review_count: 14,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'manufacturer' || user.role === 'admin' || user.role === 'vendor') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'manufacturer',
        company_name: user.name ? `${user.name} Granite Industries` : 'RK Granite Industries',
        established_year: 2018,
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

// Helper: Format 24-hr time string to 12-hr AM/PM
function format12Hour(timeStr) {
  if (!timeStr) return '10:00 PM';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const min = minStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // '0' becomes '12'
  return `${hour}:${min} ${ampm}`;
}

// Helper: Check if current time is inside quiet hours range (supports overnight range)
function checkQuietHoursActive(startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sHour, sMin] = startTimeStr.split(':').map(Number);
  const [eHour, eMin] = endTimeStr.split(':').map(Number);
  const startMinutes = sHour * 60 + sMin;
  const endMinutes = eHour * 60 + eMin;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight range (e.g. 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

// 1. GET /api/manufacturer/settings
// Main Settings Screen Overview
exports.getSettingsOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    const profile = await getManufacturerProfile(userId);

    // Notification Preferences
    let notifPref = await NotificationPreference.findOne({ user_id: userId });
    if (!notifPref) {
      notifPref = await NotificationPreference.create({
        user_id: userId,
        new_inquiry: true,
        lead_messages: true,
        quote_requests: true,
        ad_performance: true,
        subscription_billing: true,
        marketing_emails: false,
        channels: { in_app: true, push: true, email: true, sms: false }
      });
    }

    // Quiet Hours
    let quietHours = await QuietHours.findOne({ user_id: userId });
    if (!quietHours) {
      quietHours = await QuietHours.create({
        user_id: userId,
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'Asia/Kolkata'
      });
    }

    // User Preferences (Language & Appearance)
    let userPref = await UserPreferences.findOne({ user_id: userId });
    if (!userPref) {
      userPref = await UserPreferences.create({
        user_id: userId,
        language: user.preferences?.language || 'en',
        appearance: user.preferences?.appearance || 'system',
        timezone: 'Asia/Kolkata'
      });
    }

    // Active Sessions Count
    const activeSessionsCount = await UserSession.countDocuments({
      userId,
      is_active: true
    });

    const companyName = profile?.company_name || 'RK Granite Industries';
    const businessEmail = profile?.email || user.email || 'info@rkgranite.com';
    const authorizedPhone = profile?.phone || user.mobile || '+91 98765 43210';
    const businessLogo = profile?.logo || user.profile_picture || null;

    return successResponse(res, 'Settings overview retrieved successfully', {
      screen_title: 'Settings',
      business_profile_card: {
        profile_id: profile?._id || null,
        company_name: companyName,
        business_logo: businessLogo,
        verification_status: 'Verified Supplier',
        is_verified: true,
        business_email: businessEmail,
        authorized_phone_number: authorizedPhone,
        view_profile_action: {
          label: 'View Profile',
          endpoint: '/api/manufacturer/profile'
        }
      },
      account_and_security: {
        profile_information: {
          title: 'Profile Information',
          subtitle: 'Manage your personal and business information.',
          endpoint: '/api/manufacturer/profile'
        },
        change_password: {
          title: 'Change Password',
          subtitle: 'Update your security credentials.',
          endpoint: '/api/manufacturer/settings/change-password'
        },
        security: {
          title: 'Security',
          subtitle: 'Active sessions and device authorization.',
          active_sessions_count: activeSessionsCount || 1,
          endpoint: '/api/manufacturer/settings/sessions'
        }
      },
      notification_preferences: {
        title: 'Notification Preferences',
        new_inquiry: notifPref.new_inquiry,
        lead_messages: notifPref.lead_messages,
        quote_requests: notifPref.quote_requests,
        ad_performance: notifPref.ad_performance,
        subscription_billing: notifPref.subscription_billing,
        marketing_emails: notifPref.marketing_emails,
        endpoint: '/api/manufacturer/settings/notifications'
      },
      quiet_hours: {
        title: 'Quiet Hours',
        enabled: quietHours.enabled,
        schedule: `${format12Hour(quietHours.start_time)} – ${format12Hour(quietHours.end_time)}`,
        start_time: quietHours.start_time,
        end_time: quietHours.end_time,
        timezone: quietHours.timezone,
        is_active_now: quietHours.enabled ? checkQuietHoursActive(quietHours.start_time, quietHours.end_time) : false,
        endpoint: '/api/manufacturer/settings/quiet-hours'
      },
      more_settings: {
        language: {
          selected: userPref.language,
          label: userPref.language === 'hi' ? 'Hindi' : userPref.language === 'ur' ? 'Urdu' : 'English',
          endpoint: '/api/manufacturer/settings/preferences'
        },
        appearance: {
          selected: userPref.appearance,
          label: userPref.appearance === 'dark' ? 'Dark Mode' : userPref.appearance === 'light' ? 'Light Mode' : 'System Default',
          endpoint: '/api/manufacturer/settings/preferences'
        },
        help_and_support: {
          endpoint: '/api/manufacturer/settings/help-support'
        },
        about: {
          app_name: 'Stone Market India',
          app_version: '1.4.0',
          build_number: '2026.11.03',
          company_name: 'Stone Market India Pvt. Ltd.',
          copyright: '© 2026 Stone Market India. All rights reserved.',
          endpoint: '/api/manufacturer/settings/about'
        }
      },
      logout_card: {
        label: 'Logout',
        endpoint: '/api/manufacturer/settings/logout',
        logout_all_endpoint: '/api/manufacturer/settings/logout-all'
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /api/manufacturer/settings/notifications
exports.getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let prefs = await NotificationPreference.findOne({ user_id: userId });

    if (!prefs) {
      prefs = await NotificationPreference.create({
        user_id: userId,
        new_inquiry: true,
        lead_messages: true,
        quote_requests: true,
        ad_performance: true,
        subscription_billing: true,
        marketing_emails: false,
        channels: { in_app: true, push: true, email: true, sms: false }
      });
    }

    return successResponse(res, 'Notification preferences retrieved successfully', {
      preferences: [
        {
          key: 'new_inquiry',
          title: 'New Inquiry',
          description: 'Get notified when you receive a new inquiry.',
          enabled: prefs.new_inquiry
        },
        {
          key: 'lead_messages',
          title: 'Lead Messages',
          description: 'Get notified for new messages from buyers.',
          enabled: prefs.lead_messages
        },
        {
          key: 'quote_requests',
          title: 'Quote Requests',
          description: 'Get notified when buyers request a quote.',
          enabled: prefs.quote_requests
        },
        {
          key: 'ad_performance',
          title: 'Ad Performance',
          description: 'Get updates about your advertisement performance.',
          enabled: prefs.ad_performance
        },
        {
          key: 'subscription_billing',
          title: 'Subscription & Billing',
          description: 'Get notified about billing, payments and plan updates.',
          enabled: prefs.subscription_billing
        },
        {
          key: 'marketing_emails',
          title: 'Marketing Emails',
          description: 'Receive tips, offers and product updates.',
          enabled: prefs.marketing_emails
        }
      ],
      channels: prefs.channels || { in_app: true, push: true, email: true, sms: false },
      policy_notice: 'Disabling marketing emails will not affect critical transactional communications or security alerts.'
    });
  } catch (err) {
    next(err);
  }
};

// 3. PUT /api/manufacturer/settings/notifications
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { error, value } = notificationPreferencesSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    let prefs = await NotificationPreference.findOne({ user_id: userId });
    if (!prefs) {
      prefs = new NotificationPreference({ user_id: userId });
    }

    if (value.new_inquiry !== undefined) prefs.new_inquiry = value.new_inquiry;
    if (value.lead_messages !== undefined) prefs.lead_messages = value.lead_messages;
    if (value.quote_requests !== undefined) prefs.quote_requests = value.quote_requests;
    if (value.ad_performance !== undefined) prefs.ad_performance = value.ad_performance;
    if (value.subscription_billing !== undefined) prefs.subscription_billing = value.subscription_billing;
    if (value.marketing_emails !== undefined) prefs.marketing_emails = value.marketing_emails;
    if (value.channels) {
      prefs.channels = { ...prefs.channels, ...value.channels };
    }

    await prefs.save();

    // Sync with User document
    await User.findByIdAndUpdate(userId, {
      'notification_preferences.new_inquiry': prefs.new_inquiry,
      'notification_preferences.lead_messages': prefs.lead_messages,
      'notification_preferences.quote_requests': prefs.quote_requests,
      'notification_preferences.ad_performance': prefs.ad_performance,
      'notification_preferences.subscription_billing': prefs.subscription_billing,
      'notification_preferences.marketing_emails': prefs.marketing_emails
    });

    return successResponse(res, 'Notification preferences updated successfully', prefs);
  } catch (err) {
    next(err);
  }
};

// 4. GET /api/manufacturer/settings/quiet-hours
exports.getQuietHours = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let quiet = await QuietHours.findOne({ user_id: userId });
    if (!quiet) {
      quiet = await QuietHours.create({
        user_id: userId,
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'Asia/Kolkata'
      });
    }

    return successResponse(res, 'Quiet hours schedule retrieved successfully', {
      enabled: quiet.enabled,
      start_time: quiet.start_time,
      end_time: quiet.end_time,
      timezone: quiet.timezone,
      display_schedule: `${format12Hour(quiet.start_time)} – ${format12Hour(quiet.end_time)}`,
      is_currently_active: quiet.enabled ? checkQuietHoursActive(quiet.start_time, quiet.end_time) : false,
      behavior_description: 'During Quiet Hours, non-critical push notifications are silenced while transactions and security alerts remain active.'
    });
  } catch (err) {
    next(err);
  }
};

// 5. PUT /api/manufacturer/settings/quiet-hours
exports.updateQuietHours = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { error, value } = quietHoursSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    let quiet = await QuietHours.findOne({ user_id: userId });
    if (!quiet) {
      quiet = new QuietHours({ user_id: userId });
    }

    if (value.enabled !== undefined) quiet.enabled = value.enabled;
    if (value.start_time) quiet.start_time = value.start_time;
    if (value.end_time) quiet.end_time = value.end_time;
    if (value.timezone) quiet.timezone = value.timezone;

    await quiet.save();

    // Sync with User document
    await User.findByIdAndUpdate(userId, {
      'quiet_hours.enabled': quiet.enabled,
      'quiet_hours.start_time': quiet.start_time,
      'quiet_hours.end_time': quiet.end_time,
      'quiet_hours.timezone': quiet.timezone
    });

    return successResponse(res, 'Quiet hours updated successfully', {
      enabled: quiet.enabled,
      start_time: quiet.start_time,
      end_time: quiet.end_time,
      timezone: quiet.timezone,
      display_schedule: `${format12Hour(quiet.start_time)} – ${format12Hour(quiet.end_time)}`,
      is_currently_active: quiet.enabled ? checkQuietHoursActive(quiet.start_time, quiet.end_time) : false
    });
  } catch (err) {
    next(err);
  }
};

// 6. GET /api/manufacturer/settings/preferences
exports.getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let pref = await UserPreferences.findOne({ user_id: userId });
    if (!pref) {
      pref = await UserPreferences.create({
        user_id: userId,
        language: 'en',
        appearance: 'system',
        timezone: 'Asia/Kolkata'
      });
    }

    return successResponse(res, 'User preferences retrieved successfully', {
      language: pref.language,
      appearance: pref.appearance,
      timezone: pref.timezone,
      available_languages: [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
        { code: 'ur', label: 'Urdu', native: 'اردو' }
      ],
      available_themes: [
        { key: 'light', label: 'Light Mode', description: 'Clean bright visual appearance' },
        { key: 'dark', label: 'Dark Mode', description: 'Sleek dark theme reducing eye strain' },
        { key: 'system', label: 'System Default', description: 'Match system device settings' }
      ]
    });
  } catch (err) {
    next(err);
  }
};

// 7. PUT /api/manufacturer/settings/preferences
exports.updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { error, value } = userPreferencesSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    let pref = await UserPreferences.findOne({ user_id: userId });
    if (!pref) {
      pref = new UserPreferences({ user_id: userId });
    }

    if (value.language) pref.language = value.language;
    if (value.appearance) pref.appearance = value.appearance;
    if (value.timezone) pref.timezone = value.timezone;

    await pref.save();

    // Sync with User
    await User.findByIdAndUpdate(userId, {
      'preferences.language': pref.language,
      'preferences.appearance': pref.appearance
    });

    return successResponse(res, 'Preferences updated successfully', pref);
  } catch (err) {
    next(err);
  }
};

// 8. POST /api/manufacturer/settings/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, null, 422);
    }

    const { current_password, new_password } = value;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Verify current password
    if (user.password) {
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Current password entered is incorrect', null, 400);
      }
    }

    // Hash new password securely
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    // Invalidate all other active sessions for security
    await UserSession.updateMany(
      { userId, is_active: true },
      { is_active: false }
    );

    return successResponse(res, 'Password changed successfully. Other active sessions have been invalidated for security.');
  } catch (err) {
    next(err);
  }
};

// 9. GET /api/manufacturer/settings/sessions
exports.getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let sessions = await UserSession.find({ userId, is_active: true })
      .sort({ last_active: -1 })
      .lean();

    if (sessions.length === 0) {
      const newSession = await UserSession.create({
        userId,
        session_id: crypto.randomBytes(16).toString('hex'),
        device_name: req.headers['user-agent']?.includes('Mobile') ? 'Android Mobile App' : 'Manufacturer Web Portal',
        device_type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        ip_address: req.ip || '127.0.0.1',
        location: 'Jaipur, Rajasthan, India',
        last_active: new Date(),
        is_active: true
      });
      sessions = [newSession.toObject()];
    }

    const formatted = sessions.map((s, index) => ({
      _id: s._id,
      session_id: s.session_id,
      device_name: s.device_name,
      device_type: s.device_type,
      ip_address: s.ip_address,
      location: s.location || 'India',
      last_active: s.last_active,
      is_current: index === 0
    }));

    return successResponse(res, 'Active sessions retrieved successfully', {
      total_active_sessions: formatted.length,
      sessions: formatted
    });
  } catch (err) {
    next(err);
  }
};

// 10. DELETE /api/manufacturer/settings/sessions/:id
exports.terminateSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    let session = null;
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      session = await UserSession.findOne({ _id: targetId, userId });
    }
    if (!session) {
      session = await UserSession.findOne({ session_id: targetId, userId });
    }

    if (!session) {
      return errorResponse(res, 'Session not found', null, 404);
    }

    session.is_active = false;
    await session.save();

    return successResponse(res, 'Session terminated successfully', {
      session_id: session.session_id,
      is_active: false
    });
  } catch (err) {
    next(err);
  }
};

// 11. POST /api/manufacturer/settings/logout-all
exports.logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await UserSession.updateMany({ userId }, { is_active: false });

    return successResponse(res, 'Logged out from all devices successfully.');
  } catch (err) {
    next(err);
  }
};

// 12. POST /api/manufacturer/settings/logout
exports.logoutCurrentSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Deactivate most recently active session
    const currentSession = await UserSession.findOne({ userId, is_active: true }).sort({ last_active: -1 });
    if (currentSession) {
      currentSession.is_active = false;
      await currentSession.save();
    }

    return successResponse(res, 'Logged out successfully. Current session ended.');
  } catch (err) {
    next(err);
  }
};

// 13. GET /api/manufacturer/settings/about
exports.getAboutApp = async (req, res, next) => {
  try {
    return successResponse(res, 'Application information retrieved successfully', {
      app_name: 'Stone Market India',
      app_version: '1.4.0',
      build_number: '2026.11.03',
      release_date: '2026-11-03',
      company_name: 'Stone Market India Pvt. Ltd.',
      registered_office: 'Mansarovar Industrial Area, Jaipur, Rajasthan 302020',
      support_email: 'support@stonemarketindia.com',
      terms_of_service_url: 'https://stonemarketindia.com/terms',
      privacy_policy_url: 'https://stonemarketindia.com/privacy',
      licenses_url: 'https://stonemarketindia.com/licenses',
      copyright: '© 2026 Stone Market India Pvt. Ltd. All rights reserved.'
    });
  } catch (err) {
    next(err);
  }
};

// 14. GET /api/manufacturer/settings/help-support
exports.getHelpAndSupport = async (req, res, next) => {
  try {
    const faqs = await SupportFaq.find({ is_active: true }).limit(10).lean();
    const userTicketsCount = await SupportTicket.countDocuments({ user_id: req.user.id });

    return successResponse(res, 'Help and support information retrieved successfully', {
      faqs: faqs.length > 0 ? faqs : [
        {
          question: 'How do I submit quotations to incoming buyer leads?',
          answer: 'Navigate to Received Inquiries, open any lead card, click "Send Quote", adjust your unit price, taxes and delivery timeline, and submit.'
        },
        {
          question: 'Are internal lead notes visible to buyers?',
          answer: 'No. Internal notes are strictly private to your manufacturing team and are never exposed to buyers.'
        },
        {
          question: 'What happens during Quiet Hours?',
          answer: 'Non-critical push notifications are paused during your quiet hours schedule, while your inquiries and transactions are safely stored in your database.'
        }
      ],
      support_contact: {
        phone: '+91 1800 123 4567',
        email: 'support@stonemarketindia.com',
        hours: 'Mon – Sat, 9:00 AM – 7:00 PM IST'
      },
      submitted_tickets_count: userTicketsCount,
      ticket_submission_endpoint: '/api/v1/customer/support/tickets'
    });
  } catch (err) {
    next(err);
  }
};
