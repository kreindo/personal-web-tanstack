import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/santri-reports')({
  server: {
    handlers: {
      GET: () => json(['value']),
    },
  },
})