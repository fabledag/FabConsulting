/**
 * First-name-style label for a logged-in user: their saved profile name if
 * set, otherwise a guess derived from the local part of their email
 * (e.g. "geo.distor@gmail.com" -> "Geo").
 */
export function getDisplayName(user) {
  if (!user) return '';
  if (user.name && user.name.trim()) {
    return user.name.trim().split(' ')[0];
  }
  if (user.email) {
    const local = user.email.split('@')[0];
    const first = local.split(/[.\-_+]/)[0];
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
  }
  return '';
}
