export const isAdminSubdomain = (): boolean => {
  const hostname = window.location.hostname;
  
  // Production: only detect admin.* subdomain
  if (hostname.startsWith('admin.')) return true;
  
  // Development only: allow localStorage flag for local testing
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isLocal && localStorage.getItem('ruraliza_force_admin') === 'true') return true;

  return false;
};
