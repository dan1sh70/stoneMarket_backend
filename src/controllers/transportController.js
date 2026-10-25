const BusinessProfile = require('../models/BusinessProfile');
const TransportVehicle = require('../models/TransportVehicle');
const TransportRoute = require('../models/TransportRoute');
const FreightRate = require('../models/FreightRate');
const VehicleType = require('../models/VehicleType');
const Location = require('../models/Location');
const BusinessFavorite = require('../models/BusinessFavorite');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const QuoteResponse = require('../models/QuoteResponse');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to sanitize phone for WhatsApp link
const formatWhatsAppUrl = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  const withCountryCode = cleaned.startsWith('91') ? cleaned : (cleaned.length === 10 ? `91${cleaned}` : cleaned);
  return `https://wa.me/${withCountryCode}`;
};

// ==========================================
// 1. NATIONAL TRANSPORT — ALL TRANSPORT
// ==========================================
// GET /api/v1/transports/national
exports.getNationalTransports = async (req, res, next) => {
  try {
    const {
      search,
      vehicle_type,
      origin_city_id,
      destination_city_id,
      permit_type,
      verified,
      available,
      page = 1,
      per_page = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = {
      business_type: { $in: ['transport_national', 'transport_local'] },
      transport_category: { $in: ['national', 'both'] },
      status: 'active'
    };

    if (verified === 'true') {
      query.$or = [{ is_verified: true }, { verification_status: 'approved' }];
    } else if (verified === 'false') {
      query.is_verified = false;
      query.verification_status = { $ne: 'approved' };
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { company_name: { $regex: new RegExp(search, 'i') } },
          { company_details: { $regex: new RegExp(search, 'i') } },
          { fleet_summary: { $regex: new RegExp(search, 'i') } },
          { 'address.district': { $regex: new RegExp(search, 'i') } },
          { 'address.state': { $regex: new RegExp(search, 'i') } }
        ]
      });
    }

    if (permit_type === 'all_india') {
      query.has_all_india_permit = true;
    }

    // Vehicle type filter
    if (vehicle_type) {
      let vType = await VehicleType.findOne({
        $or: [
          { slug: vehicle_type.toLowerCase() },
          { name: { $regex: new RegExp(vehicle_type, 'i') } }
        ]
      });
      if (vType) {
        // Find providers that have this vehicle in fleet
        const providerIds = await TransportVehicle.distinct('providerId', {
          vehicleTypeId: vType._id,
          is_active: true
        });
        query._id = { $in: providerIds };
      }
    }

    // Route / Origin / Destination filter
    if (origin_city_id || destination_city_id) {
      let routeQuery = { is_active: true };
      if (origin_city_id) routeQuery.origin_city_id = origin_city_id;
      if (destination_city_id) routeQuery.destination_city_id = destination_city_id;
      
      const routeProviderIds = await TransportRoute.distinct('providerId', routeQuery);
      if (query._id) {
        query._id = { $in: query._id.$in.filter(id => routeProviderIds.some(rId => rId.equals(id))) };
      } else {
        query._id = { $in: routeProviderIds };
      }
    }

    const sortOptions = {};
    if (sort_by === 'rating') sortOptions.rating = sort_order === 'asc' ? 1 : -1;
    else if (sort_by === 'name') sortOptions.company_name = sort_order === 'asc' ? 1 : -1;
    else sortOptions.createdAt = sort_order === 'asc' ? 1 : -1;

    const total = await BusinessProfile.countDocuments(query);
    const providers = await BusinessProfile.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich with fleet count and contact actions
    const items = await Promise.all(providers.map(async (p) => {
      const vehicleCount = await TransportVehicle.countDocuments({ providerId: p._id, is_active: true });
      const availableCount = await TransportVehicle.countDocuments({ providerId: p._id, is_active: true, availability_status: 'available_now' });
      const routesCount = await TransportRoute.countDocuments({ providerId: p._id, is_active: true });
      
      const primaryContactPhone = p.owners?.[0]?.phone || null;
      const primaryContactWhatsapp = p.owners?.[0]?.whatsapp || primaryContactPhone;

      return {
        id: p._id,
        company_name: p.company_name,
        logo: p.owners?.[0]?.photo || null,
        cover_images: p.cover_images || [],
        is_verified: p.is_verified || p.verification_status === 'approved',
        verification_status: p.verification_status,
        transport_category: p.transport_category,
        fleet_description: p.fleet_summary || `${vehicleCount} commercial transport vehicles`,
        vehicle_count: vehicleCount,
        available_vehicle_count: availableCount,
        has_all_india_permit: p.has_all_india_permit,
        has_national_coverage: p.has_national_coverage,
        location: {
          city: p.address?.district,
          state: p.address?.state,
          area: p.address?.area
        },
        supported_routes_count: routesCount,
        rating: p.rating || 0,
        review_count: p.review_count || 0,
        contact_actions: {
          phone: primaryContactPhone,
          whatsapp: primaryContactWhatsapp,
          whatsapp_url: formatWhatsAppUrl(primaryContactWhatsapp)
        }
      };
    }));

    return res.status(200).json({
      success: true,
      message: 'National transport providers retrieved successfully.',
      data: items,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. NATIONAL TRANSPORT — AREA WISE & DESTINATIONS
// ==========================================
// GET /api/v1/transports/national/destinations?origin_city_id=...
exports.getNationalDestinations = async (req, res, next) => {
  try {
    const { origin_city_id } = req.query;
    if (!origin_city_id) {
      return errorResponse(res, 'origin_city_id is required', null, 400);
    }

    // Find routes where origin matches directly OR reverse direction if bidirectional
    const routes = await TransportRoute.find({
      is_active: true,
      $or: [
        { origin_city_id: origin_city_id },
        { destination_city_id: origin_city_id, directionality: 'bidirectional' }
      ]
    }).lean();

    const destinationsMap = new Map();
    for (const r of routes) {
      const isOrigin = r.origin_city_id.toString() === origin_city_id.toString();
      const destId = isOrigin ? r.destination_city_id.toString() : r.origin_city_id.toString();
      const destName = isOrigin ? r.destination_city_name : r.origin_city_name;
      const destState = isOrigin ? r.destination_state_name : r.origin_state_name;

      if (!destinationsMap.has(destId)) {
        destinationsMap.set(destId, {
          city_id: destId,
          city_name: destName,
          state_name: destState,
          provider_count: 1
        });
      } else {
        destinationsMap.get(destId).provider_count += 1;
      }
    }

    const destinations = Array.from(destinationsMap.values());
    return res.status(200).json({
      success: true,
      message: 'Supported destinations retrieved successfully.',
      data: destinations,
      meta: { total: destinations.length }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transports/national/area-wise
exports.getNationalAreaWise = async (req, res, next) => {
  try {
    const {
      state_id,
      origin_city_id,
      destination_city_id,
      vehicle_type,
      page = 1,
      per_page = 20
    } = req.query;

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let providerIds = new Set();
    let hasRouteQuery = false;

    if (origin_city_id && destination_city_id) {
      hasRouteQuery = true;
      const routes = await TransportRoute.find({
        is_active: true,
        $or: [
          { origin_city_id, destination_city_id },
          { origin_city_id: destination_city_id, destination_city_id: origin_city_id, directionality: 'bidirectional' }
        ]
      }).lean();

      routes.forEach(r => providerIds.add(r.providerId.toString()));
    } else if (origin_city_id) {
      hasRouteQuery = true;
      const routes = await TransportRoute.find({
        is_active: true,
        $or: [
          { origin_city_id },
          { destination_city_id: origin_city_id, directionality: 'bidirectional' }
        ]
      }).lean();

      routes.forEach(r => providerIds.add(r.providerId.toString()));
    }

    let query = {
      business_type: { $in: ['transport_national', 'transport_local'] },
      transport_category: { $in: ['national', 'both'] },
      status: 'active'
    };

    if (hasRouteQuery) {
      query._id = { $in: Array.from(providerIds) };
    } else if (state_id) {
      const state = await Location.findById(state_id).lean();
      if (state) {
        query['address.state'] = { $regex: new RegExp(`^${state.name}$`, 'i') };
      }
    }

    const total = await BusinessProfile.countDocuments(query);
    const providers = await BusinessProfile.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const items = providers.map(p => ({
      id: p._id,
      company_name: p.company_name,
      logo: p.owners?.[0]?.photo || null,
      is_verified: p.is_verified || p.verification_status === 'approved',
      location: {
        city: p.address?.district,
        state: p.address?.state
      },
      fleet_summary: p.fleet_summary,
      has_all_india_permit: p.has_all_india_permit,
      contact_actions: {
        phone: p.owners?.[0]?.phone || null,
        whatsapp: p.owners?.[0]?.whatsapp || p.owners?.[0]?.phone || null,
        whatsapp_url: formatWhatsAppUrl(p.owners?.[0]?.whatsapp || p.owners?.[0]?.phone)
      }
    }));

    return res.status(200).json({
      success: true,
      message: 'Area-wise transport providers retrieved successfully.',
      data: items,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transports/national/routes
exports.getNationalRoutes = async (req, res, next) => {
  try {
    const { origin_city_id, destination_city_id, provider_id, direct_only } = req.query;
    let query = { is_active: true };

    if (provider_id) query.providerId = provider_id;
    if (direct_only === 'true') query.direct_route_only = true;

    if (origin_city_id && destination_city_id) {
      query.$or = [
        { origin_city_id, destination_city_id },
        { origin_city_id: destination_city_id, destination_city_id: origin_city_id, directionality: 'bidirectional' }
      ];
    } else if (origin_city_id) {
      query.$or = [
        { origin_city_id },
        { destination_city_id: origin_city_id, directionality: 'bidirectional' }
      ];
    }

    const routes = await TransportRoute.find(query)
      .populate('providerId', 'company_name is_verified verification_status owners address')
      .lean();

    const formatted = routes.map(r => ({
      id: r._id,
      provider: {
        id: r.providerId?._id,
        name: r.providerId?.company_name,
        is_verified: r.providerId?.is_verified || r.providerId?.verification_status === 'approved',
        phone: r.providerId?.owners?.[0]?.phone,
        whatsapp: r.providerId?.owners?.[0]?.whatsapp || r.providerId?.owners?.[0]?.phone,
        whatsapp_url: formatWhatsAppUrl(r.providerId?.owners?.[0]?.whatsapp || r.providerId?.owners?.[0]?.phone)
      },
      origin: {
        city_id: r.origin_city_id,
        city: r.origin_city_name,
        state: r.origin_state_name
      },
      destination: {
        city_id: r.destination_city_id,
        city: r.destination_city_name,
        state: r.destination_state_name
      },
      route_type: r.route_type,
      directionality: r.directionality,
      direct_route_only: r.direct_route_only,
      estimated_transit_days: r.estimated_transit_days,
      freight_rate: r.default_freight_rate,
      rate_unit: r.rate_unit
    }));

    return res.status(200).json({
      success: true,
      message: 'Transport routes retrieved successfully.',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transports/national/routes/:route_id
exports.getNationalRouteById = async (req, res, next) => {
  try {
    const route = await TransportRoute.findById(req.params.route_id)
      .populate('providerId', 'company_name is_verified verification_status owners address working_hours')
      .lean();

    if (!route) {
      return errorResponse(res, 'Transport route not found', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Route details retrieved successfully.',
      data: {
        id: route._id,
        provider: {
          id: route.providerId?._id,
          name: route.providerId?.company_name,
          is_verified: route.providerId?.is_verified || route.providerId?.verification_status === 'approved',
          phone: route.providerId?.owners?.[0]?.phone,
          whatsapp: route.providerId?.owners?.[0]?.whatsapp || route.providerId?.owners?.[0]?.phone,
          whatsapp_url: formatWhatsAppUrl(route.providerId?.owners?.[0]?.whatsapp || route.providerId?.owners?.[0]?.phone)
        },
        origin: {
          city_id: route.origin_city_id,
          city: route.origin_city_name,
          state: route.origin_state_name
        },
        destination: {
          city_id: route.destination_city_id,
          city: route.destination_city_name,
          state: route.destination_state_name
        },
        directionality: route.directionality,
        direct_route_only: route.direct_route_only,
        estimated_transit_days: route.estimated_transit_days,
        freight_rate: route.default_freight_rate,
        rate_unit: route.rate_unit
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. LOCAL TRANSPORT — NEARBY DISCOVERY
// ==========================================
// Haversine formula distance calculation in KM
const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// GET /api/v1/transports/local/nearby
exports.getLocalNearby = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radius_km = 10,
      city_id,
      vehicle_type,
      availability,
      capacity_min,
      capacity_max,
      page = 1,
      per_page = 20
    } = req.query;

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;
    const radiusNum = parseFloat(radius_km);

    let vehicleQuery = {
      is_active: true,
      service_type: { $in: ['local', 'both'] }
    };

    if (availability) {
      vehicleQuery.availability_status = availability;
    }

    if (capacity_min) {
      vehicleQuery.payload_capacity = { ...vehicleQuery.payload_capacity, $gte: parseFloat(capacity_min) };
    }
    if (capacity_max) {
      vehicleQuery.payload_capacity = { ...vehicleQuery.payload_capacity, $lte: parseFloat(capacity_max) };
    }

    if (vehicle_type) {
      let vType = await VehicleType.findOne({
        $or: [
          { slug: vehicle_type.toLowerCase() },
          { name: { $regex: new RegExp(vehicle_type, 'i') } }
        ]
      });
      if (vType) {
        vehicleQuery.vehicleTypeId = vType._id;
      }
    }

    let parsedLat = parseFloat(latitude);
    let parsedLon = parseFloat(longitude);
    let hasCoords = !isNaN(parsedLat) && !isNaN(parsedLon);

    let vehicles = [];

    if (hasCoords) {
      // Use geospatial query or fallback computation
      try {
        vehicles = await TransportVehicle.find({
          ...vehicleQuery,
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [parsedLon, parsedLat]
              },
              $maxDistance: radiusNum * 1000 // Convert km to meters
            }
          }
        })
          .populate('providerId', 'company_name is_verified verification_status owners address')
          .populate('vehicleTypeId', 'name configuration icon')
          .lean();
      } catch (geoErr) {
        // Fallback to in-memory distance calculation if index building or geo fails
        const allVehicles = await TransportVehicle.find(vehicleQuery)
          .populate('providerId', 'company_name is_verified verification_status owners address')
          .populate('vehicleTypeId', 'name configuration icon')
          .lean();

        vehicles = allVehicles.filter(v => {
          if (!v.location || !v.location.coordinates) return false;
          const [vLon, vLat] = v.location.coordinates;
          const dist = calculateHaversineDistanceKm(parsedLat, parsedLon, vLat, vLon);
          return dist <= radiusNum;
        });
      }
    } else {
      // Fallback to city_id or city matching
      if (city_id) {
        const locWithDist = await Location.findOne({ 'districts._id': city_id }).lean();
        const distName = locWithDist?.districts?.find(d => d._id.toString() === city_id.toString())?.name;
        if (distName) {
          vehicleQuery.city_name = { $regex: new RegExp(distName, 'i') };
        }
      }

      vehicles = await TransportVehicle.find(vehicleQuery)
        .populate('providerId', 'company_name is_verified verification_status owners address')
        .populate('vehicleTypeId', 'name configuration icon')
        .lean();
    }

    const total = vehicles.length;
    const paginated = vehicles.slice(skip, skip + limit);

    const items = paginated.map(v => {
      let dist = null;
      if (hasCoords && v.location && v.location.coordinates) {
        dist = calculateHaversineDistanceKm(parsedLat, parsedLon, v.location.coordinates[1], v.location.coordinates[0]);
      }

      const driverPhone = v.driver_phone || v.providerId?.owners?.[0]?.phone || null;

      // Mask registration number for public privacy
      const maskedReg = v.registration_number ? v.registration_number.replace(/^([A-Z0-9]{4}).*([A-Z0-9]{2})$/, '$1****$2') : 'RJ14****01';

      return {
        id: v._id,
        driver_name: v.driver_name || 'Verified Driver',
        provider_name: v.providerId?.company_name || 'Local Transport Service',
        vehicle_type: v.vehicleTypeId?.name || 'Local Truck',
        configuration: v.vehicleTypeId?.configuration || 'Commercial',
        registration_number_masked: maskedReg,
        payload_capacity: v.payload_capacity,
        capacity_unit: v.capacity_unit,
        availability_status: v.availability_status,
        expected_availability_time: v.expected_available_time || (v.availability_status === 'available_now' ? 'Available now' : 'Unavailable'),
        distance_km: dist,
        city: v.city_name || v.providerId?.address?.district,
        state: v.state_name || v.providerId?.address?.state,
        image: v.images?.[0] || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
        is_verified: v.providerId?.is_verified || v.providerId?.verification_status === 'approved',
        contact_actions: {
          phone: driverPhone,
          whatsapp: driverPhone,
          whatsapp_url: formatWhatsAppUrl(driverPhone)
        }
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Nearby local transport vehicles retrieved successfully.',
      data: items,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit) || 1,
        radius_km: radiusNum,
        center_coords: hasCoords ? { latitude: parsedLat, longitude: parsedLon } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transports/local/vehicles/:vehicle_id
exports.getLocalVehicleById = async (req, res, next) => {
  try {
    const vehicle = await TransportVehicle.findById(req.params.vehicle_id)
      .populate('providerId', 'company_name is_verified verification_status owners address')
      .populate('vehicleTypeId', 'name configuration icon description')
      .lean();

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', null, 404);
    }

    const driverPhone = vehicle.driver_phone || vehicle.providerId?.owners?.[0]?.phone || null;
    const maskedReg = vehicle.registration_number ? vehicle.registration_number.replace(/^([A-Z0-9]{4}).*([A-Z0-9]{2})$/, '$1****$2') : 'RJ14****01';

    return res.status(200).json({
      success: true,
      message: 'Vehicle details retrieved successfully.',
      data: {
        id: vehicle._id,
        driver_name: vehicle.driver_name,
        provider: {
          id: vehicle.providerId?._id,
          name: vehicle.providerId?.company_name,
          is_verified: vehicle.providerId?.is_verified || vehicle.providerId?.verification_status === 'approved'
        },
        vehicle_type: vehicle.vehicleTypeId?.name,
        configuration: vehicle.vehicleTypeId?.configuration,
        registration_number_masked: maskedReg,
        payload_capacity: vehicle.payload_capacity,
        capacity_unit: vehicle.capacity_unit,
        permit_type: vehicle.permit_type,
        availability_status: vehicle.availability_status,
        expected_availability_time: vehicle.expected_available_time,
        images: vehicle.images,
        city: vehicle.city_name || vehicle.providerId?.address?.district,
        state: vehicle.state_name || vehicle.providerId?.address?.state,
        contact_actions: {
          phone: driverPhone,
          whatsapp: driverPhone,
          whatsapp_url: formatWhatsAppUrl(driverPhone)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. TRANSPORT PROVIDER PROFILE
// ==========================================
// GET /api/v1/transport-providers/:provider_id
exports.getProviderProfile = async (req, res, next) => {
  try {
    const { provider_id } = req.params;

    const provider = await BusinessProfile.findOne({
      _id: provider_id,
      business_type: { $in: ['transport_national', 'transport_local'] },
      status: 'active'
    }).lean();

    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    const isOwner = req.user && req.user.id === provider.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // 1. Authorized Contacts
    const contacts = (provider.owners || []).map(o => ({
      name: o.name,
      designation: o.designation || 'Transport Coordinator',
      phone: o.phone,
      whatsapp: o.whatsapp || o.phone,
      whatsapp_url: formatWhatsAppUrl(o.whatsapp || o.phone),
      photo: o.photo
    }));

    // 2. Fleet information
    const vehicles = await TransportVehicle.find({ providerId: provider._id, is_active: true })
      .populate('vehicleTypeId', 'name configuration icon')
      .lean();

    const fleet = vehicles.map(v => ({
      id: v._id,
      vehicle_type: v.vehicleTypeId?.name,
      configuration: v.vehicleTypeId?.configuration,
      payload_capacity: v.payload_capacity,
      capacity_unit: v.capacity_unit,
      permit_type: v.permit_type,
      availability_status: v.availability_status,
      expected_availability_time: v.expected_available_time,
      registration_number_masked: isOwner || isAdmin ? v.registration_number : v.registration_number.replace(/^([A-Z0-9]{4}).*([A-Z0-9]{2})$/, '$1****$2'),
      image: v.images?.[0] || null
    }));

    // 3. Supported Routes
    const routes = await TransportRoute.find({ providerId: provider._id, is_active: true }).lean();
    const formattedRoutes = routes.map(r => ({
      id: r._id,
      origin: `${r.origin_city_name}, ${r.origin_state_name}`,
      destination: `${r.destination_city_name}, ${r.destination_state_name}`,
      route_type: r.route_type,
      directionality: r.directionality,
      direct_route_only: r.direct_route_only,
      freight_rate: r.default_freight_rate,
      rate_unit: r.rate_unit
    }));

    // 4. Active Freight Rates
    const freightRates = await FreightRate.find({ providerId: provider._id, status: 'active' })
      .populate('vehicleTypeId', 'name')
      .lean();

    const formattedRates = freightRates.map(fr => ({
      id: fr._id,
      vehicle_type: fr.vehicleTypeId?.name || 'All Vehicles',
      origin: fr.origin_city_name || 'Operational Area',
      destination: fr.destination_city_name || 'All Covered Hubs',
      pricing_model: fr.pricing_model,
      amount: fr.amount,
      currency: fr.currency,
      unit: fr.unit,
      minimum_charge: fr.minimum_charge,
      additional_charges: fr.additional_charges
    }));

    // Check if current user favorited this provider
    let isFavorited = false;
    if (req.user) {
      const fav = await BusinessFavorite.findOne({ userId: req.user.id, businessId: provider._id });
      isFavorited = !!fav;
    }

    const profileData = {
      id: provider._id,
      company: {
        name: provider.company_name,
        logo: provider.owners?.[0]?.photo || null,
        cover_images: provider.cover_images || [],
        gallery: provider.gallery || [],
        description: provider.company_details,
        established_year: provider.established_year,
        provider_type: provider.business_type,
        transport_category: provider.transport_category,
        is_verified: provider.is_verified || provider.verification_status === 'approved',
        verification_status: provider.verification_status,
        rating: provider.rating || 0,
        review_count: provider.review_count || 0,
        is_favorited: isFavorited
      },
      contacts,
      business_details: {
        registered_address: isOwner || isAdmin ? provider.address?.full_address : provider.address?.area,
        city: provider.address?.district,
        state: provider.address?.state,
        working_hours: provider.working_hours,
        gstin: isOwner || isAdmin ? provider.gst_number : (provider.gst_number ? `${provider.gst_number.substring(0, 4)}XXXX${provider.gst_number.substring(12)}` : null)
      },
      service_coverage: {
        has_national_coverage: provider.has_national_coverage,
        has_all_india_permit: provider.has_all_india_permit,
        operational_states: provider.operational_states || [],
        operational_cities: provider.operational_cities || [],
        routes: formattedRoutes
      },
      fleet,
      freight_rates: formattedRates
    };

    return res.status(200).json({
      success: true,
      message: 'Transport provider profile retrieved successfully.',
      data: profileData
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. FREIGHT RATES PUBLIC RETRIEVAL
// ==========================================
// GET /api/v1/transport-providers/:provider_id/freight-rates
exports.getProviderFreightRates = async (req, res, next) => {
  try {
    const { provider_id } = req.params;
    const rates = await FreightRate.find({ providerId: provider_id, status: 'active' })
      .populate('vehicleTypeId', 'name configuration')
      .populate('routeId', 'origin_city_name destination_city_name directionality')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Freight rates retrieved successfully.',
      data: rates
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/freight-rates/:rate_id
exports.getFreightRateById = async (req, res, next) => {
  try {
    const rate = await FreightRate.findById(req.params.rate_id)
      .populate('providerId', 'company_name is_verified')
      .populate('vehicleTypeId', 'name')
      .lean();

    if (!rate) {
      return errorResponse(res, 'Freight rate not found', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Freight rate details retrieved successfully.',
      data: rate
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 6. TRANSPORT INQUIRIES
// ==========================================
// POST /api/v1/transport-inquiries
exports.createTransportInquiry = async (req, res, next) => {
  try {
    const {
      provider_id,
      full_name,
      phone,
      email,
      city,
      origin_location,
      destination_location,
      transport_type = 'national',
      vehicle_type,
      vehicle_quantity = 1,
      cargo_type,
      cargo_weight,
      quantity_unit = 'tons',
      pickup_date,
      expected_delivery_date,
      special_handling,
      additional_notes,
      attachments = []
    } = req.body;

    if (!provider_id) {
      return errorResponse(res, 'provider_id is required', null, 400);
    }
    if (!full_name || !phone) {
      return errorResponse(res, 'Full name and phone number are required', null, 400);
    }
    if (!origin_location || !destination_location) {
      return errorResponse(res, 'Origin and destination locations are required', null, 400);
    }

    const provider = await BusinessProfile.findById(provider_id);
    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    const refNumber = `TR-INQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const inquiry = await Inquiry.create({
      senderId: req.user ? req.user.id : null,
      businessId: provider._id,
      category: 'Transport',
      supplierType: 'transport',
      subject: `Transport Inquiry: ${cargo_type || 'Stone Material'} from ${origin_location} to ${destination_location}`,
      message: additional_notes || `Requesting ${vehicle_quantity}x ${vehicle_type || 'vehicle'} for ${cargo_weight || ''} ${quantity_unit}`,
      quantity: cargo_weight,
      unit: quantity_unit,
      transport_type,
      vehicle_type,
      vehicle_quantity,
      cargo_type,
      pickup_date,
      expected_delivery_date,
      special_handling,
      reference_number: refNumber,
      pickupLocation: {
        city: origin_location,
        address: origin_location
      },
      deliveryLocation: {
        city: destination_location,
        address: destination_location
      },
      contactInfo: {
        name: full_name,
        mobile: phone,
        email: email || '',
        city: city || ''
      },
      attachments,
      status: 'submitted'
    });

    return res.status(201).json({
      success: true,
      message: 'Transport inquiry submitted successfully.',
      data: {
        inquiry_id: inquiry._id,
        reference_number: refNumber,
        status: inquiry.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transport-inquiries
exports.getMyTransportInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({
      senderId: req.user.id,
      category: 'Transport'
    })
      .populate('businessId', 'company_name address owners')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Transport inquiries retrieved successfully.',
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transport-inquiries/:inquiry_id
exports.getTransportInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.inquiry_id)
      .populate('businessId', 'company_name address owners')
      .lean();

    if (!inquiry) {
      return errorResponse(res, 'Transport inquiry not found', null, 404);
    }

    // Access control: must be sender, target provider owner, or admin
    const isSender = req.user && inquiry.senderId && inquiry.senderId.toString() === req.user.id;
    const isTargetProvider = req.user && inquiry.businessId && inquiry.businessId.userId && inquiry.businessId.userId.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isSender && !isTargetProvider && !isAdmin) {
      return errorResponse(res, 'You are not authorized to view this inquiry', null, 403);
    }

    return res.status(200).json({
      success: true,
      message: 'Transport inquiry details retrieved successfully.',
      data: inquiry
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 7. TRANSPORT QUOTE REQUESTS & QUOTATIONS
// ==========================================
// POST /api/v1/transport-quote-requests
exports.createTransportQuoteRequest = async (req, res, next) => {
  try {
    const {
      provider_id,
      provider_ids, // Multi-provider broadcast
      pickup_location,
      destination_location,
      cargo_type,
      cargo_weight,
      quantity_unit = 'tons',
      required_vehicle_type,
      vehicle_quantity = 1,
      preferred_pickup_date,
      required_delivery_date,
      budget,
      additional_notes,
      attachments = [],
      buyer_contact
    } = req.body;

    if (!pickup_location || !destination_location) {
      return errorResponse(res, 'Pickup and destination locations are required', null, 400);
    }

    const refNumber = `TR-QREQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const targets = provider_ids && Array.isArray(provider_ids) && provider_ids.length > 0 ? provider_ids : (provider_id ? [provider_id] : []);

    if (targets.length === 0) {
      return errorResponse(res, 'At least one target transport provider must be specified', null, 400);
    }

    // Broadcast or single creation
    if (targets.length > 1) {
      const parentQuote = await QuoteRequest.create({
        userId: req.user.id,
        assignedSuppliers: targets,
        cargo_type,
        cargo_weight,
        quantity: cargo_weight || 1,
        unit: quantity_unit,
        required_vehicle_type,
        vehicle_quantity,
        pickup_location: { city: pickup_location, address: pickup_location },
        delivery_location: { city: destination_location, address: destination_location },
        preferred_pickup_date,
        required_delivery_date,
        budget,
        message: additional_notes || 'Requesting quotation for stone shipment',
        reference_number: refNumber,
        buyerContact: buyer_contact,
        attachments,
        status: 'sent_to_suppliers'
      });

      const childQuotes = await Promise.all(
        targets.map(pId =>
          QuoteRequest.create({
            userId: req.user.id,
            businessId: pId,
            parentQuoteId: parentQuote._id,
            cargo_type,
            cargo_weight,
            quantity: cargo_weight || 1,
            unit: quantity_unit,
            required_vehicle_type,
            vehicle_quantity,
            pickup_location: { city: pickup_location, address: pickup_location },
            delivery_location: { city: destination_location, address: destination_location },
            preferred_pickup_date,
            required_delivery_date,
            budget,
            message: additional_notes || 'Requesting quotation for stone shipment',
            reference_number: `${refNumber}-${pId.toString().slice(-3)}`,
            buyerContact: buyer_contact,
            attachments,
            status: 'submitted'
          })
        )
      );

      return res.status(201).json({
        success: true,
        message: 'Transport quote request dispatched to multiple providers.',
        data: {
          parent_quote_id: parentQuote._id,
          reference_number: refNumber,
          dispatched_count: childQuotes.length,
          quotes: childQuotes
        }
      });
    }

    // Single provider quote request
    const quote = await QuoteRequest.create({
      userId: req.user.id,
      businessId: targets[0],
      cargo_type,
      cargo_weight,
      quantity: cargo_weight || 1,
      unit: quantity_unit,
      required_vehicle_type,
      vehicle_quantity,
      pickup_location: { city: pickup_location, address: pickup_location },
      delivery_location: { city: destination_location, address: destination_location },
      preferred_pickup_date,
      required_delivery_date,
      budget,
      message: additional_notes || 'Requesting quotation for stone shipment',
      reference_number: refNumber,
      buyerContact: buyer_contact,
      attachments,
      status: 'submitted'
    });

    return res.status(201).json({
      success: true,
      message: 'Transport quote request submitted successfully.',
      data: {
        id: quote._id,
        reference_number: refNumber,
        status: quote.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transport-quote-requests
exports.getMyTransportQuoteRequests = async (req, res, next) => {
  try {
    const quotes = await QuoteRequest.find({
      userId: req.user.id,
      parentQuoteId: { $exists: false }
    })
      .populate('businessId', 'company_name address owners')
      .populate('assignedSuppliers', 'company_name')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Transport quote requests retrieved successfully.',
      data: quotes
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transport-quote-requests/:request_id
exports.getTransportQuoteRequestById = async (req, res, next) => {
  try {
    const quote = await QuoteRequest.findById(req.params.request_id)
      .populate('businessId', 'company_name address owners')
      .populate('assignedSuppliers', 'company_name')
      .lean();

    if (!quote) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Quote request details retrieved successfully.',
      data: quote
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/transport-quote-requests/:request_id/quotes (Provider submits quote)
exports.submitTransportQuote = async (req, res, next) => {
  try {
    const { request_id } = req.params;
    const {
      amount,
      pricing_unit = 'INR per ton',
      offered_capacity,
      vehicle_type,
      estimated_total,
      additional_charges = 0,
      taxes = 0,
      pickup_estimate,
      delivery_estimate,
      valid_until,
      terms
    } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Valid quotation amount is required', null, 400);
    }

    const quoteReq = await QuoteRequest.findById(request_id);
    if (!quoteReq) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    // Provider check
    const provider = await BusinessProfile.findOne({
      userId: req.user.id,
      business_type: { $in: ['transport_national', 'transport_local'] }
    });

    if (!provider) {
      return errorResponse(res, 'Only registered transport providers can submit quotations', null, 403);
    }

    // Verify quote request is assigned to this provider
    const isAssigned =
      (quoteReq.businessId && quoteReq.businessId.equals(provider._id)) ||
      (quoteReq.assignedSuppliers && quoteReq.assignedSuppliers.some(sId => sId.equals(provider._id)));

    if (!isAssigned) {
      return errorResponse(res, 'This quote request is not assigned to your business', null, 403);
    }

    const refNumber = `TR-QUO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const response = await QuoteResponse.findOneAndUpdate(
      { quoteRequestId: quoteReq._id, supplierId: provider._id },
      {
        quoteRequestId: quoteReq._id,
        supplierId: provider._id,
        supplierUserId: req.user.id,
        offered_price: amount,
        currency: 'INR',
        unit: pricing_unit,
        offered_capacity,
        vehicle_type,
        estimated_total: estimated_total || amount,
        additional_charges,
        taxes,
        pickup_estimate,
        delivery_estimate,
        offer_validity: valid_until,
        reference_number: refNumber,
        terms_and_conditions: terms,
        status: 'submitted'
      },
      { upsert: true, new: true }
    );

    quoteReq.status = 'responded';
    await quoteReq.save();

    return res.status(201).json({
      success: true,
      message: 'Transport quote submitted successfully.',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/transport-quote-requests/:request_id/quotes
exports.getTransportQuotesForRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;
    const quoteReq = await QuoteRequest.findById(request_id);
    if (!quoteReq) {
      return errorResponse(res, 'Quote request not found', null, 404);
    }

    const isBuyerOwner = quoteReq.userId.toString() === req.user.id;
    const provider = await BusinessProfile.findOne({ userId: req.user.id });

    if (isBuyerOwner || req.user.role === 'admin') {
      const responses = await QuoteResponse.find({ quoteRequestId: quoteReq._id })
        .populate('supplierId', 'company_name owners address rating is_verified')
        .lean();
      return res.status(200).json({
        success: true,
        message: 'Transport quotes retrieved successfully.',
        data: responses
      });
    }

    // If provider, strictly return only their own quote response (Confidentiality)
    if (provider) {
      const response = await QuoteResponse.findOne({ quoteRequestId: quoteReq._id, supplierId: provider._id })
        .populate('supplierId', 'company_name owners address')
        .lean();
      return res.status(200).json({
        success: true,
        message: 'Your transport quotation retrieved successfully.',
        data: response ? [response] : []
      });
    }

    return errorResponse(res, 'Not authorized to view these quotes', null, 403);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/transport-quotes/:quote_id/accept
exports.acceptTransportQuote = async (req, res, next) => {
  try {
    const quoteResp = await QuoteResponse.findById(req.params.quote_id);
    if (!quoteResp) {
      return errorResponse(res, 'Quote not found', null, 404);
    }

    const quoteReq = await QuoteRequest.findById(quoteResp.quoteRequestId);
    if (!quoteReq || quoteReq.userId.toString() !== req.user.id) {
      return errorResponse(res, 'Only the requesting buyer can accept this quote', null, 403);
    }

    if (quoteResp.status === 'accepted') {
      return errorResponse(res, 'This quote is already accepted', null, 400);
    }

    quoteResp.status = 'accepted';
    await quoteResp.save();

    quoteReq.status = 'accepted';
    await quoteReq.save();

    return res.status(200).json({
      success: true,
      message: 'Transport quotation accepted successfully.',
      data: quoteResp
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/transport-quotes/:quote_id/reject
exports.rejectTransportQuote = async (req, res, next) => {
  try {
    const quoteResp = await QuoteResponse.findById(req.params.quote_id);
    if (!quoteResp) {
      return errorResponse(res, 'Quote not found', null, 404);
    }

    const quoteReq = await QuoteRequest.findById(quoteResp.quoteRequestId);
    if (!quoteReq || quoteReq.userId.toString() !== req.user.id) {
      return errorResponse(res, 'Only the requesting buyer can reject this quote', null, 403);
    }

    quoteResp.status = 'rejected';
    await quoteResp.save();

    return res.status(200).json({
      success: true,
      message: 'Transport quotation rejected.',
      data: quoteResp
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 8. FAVORITES / SAVED TRANSPORTERS
// ==========================================
// GET /api/v1/favorites/transports
exports.getFavoriteTransports = async (req, res, next) => {
  try {
    const favorites = await BusinessFavorite.find({ userId: req.user.id })
      .populate({
        path: 'businessId',
        match: { business_type: { $in: ['transport_national', 'transport_local'] } }
      })
      .sort({ createdAt: -1 })
      .lean();

    const filtered = favorites.filter(f => f.businessId).map(f => ({
      favorite_id: f._id,
      provider: {
        id: f.businessId._id,
        name: f.businessId.company_name,
        category: f.businessId.transport_category,
        is_verified: f.businessId.is_verified || f.businessId.verification_status === 'approved',
        location: {
          city: f.businessId.address?.district,
          state: f.businessId.address?.state
        },
        phone: f.businessId.owners?.[0]?.phone,
        whatsapp_url: formatWhatsAppUrl(f.businessId.owners?.[0]?.whatsapp || f.businessId.owners?.[0]?.phone)
      },
      saved_at: f.createdAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Favorite transport providers retrieved successfully.',
      data: filtered
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/favorites/transports/:provider_id
exports.addFavoriteTransport = async (req, res, next) => {
  try {
    const { provider_id } = req.params;
    const provider = await BusinessProfile.findOne({
      _id: provider_id,
      business_type: { $in: ['transport_national', 'transport_local'] }
    });

    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    const existing = await BusinessFavorite.findOne({ userId: req.user.id, businessId: provider._id });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Provider is already in favorites.',
        data: existing
      });
    }

    const fav = await BusinessFavorite.create({
      userId: req.user.id,
      businessId: provider._id
    });

    return res.status(201).json({
      success: true,
      message: 'Transport provider saved to favorites.',
      data: fav
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/favorites/transports/:provider_id
exports.removeFavoriteTransport = async (req, res, next) => {
  try {
    const { provider_id } = req.params;
    await BusinessFavorite.findOneAndDelete({ userId: req.user.id, businessId: provider_id });

    return res.status(200).json({
      success: true,
      message: 'Transport provider removed from favorites.'
    });
  } catch (err) {
    next(err);
  }
};
