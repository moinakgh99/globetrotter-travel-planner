const isValidDate = (dateString) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString || !dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};

const validateCreateTrip = (data) => {
  const errors = {};
  let valid = true;

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 150) {
    errors.name = 'Name is required and must be between 1 and 150 characters.';
    valid = false;
  }

  if (!data.start_date || !isValidDate(data.start_date)) {
    errors.start_date = 'Start date is required and must be a valid ISO date (YYYY-MM-DD).';
    valid = false;
  }

  if (!data.end_date || !isValidDate(data.end_date)) {
    errors.end_date = 'End date is required and must be a valid ISO date (YYYY-MM-DD).';
    valid = false;
  }

  if (data.start_date && data.end_date && isValidDate(data.start_date) && isValidDate(data.end_date)) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      errors.end_date = 'End date cannot be before start date.';
      valid = false;
    }
  }

  if (data.is_public !== undefined && typeof data.is_public !== 'boolean') {
    errors.is_public = 'is_public must be a boolean.';
    valid = false;
  }

  return { valid, errors };
};

const validateUpdateTrip = (data) => {
  const errors = {};
  let valid = true;

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.length > 150) {
      errors.name = 'Name must be between 1 and 150 characters if provided.';
      valid = false;
    }
  }

  if (data.start_date !== undefined && !isValidDate(data.start_date)) {
    errors.start_date = 'Start date must be a valid ISO date (YYYY-MM-DD).';
    valid = false;
  }

  if (data.end_date !== undefined && !isValidDate(data.end_date)) {
    errors.end_date = 'End date must be a valid ISO date (YYYY-MM-DD).';
    valid = false;
  }

  if (data.start_date && data.end_date && isValidDate(data.start_date) && isValidDate(data.end_date)) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      errors.end_date = 'End date cannot be before start date.';
      valid = false;
    }
  }

  if (data.is_public !== undefined && typeof data.is_public !== 'boolean') {
    errors.is_public = 'is_public must be a boolean.';
    valid = false;
  }

  return { valid, errors };
};

module.exports = {
  validateCreateTrip,
  validateUpdateTrip
};
