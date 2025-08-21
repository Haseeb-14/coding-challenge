export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): boolean => {
    return password.length >= 6;
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  },

  time: (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },
};

export const getValidationError = (field: string, value: any, rules: any): string | null => {
  if (rules.required && !validation.required(value)) {
    return `${field} is required`;
  }

  if (rules.email && !validation.email(value)) {
    return `${field} must be a valid email address`;
  }

  if (rules.password && !validation.password(value)) {
    return `${field} must be at least 6 characters long`;
  }

  if (rules.minLength && !validation.minLength(value, rules.minLength)) {
    return `${field} must be at least ${rules.minLength} characters long`;
  }

  if (rules.maxLength && !validation.maxLength(value, rules.maxLength)) {
    return `${field} must be no more than ${rules.maxLength} characters long`;
  }

  if (rules.phone && !validation.phone(value)) {
    return `${field} must be a valid phone number`;
  }

  if (rules.date && !validation.date(value)) {
    return `${field} must be a valid date`;
  }

  if (rules.time && !validation.time(value)) {
    return `${field} must be a valid time`;
  }

  return null;
};
