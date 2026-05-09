export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[6-9]\d{9}$/;
export const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const imageRules = {
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSize: 2 * 1024 * 1024
};

export const isBlank = (value) => String(value ?? "").trim().length === 0;

export const isPositiveNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
};

export const isNonNegativeInteger = (value) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0;
};

export const validateImageFile = (file) => {
  if (!file) return "";
  if (!imageRules.allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, or WEBP images are allowed";
  }
  if (file.size > imageRules.maxSize) {
    return "Image must be 2 MB or smaller";
  }
  return "";
};

export const digitsOnly = (value, maxLength = 10) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxLength);

export const decimalOnly = (value) => {
  const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : whole;
};
