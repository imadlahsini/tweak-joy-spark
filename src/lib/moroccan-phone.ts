export const normalizeMoroccanPhone = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  let normalized = digitsOnly;

  if (normalized.startsWith("00212")) {
    normalized = normalized.slice(5);
  } else if (normalized.startsWith("212")) {
    normalized = normalized.slice(3);
  }

  if ((normalized.startsWith("6") || normalized.startsWith("7")) && normalized.length <= 9) {
    normalized = `0${normalized}`;
  }

  if (normalized.startsWith("00") && (normalized[2] === "6" || normalized[2] === "7")) {
    normalized = normalized.slice(1);
  }

  return normalized.slice(0, 10);
};

export const formatMoroccanPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
};

export const formatMoroccanPhoneDisplay = (value: string) => {
  const normalized = normalizeMoroccanPhone(value);
  return formatMoroccanPhone(normalized);
};

export const isValidMoroccanPhone = (value: string) =>
  /^0[67]\d{8}$/.test(normalizeMoroccanPhone(value));
