import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'
import PixelBlast from "../components/PixelBlast"

export const Route = createFileRoute('/')({ component: App })

function App() {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Portfolio',
      description:
        'Check out my portfolio to see my work.',
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
      title: 'Blog',
      description:
        'Check out my blog to see my work.',
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: 'Contact',
      description:
        'Contact me for any questions or to work together.',
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: 'Apps',
      description:
        'Check out my apps to see my work.',
    }

  ]

  return (
    <div className="min-h-screen bg-black">
      <div style={{ width: '100%', height: '600px', position: 'absolute' }}>
        <PixelBlast
          color='gray'
          autoPauseOffscreen
          patternDensity={2}
          speed={5}
          antialias
        />
      </div>
      
      <section className="relative py-36 px-6 text-center overflow-hidden">
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-6 mb-6">
            {/* <img
              src="https://github.com/kreindo.png"
              alt="TanStack Logo"
              className="size-32 border-4 border-cyan-500 rounded-full"
            /> */}
            <h1 className="font-bbh text-6xl md:text-7xl font-black text-white">
              <span className="text-gray-300">Welcome to my little corner in the internet</span>
            </h1>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              Contact me
            </div>
            </div>
            
            <div>
            <p className="text-gray-400 text-sm mt-2">
              Let's build something amazing together!
            </p>
          </div>
        </div>
      </section>


      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              to={"/app/add/santri-report"}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
