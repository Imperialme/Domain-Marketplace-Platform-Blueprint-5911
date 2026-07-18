// Client-side input validation and sanitization.
//
// IMPORTANT: this is defense-in-depth for UX and to reduce abuse. It is NOT a
// security boundary. Every value must be validated and sanitized AGAIN on the
// server before it is trusted, stored, or rendered to other users.

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());

// Remove angle brackets and control characters, trim, and cap length. React already
// escapes on render; this keeps stored data clean and bounds its size.
export const sanitizeText = (value, maxLength = 1000) =>
  Array.from(String(value ?? ''))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 32 || code === 127) return false; // control characters
      return ch !== '<' && ch !== '>';
    })
    .join('')
    .trim()
    .slice(0, maxLength);

// Require a reasonably strong password: 8+ chars with mixed case and a digit.
export const isStrongPassword = (pw) =>
  typeof pw === 'string' &&
  pw.length >= 8 &&
  /[a-z]/.test(pw) &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw);

export const PASSWORD_REQUIREMENTS =
  'Password must be at least 8 characters and include upper- and lower-case letters and a number.';
