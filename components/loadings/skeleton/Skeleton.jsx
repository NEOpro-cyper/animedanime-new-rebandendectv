import clsx from "clsx";

/**
 * Base skeleton building block.
 * Renders a shimmering placeholder block (see `.skeleton` in globals.css).
 * Pure CSS animation — safe in both server and client components.
 */
const Skeleton = ({ className }) => (
  <div className={clsx("skeleton", className)} aria-hidden="true" />
);

export default Skeleton;
