const mongoose = require('mongoose');
const PlanSchema = require('./Schema/Plan');
const Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
