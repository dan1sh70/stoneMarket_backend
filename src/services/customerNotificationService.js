const CustomerNotification = require('../models/CustomerNotification');
const User = require('../models/User');
const { sendPushNotification } = require('./fcmService');

/**
 * Checks if current time is within user's configured quiet hours.
 * @param {Object} quietHours { enabled, start_time, end_time, timezone }
 * @returns {Boolean}
 */
function isWithinQuietHours(quietHours) {
  if (!quietHours || !quietHours.enabled) return false;

  try {
    const timezone = quietHours.timezone || 'Asia/Kolkata';
    const now = new Date();
    
    // Format current time in user's timezone into "HH:mm"
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const currentTimeStr = formatter.format(now); // e.g. "23:15"

    const [curH, curM] = currentTimeStr.split(':').map(Number);
    const curMinutes = curH * 60 + curM;

    const [startH, startM] = (quietHours.start_time || '22:00').split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    const [endH, endM] = (quietHours.end_time || '08:00').split(':').map(Number);
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      // Non-overnight range (e.g., 01:00 to 06:00)
      return curMinutes >= startMinutes && curMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return curMinutes >= startMinutes || curMinutes <= endMinutes;
    }
  } catch (err) {
    console.error('Error evaluating quiet hours:', err.message);
    return false;
  }
}

/**
 * Checks if customer has opted in for this notification category.
 */
function isCategoryEnabled(user, category) {
  if (!user.notification_preferences) return true;

  const keyMap = {
    'New Inquiry': 'new_inquiry',
    'Lead Messages': 'lead_messages',
    'Quote Requests': 'quote_requests',
    'Ad Performance': 'ad_performance',
    'Subscription & Billing': 'subscription_billing',
    'Marketing Emails': 'marketing_emails'
  };

  const prefKey = keyMap[category];
  if (!prefKey) return true;

  return user.notification_preferences[prefKey] !== false;
}

/**
 * Creates customer in-app notification and dispatches push notification if allowed.
 */
async function notifyCustomer(userId, {
  title,
  description,
  category = 'New Inquiry',
  related_entity_id = null,
  related_entity_type = 'inquiry',
  deep_link = null,
  isCritical = false
}) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Check category preferences
    if (!isCritical && !isCategoryEnabled(user, category)) {
      return null; // Customer opted out of this category
    }

    // Always create database in-app notification record
    const notification = await CustomerNotification.create({
      userId,
      title,
      description,
      category,
      related_entity_id,
      related_entity_type,
      deep_link
    });

    // Determine if push notification should be sent
    const quiet = isWithinQuietHours(user.quiet_hours);
    if (user.fcmToken && (isCritical || !quiet)) {
      await sendPushNotification(user.fcmToken, title, description, {
        category,
        related_id: related_entity_id ? related_entity_id.toString() : '',
        deep_link: deep_link || ''
      });
    }

    return notification;
  } catch (err) {
    console.error('Error sending customer notification:', err.message);
    return null;
  }
}

module.exports = {
  notifyCustomer,
  isWithinQuietHours,
  isCategoryEnabled
};
