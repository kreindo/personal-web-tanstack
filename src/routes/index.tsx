import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'
// import Dither from '../components/bits/Dither';


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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

      {/* <div style={{ width: '100%', height: '600px', position: 'relative' }}>

        <Dither

          waveColor={[0.1, 0.8, 0.1]}

          disableAnimation={false}

          enableMouseInteraction={true}

          mouseRadius={0.2}

          colorNum={4}

          waveAmplitude={0.3}

          waveFrequency={3}

          waveSpeed={0.01}

        />

      </div> */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-6 mb-6">
            <img
              src="https://github.com/kreindo.png"
              alt="TanStack Logo"
              className="size-32 border-4 border-cyan-500 rounded-full"
            />
            <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
              <span className="text-gray-300">Ahmad</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Dahsan
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Web developer from Makassar
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            I'm a web developer from Makassar, Indonesia. I'm here to help you
            build your next web application.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="#"
              // target="_blank"
              // rel="noopener noreferrer"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              onClick={(e) => {
                e.preventDefault()
                alert('wip')
              }}
            >
              Contact me
            </a>
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
