const RegistrationDraft = require('../models/RegistrationDraft');
const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const { getSchema } = require('../validations/registrationValidation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Process Registration Step
// @route   POST /api/registration/:type/step-:step
// @access  Private
exports.processStep = async (req, res, next) => {
  try {
    const { type, step } = req.params;
    const stepNumber = parseInt(step);
    
    if (stepNumber < 1 || stepNumber > 3) {
      return errorResponse(res, 'Invalid step number', null, 400);
    }

    const schema = getSchema(type, stepNumber);
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = {};
      error.details.forEach(err => { errors[err.context.key] = [err.message]; });
      return errorResponse(res, 'Validation failed', errors, 422);
    }

    // Additional database validation for service_provider
    if (type === 'service_provider' && stepNumber === 1) {
      const ServiceCategory = require('../models/ServiceCategory');
      const categoryExists = await ServiceCategory.exists({ _id: value.service_category_id, status: 'active' });
      if (!categoryExists) {
        return errorResponse(res, 'Validation failed', { service_category_id: ['The selected service category is invalid.'] }, 422);
      }
    }

    // Check for existing draft or create new
    let draft = await RegistrationDraft.findOne({ userId: req.user.id, type, status: { $ne: 'submitted' } });
    
    if (!draft) {
      draft = new RegistrationDraft({
        registration_id: `REG_${Date.now()}`,
        userId: req.user.id,
        type
      });
    }

    // Update draft data
    draft.data[`step${stepNumber}`] = value;
    if (!draft.completed_steps.includes(stepNumber)) {
      draft.completed_steps.push(stepNumber);
    }
    
    draft.current_step = stepNumber < 3 ? stepNumber + 1 : 3;
    draft.status = `step_${stepNumber}_completed`;
    
    await draft.save();

    return successResponse(res, `Step ${stepNumber} saved successfully`, {
      registration_id: draft.registration_id,
      type: draft.type,
      current_step: draft.current_step,
      status: draft.status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Registration Draft
// @route   GET /api/registration/:registration_id
// @access  Private
exports.getRegistration = async (req, res, next) => {
  try {
    const draft = await RegistrationDraft.findOne({ registration_id: req.params.registration_id, userId: req.user.id });
    if (!draft) return errorResponse(res, 'Registration not found', null, 404);

    return successResponse(res, 'Registration retrieved successfully', {
      registration_id: draft.registration_id,
      type: draft.type,
      current_step: draft.current_step,
      status: draft.status,
      completed_steps: draft.completed_steps,
      data: draft.data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit Final Registration
// @route   POST /api/registration/:registration_id/submit
// @access  Private
exports.submitRegistration = async (req, res, next) => {
  try {
    const draft = await RegistrationDraft.findOne({ registration_id: req.params.registration_id, userId: req.user.id });
    if (!draft) return errorResponse(res, 'Registration not found', null, 404);

    if (draft.status === 'submitted') {
      return errorResponse(res, 'Registration already submitted', null, 400);
    }

    // Basic check if required steps are completed
    if (!draft.completed_steps.includes(1) || !draft.completed_steps.includes(2) || !draft.completed_steps.includes(3)) {
       return errorResponse(res, 'Please complete all steps before submitting', null, 400);
    }

    const { step1, step2, step3 } = draft.data;

    const owners = [step2.owner_1];
    if (step2.owner_2) owners.push(step2.owner_2);

    // Create Final Profile
    const profile = await BusinessProfile.create({
      userId: req.user.id,
      business_type: draft.type,
      
      // Step 1 mapping
      company_name: step1.company_name || step1.showroom_name,
      gst_number: step1.gst_number,
      established_year: step1.established_year,
      company_details: step1.company_details,
      granite_colors: step1.granite_colors,
      ec_number: step1.ec_number,
      iec_number: step1.iec_number,
      is_export_unit: step1.is_export_unit,
      monthly_capacity: step1.monthly_capacity_ton || step1.monthly_capacity_sqf,
      machines: step1.machines,
      working_times: step1.working_times,
      service_categories: step1.service_category_id ? [step1.service_category_id] : [],
      
      // Step 2 mapping
      owners,

      // Step 3 mapping
      address: {
        state: step3.state,
        district: step3.district,
        area: step3.area,
        full_address: step3.address || step3.showroom_address,
        google_map_location: step3.google_map_location
      },
      premises_status: step3.premises_status,
      terms_accepted: step3.terms_accepted,
      terms_accepted_at: new Date(),
      privacy_policy_accepted: step3.privacy_policy_accepted,
      privacy_policy_accepted_at: new Date(),
      
      status: 'pending' // Wait for admin approval
    });

    // Update User Role
    await User.findByIdAndUpdate(req.user.id, { role: draft.type });

    // Mark Draft as Submitted
    draft.status = 'submitted';
    await draft.save();

    return successResponse(res, 'Registration submitted successfully', {
      registration_id: draft.registration_id,
      business_id: profile._id,
      business_type: profile.business_type,
      status: 'submitted'
    });
  } catch (err) {
    next(err);
  }
};
