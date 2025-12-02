// Lightweight auth/role helpers used across the app

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getStoredRole() {
  return localStorage.getItem("role");
}

export function setStoredRole(role) {
  if (role) {
    localStorage.setItem("role", role);
  }
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
}

// Attempt to decode JWT to extract role if backend doesn't send it separately
export function extractRoleFromToken(accessToken) {
  try {
    if (!accessToken || accessToken.split(".").length < 2) return null;
    const base64Payload = accessToken.split(".")[1];
    const decoded = JSON.parse(atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/")));
    // common claim keys for roles
    return (
      decoded?.role || decoded?.roles?.[0] || decoded?.authorities?.[0] || null
    );
  } catch (_) {
    return null;
  }
}

export function resolveAndStoreRoleFromLoginResponse(resData) {
  // Try common locations for role in API responses
  const direct = resData?.data?.user?.role || resData?.data?.role || resData?.role;
  if (direct) {
    setStoredRole(direct);
    return direct;
  }
  const token = resData?.data?.accessToken || resData?.accessToken;
  const fromToken = extractRoleFromToken(token);
  if (fromToken) setStoredRole(fromToken);
  return fromToken;
}

export function hasRequiredRole(required) {
  const role = getStoredRole();
  if (!required) return true;
  if (Array.isArray(required)) return required.includes(role);
  return role === required;
}


