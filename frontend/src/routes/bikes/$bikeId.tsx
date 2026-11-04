import { createFileRoute } from "@tanstack/react-router";

// Placeholder so links to /bikes/$bikeId type-check; the details page comes next
export const Route = createFileRoute("/bikes/$bikeId")({
  component: () => null,
});
