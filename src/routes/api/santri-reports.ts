import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/santri-reports')({
  server: {
    handlers: {
      /** Returns the placeholder JSON array `["value"]`. */
      GET: () => json(['value']),
    },
  },
})