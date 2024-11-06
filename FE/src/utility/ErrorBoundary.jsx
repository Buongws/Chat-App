import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";

const ErrorBoundaries = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
);

export default ErrorBoundaries;
