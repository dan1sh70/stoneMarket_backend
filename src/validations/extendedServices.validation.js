const Joi = require('joi');

// ==========================================
// 1. MACHINE REPAIRING VALIDATIONS
// ==========================================
const createMachineRepairingSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Service Title *
  category: Joi.string().trim().required(), // Repair Category *
  repair_category: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  machine_brands_supported: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  workshop_images: Joi.array().items(Joi.string().trim()),
  previous_work_images: Joi.array().items(Joi.string().trim()),
  videos: Joi.array().items(Joi.string().trim()),

  // STEP 2 – TECHNICAL EXPERTISE
  supported_machine_types: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).required(), // Machine Type Supported *
  supported_brands: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).required(), // Supported Machine Brands *
  machine_models_supported: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  repair_specialization: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).required(), // Repair Specialization *
  mechanical_repair: Joi.boolean().default(false),
  electrical_repair: Joi.boolean().default(false),
  hydraulic_repair: Joi.boolean().default(false),
  plc_automation_support: Joi.boolean().default(false),
  spare_parts_availability: Joi.boolean().default(false),
  onsite_service_available: Joi.boolean().default(true),
  workshop_repair_available: Joi.boolean().default(true),
  emergency_repair_support: Joi.boolean().default(false),
  technician_experience: Joi.string().trim().allow('', null),
  warranty_on_repair_work: Joi.string().trim().allow('', null),

  // STEP 3 – PRICING & AVAILABILITY
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  pricing_unit: Joi.string().trim().default('Per Visit'),
  minimum_service_charge: Joi.number().min(0).allow(null),
  inspection_visit_charge: Joi.number().min(0).allow(null),
  emergency_service_charge: Joi.number().min(0).allow(null),
  operating_base_location: Joi.string().trim().required(), // Operating Base Location *
  service_radius: Joi.string().trim().allow('', null),
  technician_availability: Joi.string().trim().allow('', null),
  working_days: Joi.string().trim().allow('', null),
  emergency_availability: Joi.string().trim().allow('', null),
  travel_charges: Joi.string().trim().allow('', null),
  spare_parts_charges: Joi.string().trim().allow('', null),
  estimated_repair_time: Joi.string().trim().allow('', null),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateMachineRepairingSchema = createMachineRepairingSchema.fork(
  ['name', 'category', 'supported_machine_types', 'supported_brands', 'repair_specialization', 'operating_base_location'],
  (schema) => schema.optional()
);

// ==========================================
// 2. ELECTRICAL PANEL & REPAIRING VALIDATIONS
// ==========================================
const createElectricalPanelSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Product / Service Name *
  category: Joi.string().trim().required(), // Electrical Category *
  electrical_category: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  wiring_diagrams: Joi.array().items(Joi.string().trim()),
  circuit_diagrams: Joi.array().items(Joi.string().trim()),
  technical_documents: Joi.array().items(Joi.string().trim()),
  videos: Joi.array().items(Joi.string().trim()),

  // STEP 2 – TECHNICAL SPECIFICATIONS
  panel_type: Joi.string().trim().allow('', null),
  voltage_rating: Joi.string().trim().allow('', null),
  phase: Joi.string().trim().allow('', null),
  rated_current_amp: Joi.string().trim().allow('', null),
  frequency_hz: Joi.string().trim().allow('', null),
  short_circuit_rating_ka: Joi.string().trim().allow('', null),
  ip_protection_rating: Joi.string().trim().allow('', null),
  busbar_material: Joi.string().trim().allow('', null),
  busbar_rating: Joi.string().trim().allow('', null),
  enclosure_material: Joi.string().trim().allow('', null),
  control_components: Joi.string().trim().allow('', null),
  plc_vfd_brand: Joi.string().trim().allow('', null),
  protection_system: Joi.string().trim().allow('', null),
  standards_certifications: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  custom_configuration_available: Joi.boolean().default(true),
  // Repair service dynamic fields
  equipment_type: Joi.string().trim().allow('', null),
  motor_capacity: Joi.string().trim().allow('', null),
  voltage_supported: Joi.string().trim().allow('', null),
  fault_diagnosis: Joi.string().trim().allow('', null),
  repair_capabilities: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  supported_brands: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  onsite_service: Joi.boolean().default(true),

  // STEP 3 – PRICING & INSTALLATION
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  pricing_unit: Joi.string().trim().default('Per Unit'),
  manufacturing_lead_time: Joi.string().trim().allow('', null),
  installation_available: Joi.boolean().default(true),
  commissioning_available: Joi.boolean().default(true),
  annual_maintenance_contract: Joi.boolean().default(false),
  warranty: Joi.string().trim().allow('', null),
  warranty_guarantee: Joi.string().trim().allow('', null),
  operating_location: Joi.string().trim().allow('', null),
  service_coverage: Joi.string().trim().allow('', null),
  transportation_available: Joi.boolean().default(true),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateElectricalPanelSchema = createElectricalPanelSchema.fork(
  ['name', 'category'],
  (schema) => schema.optional()
);

