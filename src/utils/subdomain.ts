export const isAdminSubdomain = (): boolean => {
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  return hostname.startsWith('admin.') || searchParams.get('admin') === 'true';
};
