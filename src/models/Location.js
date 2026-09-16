const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pincode: { type: String }
});

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  areas: [areaSchema]
});

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  districts: [districtSchema]
});

module.exports = mongoose.model('Location', stateSchema);
