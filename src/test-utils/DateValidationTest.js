// Test file to validate date handling fixes
// This can be imported and run to test the date validation logic

import { format, isValid } from 'date-fns';

// Replicate the getDateString function with validation
const getDateString = (date) => {
  // Validate that date is a valid Date object
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to getDateString:', date);
    return null;
  }
  
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return null;
  }
};

// Test cases
export const runDateValidationTests = () => {
  console.log('=== Date Validation Tests ===');
  
  // Test 1: Valid date
  const validDate = new Date('2024-08-25');
  console.log('Valid date test:', getDateString(validDate)); // Should return '2024-08-25'
  
  // Test 2: Invalid date
  const invalidDate = new Date('invalid-date');
  console.log('Invalid date test:', getDateString(invalidDate)); // Should return null and log warning
  
  // Test 3: Null date
  console.log('Null date test:', getDateString(null)); // Should return null and log warning
  
  // Test 4: Undefined date
  console.log('Undefined date test:', getDateString(undefined)); // Should return null and log warning
  
  // Test 5: String (not Date object)
  console.log('String date test:', getDateString('2024-08-25')); // Should return null and log warning
  
  // Test 6: Number (not Date object)
  console.log('Number date test:', getDateString(1692921600000)); // Should return null and log warning
  
  console.log('=== End of Tests ===');
};

// Test helper for date validation
export const isValidDateForCalendar = (date) => {
  return date && date instanceof Date && !isNaN(date.getTime()) && isValid(date);
};

export default {
  runDateValidationTests,
  isValidDateForCalendar,
  getDateString
};