// ==========================================
// 3. WATER SUPPLIER VALIDATIONS
// ==========================================
const createWaterSupplierSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Water Product / Service Name *
  category: Joi.string().trim().required(), // Water Supply Category *
  water_supply_category: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  water_source: Joi.string().trim().required(), // Water Source *
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  tanker_images: Joi.array().items(Joi.string().trim()),
  storage_images: Joi.array().items(Joi.string().trim()),
  packaging_images: Joi.array().items(Joi.string().trim()),
  water_testing_reports: Joi.array().items(Joi.string().trim()),
  quality_certificates: Joi.array().items(Joi.string().trim()),

  // STEP 2 – WATER QUALITY & SUPPLY DETAILS
  water_type: Joi.string().trim().required(), // Water Type *
  supply_capacity: Joi.string().trim().required(), // Supply Capacity *
  water_quality_certification: Joi.string().trim().allow('', null),
  testing_laboratory: Joi.string().trim().allow('', null),
  water_availability: Joi.string().trim().allow('', null),
  storage_capacity: Joi.string().trim().allow('', null),
  // Drinking / Packaged
  tds_ppm: Joi.alternatives().try(Joi.number(), Joi.string().trim()).allow(null),
  ph_value: Joi.alternatives().try(Joi.number(), Joi.string().trim()).allow(null),
  hardness: Joi.string().trim().allow('', null),
  packaging_size: Joi.string().trim().allow('', null),
  fssai_licence_number: Joi.string().trim().allow('', null),
  bis_certification: Joi.string().trim().allow('', null),
  treatment_process: Joi.string().trim().allow('', null),
  purification_method: Joi.string().trim().allow('', null),
  // Industrial
  chloride_content: Joi.string().trim().allow('', null),
  suspended_solids: Joi.string().trim().allow('', null),
  industrial_suitability: Joi.string().trim().allow('', null),
  // Tanker
  tanker_capacity: Joi.string().trim().allow('', null),
  number_of_tankers: Joi.number().min(0).allow(null),
  vehicle_type: Joi.string().trim().allow('', null),
  daily_supply_capacity: Joi.string().trim().allow('', null),
  tanker_availability: Joi.string().trim().allow('', null),

  // STEP 3 – PRICING & DELIVERY
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  pricing_unit: Joi.string().trim().default('Per Tanker'),
  min_order_quantity: Joi.number().min(1).default(1),
  delivery_charges: Joi.string().trim().allow('', null),
  transportation_available: Joi.boolean().default(true),
  operating_base_location: Joi.string().trim().required(), // Operating Location *
  operating_location: Joi.string().trim().allow('', null),
  service_radius: Joi.string().trim().allow('', null),
  delivery_schedule: Joi.string().trim().allow('', null),
  regular_supply_available: Joi.boolean().default(true),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateWaterSupplierSchema = createWaterSupplierSchema.fork(
  ['name', 'category', 'water_source', 'water_type', 'supply_capacity', 'operating_base_location'],
  (schema) => schema.optional()
);

