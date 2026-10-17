// Backwards-compat shim. The app no longer uses chronic-illness conditions,
// but other files still import from here. Re-export the student day schedule.

export { STUDENT_DAY as conditions, timeBucket } from './studentDay';
import { STUDENT_DAY as _c } from './studentDay';
export const conditions = _c;
export const defaultSchedule = _c;