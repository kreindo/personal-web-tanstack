import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import CardNav from '../components/CardNav'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import ConvexProvider from '../integrations/convex/provider'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          {/* <Header /> */}
          {/* <CardNav logo='test' baseColor='#c9db00' items={[
            {
              label: 'About',
              bgColor: 'bg-cyan-500',
              textColor: 'text-white',
              links: [
                {
                  label: 'Company',
                  ariaLabel: 'Company',
                  href: '/about/company',
                },
                {
                  label: 'Career',
                  ariaLabel: 'Career',
                  href: '/about/career',
                },
              ],
            },
            {
              label: 'Projects',
              bgColor: '#008030',
              textColor: 'white',
              links: [
                {
                  label: 'Portfolio',
                  ariaLabel: 'Portfolio',
                  href: '/projects/portfolio',
                },
                {
                  label: 'Blog',
                  ariaLabel: 'Blog',
                  href: '/projects/blog',
                },
              ],
            }
          ]}/> */}
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