// ==========================================
// 4. CA & TAX ADVISOR VALIDATIONS
// ==========================================
const createCaTaxAdvisorSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Service Title *
  category: Joi.string().trim().required(), // Professional Service Category *
  professional_service_category: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  firm_name: Joi.string().trim().allow('', null),
  professional_profile: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  office_images: Joi.array().items(Joi.string().trim()),
  team_images: Joi.array().items(Joi.string().trim()),
  certifications: Joi.array().items(Joi.string().trim()),
  relevant_documents: Joi.array().items(Joi.string().trim()),

  // STEP 2 – PROFESSIONAL DETAILS
  professional_name: Joi.string().trim().required(), // Professional Name *
  qualification: Joi.string().trim().required(), // Qualification *
  ca_membership_number: Joi.string().trim().allow('', null),
  firm_registration_number: Joi.string().trim().allow('', null),
  years_of_experience: Joi.number().min(0).allow(null),
  professional_registration_details: Joi.string().trim().allow('', null),
  areas_of_expertise: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).required(), // Areas of Expertise *
  gst_expertise: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  income_tax_expertise: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  audit_expertise: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  company_law_expertise: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  accounting_expertise: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  industries_served: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  online_consultation_available: Joi.boolean().default(true),
  office_consultation_available: Joi.boolean().default(true),
  client_types: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),

  // STEP 3 – FEES & AVAILABILITY
  consultation_fee: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null), // Consultation Fee
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  service_fee: Joi.number().min(0).allow(null),
  pricing_unit: Joi.string().trim().default('Per Service'),
  gst_registration_charges: Joi.number().min(0).allow(null),
  gst_return_filing_charges: Joi.number().min(0).allow(null),
  itr_filing_charges: Joi.number().min(0).allow(null),
  audit_charges: Joi.number().min(0).allow(null),
  monthly_accounting_charges: Joi.number().min(0).allow(null),
  online_consultation: Joi.boolean().default(true),
  office_appointment: Joi.boolean().default(true),
  working_days: Joi.string().trim().allow('', null),
  appointment_availability: Joi.string().trim().allow('', null),
  office_location: Joi.string().trim().allow('', null),
  service_coverage: Joi.string().trim().allow('', null),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateCaTaxAdvisorSchema = createCaTaxAdvisorSchema.fork(
  ['name', 'category', 'professional_name', 'qualification', 'areas_of_expertise'],
  (schema) => schema.optional()
);

// ==========================================
// 5. BANKING & LOAN SERVICES VALIDATIONS
// ==========================================
const createBankingLoanSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Service / Product Name *
  category: Joi.string().trim().required(), // Financial Category *
  financial_category: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  institution_bank_name: Joi.string().trim().allow('', null),
  lending_institution: Joi.string().trim().required(), // Lending Institution *
  branch_details: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  brochure_documents: Joi.array().items(Joi.string().trim()),
  product_documentation: Joi.array().items(Joi.string().trim()),

  // STEP 2 – FINANCIAL PRODUCT DETAILS
  financial_product_type: Joi.string().trim().required(), // Financial Product Type *
  loan_purpose: Joi.string().trim().required(), // Loan Purpose *
  min_loan_amount: Joi.number().min(0).allow(null),
  max_loan_amount: Joi.number().min(0).allow(null),
  loan_amount_range: Joi.string().trim().allow('', null),
  loan_tenure: Joi.string().trim().allow('', null),
  interest_rate_type: Joi.string().trim().allow('', null),
  interest_rate_range: Joi.string().trim().allow('', null),
  collateral_required: Joi.boolean().default(false),
  security_type: Joi.string().trim().allow('', null),
  repayment_frequency: Joi.string().trim().allow('', null),
  emi_facility: Joi.boolean().default(true),
  processing_time: Joi.string().trim().allow('', null),
  eligible_customer_types: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),

  // STEP 3 – CHARGES & ELIGIBILITY
  processing_fee: Joi.string().trim().allow('', null),
  documentation_charges: Joi.string().trim().allow('', null),
  consultation_fee: Joi.number().min(0).allow(null),
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  pricing_unit: Joi.string().trim().default('Per Loan Case'),
  interest_rate_information: Joi.string().trim().allow('', null),
  minimum_eligibility_criteria: Joi.string().trim().allow('', null),
  required_documents: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  min_business_vintage: Joi.string().trim().allow('', null),
  min_turnover: Joi.string().trim().allow('', null),
  credit_score_requirements: Joi.string().trim().allow('', null),
  collateral_requirements: Joi.string().trim().allow('', null),
  application_assistance: Joi.boolean().default(true),
  branch_location: Joi.string().trim().allow('', null),
  online_application_available: Joi.boolean().default(true),
  consultation_available: Joi.boolean().default(true),
  is_intermediary_disclosed: Joi.boolean().default(true),
  terms_disclosure: Joi.string().valid('Indicative', 'Confirmed').default('Indicative'),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateBankingLoanSchema = createBankingLoanSchema.fork(
  ['name', 'category', 'lending_institution', 'financial_product_type', 'loan_purpose'],
  (schema) => schema.optional()
);

