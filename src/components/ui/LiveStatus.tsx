import type { ReactNode } from "react";

import classes from "./LiveStatus.module.scss";

/** Keep mounted so changes to its text can be announced without moving focus. */
const LiveStatus = ({ children }: { children?: ReactNode }) => (
  <span
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className={classes.status}
  >
    {children}
  </span>
);

export default LiveStatus;
