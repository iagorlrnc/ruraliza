export const maskPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters
  const clean = value.replace(/\D/g, '');
  
  if (clean.length === 0) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
};

export const maskCreci = (value: string): string => {
  if (!value) return '';
  
  // Replace anything that is not alphanumeric
  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Extract up to 6 digits at the beginning
  const digitsMatch = clean.match(/^\d+/);
  const digits = digitsMatch ? digitsMatch[0].slice(0, 6) : '';
  
  // Extract the first letter following the digits
  const letterMatch = clean.slice(digits.length).match(/[A-Z]/);
  const letter = letterMatch ? letterMatch[0] : '';
  
  if (digits && letter) {
    return `${digits}-${letter}`;
  }
  return digits;
};