// ==========================================
// 6. HOTEL & RESTAURANT VALIDATIONS
// ==========================================
const createHotelRestaurantSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Hotel / Restaurant Name *
  category: Joi.string().trim().required(), // Hospitality Category *
  hospitality_category: Joi.string().trim().allow('', null),
  establishment_type: Joi.string().valid('Hotel', 'Restaurant', 'Both').default('Hotel'),
  description: Joi.string().trim().allow('', null),
  business_address: Joi.string().trim().required(), // Business Address *
  contact_number: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  hotel_images: Joi.array().items(Joi.string().trim()),
  restaurant_images: Joi.array().items(Joi.string().trim()),
  room_images: Joi.array().items(Joi.string().trim()),
  dining_area_images: Joi.array().items(Joi.string().trim()),
  kitchen_images: Joi.array().items(Joi.string().trim()),
  exterior_images: Joi.array().items(Joi.string().trim()),
  menu_documents: Joi.array().items(Joi.string().trim()),
  videos: Joi.array().items(Joi.string().trim()),

  // STEP 2 – FACILITIES & DETAILS
  // A. Hotel Details
  total_rooms: Joi.number().min(0).allow(null),
  room_types: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  room_types_pricing: Joi.array().items(
    Joi.object({
      room_type: Joi.string().trim().required(),
      price_per_night: Joi.number().min(0).required()
    })
  ),
  total_guest_capacity: Joi.number().min(0).allow(null),
  check_in_time: Joi.string().trim().allow('', null),
  check_out_time: Joi.string().trim().allow('', null),
  parking_available: Joi.boolean().default(true),
  wifi_available: Joi.boolean().default(true),
  restaurant_available: Joi.boolean().default(true),
  room_service: Joi.boolean().default(true),
  laundry_service: Joi.boolean().default(false),
  conference_hall: Joi.boolean().default(false),
  banquet_facility: Joi.boolean().default(false),
  lift_available: Joi.boolean().default(false),
  pet_friendly: Joi.boolean().default(false),

  // B. Restaurant Details
  cuisine_types: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  food_categories: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),
  food_type: Joi.string().trim().allow('', null),
  seating_capacity: Joi.number().min(0).allow(null),
  ac_dining: Joi.boolean().default(true),
  takeaway_available: Joi.boolean().default(true),
  home_delivery: Joi.boolean().default(true),
  catering_available: Joi.boolean().default(true),
  party_booking: Joi.boolean().default(true),
  opening_hours: Joi.string().trim().allow('', null),
  weekly_closing_day: Joi.string().trim().allow('', null),

  // STEP 3 – PRICING & AVAILABILITY
  selling_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow(null),
  pricing_unit: Joi.string().trim().default('Per Night'),
  starting_room_price: Joi.number().min(0).allow(null),
  extra_bed_charges: Joi.number().min(0).allow(null),
  average_cost_per_person: Joi.number().min(0).allow(null),
  min_order_value: Joi.number().min(0).allow(null),
  cancellation_policy: Joi.string().trim().allow('', null),
  advance_payment_policy: Joi.string().trim().allow('', null),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
}).unknown(true);

const updateHotelRestaurantSchema = createHotelRestaurantSchema.fork(
  ['name', 'category', 'business_address'],
  (schema) => schema.optional()
);

// Generic Profile Update Schema
const updateServiceBusinessProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  address: Joi.object({
    state: Joi.string().trim().allow('', null),
    district: Joi.string().trim().allow('', null),
    area: Joi.string().trim().allow('', null),
    industrial_area: Joi.string().trim().allow('', null),
    commercial_area: Joi.string().trim().allow('', null),
    office_address: Joi.string().trim().allow('', null),
    full_address: Joi.string().trim().allow('', null),
    postal_code: Joi.string().trim().allow('', null),
    country: Joi.string().trim().default('India'),
    google_map_location: Joi.string().trim().allow('', null),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null)
  })
}).unknown(true);

const serviceContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false)
});

const serviceGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().trim().default('facility'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const serviceGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().trim().default('demonstration'),
  duration: Joi.string().trim().allow('', null)
});

const serviceGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const serviceAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  createMachineRepairingSchema,
  updateMachineRepairingSchema,
  createElectricalPanelSchema,
  updateElectricalPanelSchema,
  createWaterSupplierSchema,
  updateWaterSupplierSchema,
  createCaTaxAdvisorSchema,
  updateCaTaxAdvisorSchema,
  createBankingLoanSchema,
  updateBankingLoanSchema,
  createHotelRestaurantSchema,
  updateHotelRestaurantSchema,
  updateServiceBusinessProfileSchema,
  serviceContactSchema,
  serviceGalleryPhotoSchema,
  serviceGalleryVideoSchema,
  serviceGstVerifySchema,
  serviceAnalyticsEventSchema
};

