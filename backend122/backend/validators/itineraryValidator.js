/**
 * Validates the body for itinerary generation.
 * Enforces business logic required before we spend tokens calling the AI.
 * 
 * @param {Object} data - The request body.
 * @returns {Object} { valid: boolean, errors: Object }
 */
const validateGenerateRequest = (data) => {
  const errors = {};
  let valid = true;

  if (!data.destinations || typeof data.destinations !== 'string' || data.destinations.trim() === '') {
    errors.destinations = 'Destinations are required and must be non-empty.';
    valid = false;
  }

  if (!data.traveler_count || typeof data.traveler_count !== 'number' || data.traveler_count < 1) {
    errors.traveler_count = 'Traveler count must be at least 1.';
    valid = false;
  }

  if (!data.budget || typeof data.budget !== 'number' || data.budget <= 0) {
    errors.budget = 'Budget must be greater than 0.';
    valid = false;
  }

  if (!data.duration_days || typeof data.duration_days !== 'number' || data.duration_days < 1 || data.duration_days > 30) {
    errors.duration_days = 'Duration must be between 1 and 30 days.';
    valid = false;
  }

  if (!data.interests || !Array.isArray(data.interests) || data.interests.length === 0) {
    errors.interests = 'At least one interest is required.';
    valid = false;
  }

  const allowedPaces = ['relaxed', 'balanced', 'packed'];
  if (!data.pace || !allowedPaces.includes(data.pace.toLowerCase())) {
    errors.pace = 'Pace must be one of: relaxed, balanced, packed.';
    valid = false;
  }

  const allowedTiers = ['budget', 'mid-range', 'luxury'];
  if (!data.budget_tier || !allowedTiers.includes(data.budget_tier.toLowerCase())) {
    errors.budget_tier = 'Budget tier must be one of: budget, mid-range, luxury.';
    valid = false;
  }

  if (!data.start_date || isNaN(Date.parse(data.start_date))) {
    errors.start_date = 'Valid start date (YYYY-MM-DD) is required.';
    valid = false;
  }

  return { valid, errors };
};

module.exports = { validateGenerateRequest };
