import { SERVER_URL } from "api/axios";

export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  let normalized = String(path).replace(/\\/g, "/");
  const publicIndex = normalized.indexOf("/public/");
  const productsIndex = normalized.indexOf("/products/");
  const uploadsIndex = normalized.indexOf("/uploads/");

  if (publicIndex >= 0) {
    normalized = normalized.slice(publicIndex);
  } else if (productsIndex >= 0) {
    normalized = `/public${normalized.slice(productsIndex)}`;
  } else if (uploadsIndex >= 0) {
    normalized = `/public${normalized.slice(uploadsIndex)}`;
  }

  return `${SERVER_URL}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
};
