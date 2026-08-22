const validateSignup = (data) => {
  const errors = {};
  let valid = true;

  if (!data.first_name || typeof data.first_name !== 'string' || data.first_name.trim().length === 0) {
    errors.first_name = 'First name is required.';
    valid = false;
  }

  if (!data.last_name || typeof data.last_name !== 'string' || data.last_name.trim().length === 0) {
    errors.last_name = 'Last name is required.';
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'A valid email address is required.';
    valid = false;
  }

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
    valid = false;
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
    valid = false;
  }

  if (data.phone && typeof data.phone === 'string' && data.phone.trim().length > 0) {
    const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = 'Please provide a valid phone number format.';
      valid = false;
    }
  }

  return { valid, errors };
};

const validateLogin = (data) => {
  const errors = {};
  let valid = true;

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
    errors.username = 'Username is required.';
    valid = false;
  }

  if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
    errors.password = 'Password is required.';
    valid = false;
  }

  return { valid, errors };
};

module.exports = {
  validateSignup,
  validateLogin
};
