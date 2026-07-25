/**
 * Semantic colour tone for badges, chips and status pills. Maps to the `data-tone` attribute the
 * badge styles key off, which in turn pulls the matching `--success` / `--warning` / … token pair.
 *
 * Lives in `shared` because more than one feature classifies statuses this way (organization,
 * admin, member).
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple';
