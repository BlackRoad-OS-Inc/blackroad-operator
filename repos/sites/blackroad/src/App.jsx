import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Backroad from './pages/Backroad.jsx'
import Chat from './pages/Chat.jsx'
import RoadView from './pages/RoadView.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Chat' },
  { to: '/roadview', label: 'RoadView' },
  { to: '/backroad', label: 'Backroad' },
]

function Home() {
  return (
    <section className='card space-y-4'>
      <p className='text-xs uppercase tracking-[0.3em] text-neutral-400'>BlackRoad.io</p>
      <h1 className='text-4xl font-semibold text-white'>The BlackRoad portal is back on the Vite path.</h1>
      <p className='max-w-2xl text-neutral-300'>
        This workspace contains several overlapping frontend generations. This shell restores the
        intended `sites/blackroad` Vite entrypoint so local install, dev, and build can work again.
      </p>
      <div className='flex flex-wrap gap-3'>
        <NavLink className='btn-primary' to='/chat'>
          Open Chat
        </NavLink>
        <NavLink className='btn' to='/roadview'>
          Explore RoadView
        </NavLink>
        <a className='btn' href='/docs/index.json'>
          Docs Index
        </a>
      </div>
    </section>
  )
}

function ShellLayout() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <header className='border-b border-neutral-800 bg-black/80 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4'>
          <div>
            <p className='text-lg font-semibold'>BlackRoad</p>
            <p className='text-sm text-neutral-400'>Static Vite site for local portal work</p>
          </div>
          <nav className='flex flex-wrap gap-2'>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-200 hover:bg-neutral-800',
                  ].join(' ')
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-6 py-10'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/roadview' element={<RoadView />} />
          <Route path='/backroad' element={<Backroad />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <ShellLayout />
}
