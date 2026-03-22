import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import io from 'socket.io-client'
import {
  API_BASE,
  setToken,
  login,
  me,
  fetchTimeline,
  fetchTasks,
  fetchCommits,
  fetchAgents,
  fetchRoadcoinWallet,
  fetchContradictions,
  getNotes,
  setNotes as saveNotes,
  action,
} from './api'
import config from './config.js'
import Guardian from './Guardian.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ApiHealthDashboard from './pages/ApiHealthDashboard.jsx'
import You from './components/You.jsx'
import Claude from './components/Claude.jsx'
import Codex from './components/Codex.jsx'
import Roadbook from './components/Roadbook.jsx'
import Subscribe from './Subscribe.jsx'
import Orchestrator from './Orchestrator.jsx'
import Manifesto from './components/Manifesto.jsx'
import AutoHeal from './pages/AutoHeal.jsx'
import RoadView from './pages/RoadView.jsx'
import Git from './pages/Git.jsx'
import SecuritySpotlights from './pages/SecuritySpotlights.jsx'
import GitPage from './pages/GitPage.jsx'
import ControlPanel from './pages/ControlPanel.jsx'
import PeriodicTableOfEquations from './pages/PeriodicTableOfEquations.jsx'
import EquationsLab from './pages/EquationsLab.jsx'
import Resilience from './pages/Resilience.jsx'
import AgentLineage from './pages/AgentLineage.jsx'
import WebEngine from './pages/WebEngine.jsx'
import DesktopOS from './pages/DesktopOS.jsx'
import MusicApp from './pages/MusicApp.jsx'
import MusicStudio from './pages/MusicStudio.jsx'
import SimplifiedOS from './pages/SimplifiedOS.jsx'
import RoadChain from './pages/RoadChain.jsx'
import Homework from './pages/Homework.jsx'
import Novelty from './pages/Novelty.jsx'
import Nexus from './pages/Nexus.jsx'
import LucidiaDemo from './pages/LucidiaDemo.jsx'
import Marketplace from './pages/Marketplace.jsx'
import MarketplaceDetail from './pages/MarketplaceDetail.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import MyPurchases from './pages/MyPurchases.jsx'
import MarketplaceAdmin from './pages/MarketplaceAdmin.jsx'
import Login from './components/Login.jsx'
import RoadCoin from './components/RoadCoin.jsx'
import { Activity, User, LayoutGrid, HeartPulse, Shield, ShieldCheck, Cpu, Brain, FunctionSquare, Wallet, Rocket, BookOpen, GraduationCap, Sparkles, Music3, GitCommit, Settings, Atom, Stethoscope, Store } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', to: '/dashboard', text: 'Dashboard', icon: <Activity size={18} />, match: path => path === '/' || path === '/dashboard' },
  { key: 'you', to: '/you', text: 'You', icon: <User size={18} /> },
  { key: 'roadview', to: '/roadview', text: 'RoadView', icon: <LayoutGrid size={18} /> },
  { key: 'web-engine', to: '/web-engine', text: 'Web Engine', icon: <LayoutGrid size={18} /> },
  { key: 'simplified-os', to: '/simplified-os', text: 'Simplified OS', icon: <Cpu size={18} /> },
  { key: 'desktop-os', to: '/desktop-os', text: 'Desktop OS', icon: <Cpu size={18} /> },
  { key: 'autoheal', to: '/autoheal', text: 'Auto-Heal', icon: <HeartPulse size={18} /> },
  { key: 'api-health', to: '/api-health', text: 'API Health', icon: <Stethoscope size={18} /> },
  { key: 'security', to: '/security', text: 'Security Spotlights', icon: <Shield size={18} /> },
  { key: 'guardian', to: '/guardian', text: 'Guardian', icon: <ShieldCheck size={18} /> },
  { key: 'claude', to: '/claude', text: 'Claude', icon: <Cpu size={18} /> },
  { key: 'codex', to: '/codex', text: 'Codex', icon: <Cpu size={18} /> },
  { key: 'agents', to: '/agents', text: 'Agent Lineage', icon: <Brain size={18} /> },
  { key: 'equations', to: '/equations', text: 'Equations', icon: <FunctionSquare size={18} /> },
  { key: 'equations-lab', to: '/equations-lab', text: 'Equations Lab', icon: <FunctionSquare size={18} /> },
  { key: 'lucidia', to: '/lucidia', text: 'Lucidia QLM', icon: <Atom size={18} /> },
  { key: 'roadcoin', to: '/roadcoin', text: 'RoadCoin', icon: <Wallet size={18} /> },
  { key: 'orchestrator', to: '/orchestrator', text: 'Orchestrator', icon: <Rocket size={18} /> },
  { key: 'roadbook', to: '/roadbook', text: 'Roadbook', icon: <BookOpen size={18} /> },
  { key: 'manifesto', to: '/manifesto', text: 'Manifesto', icon: <BookOpen size={18} /> },
  { key: 'homework', to: '/homework', text: 'Homework', icon: <GraduationCap size={18} /> },
  { key: 'resilience', to: '/resilience', text: 'Resilience', icon: <Shield size={18} /> },
  { key: 'git', to: '/git', text: 'Git', icon: <GitCommit size={18} /> },
  { key: 'git-console', to: '/git-console', text: 'Git Console', icon: <GitCommit size={18} /> },
  { key: 'control', to: '/control', text: 'Control Panel', icon: <Settings size={18} /> },
  { key: 'roadchain', to: '/roadchain', text: 'RoadChain', icon: <LayoutGrid size={18} /> },
  { key: 'marketplace', to: '/marketplace', text: 'Marketplace', icon: <Store size={18} /> },
  { key: 'music', to: '/music', text: 'Music Studio', icon: <Music3 size={18} /> },
  { key: 'sonic', to: '/sonic', text: 'BlackRoad Sonic', icon: <Music3 size={18} /> },
  { key: 'novelty', to: '/novelty', text: 'Novelty Dashboard', icon: <Sparkles size={18} /> },
  { key: 'subscribe', to: '/subscribe', text: 'Subscribe', icon: <Rocket size={18} /> },
  { key: 'nexus', to: '/nexus', text: 'Nexus Console', icon: <LayoutGrid size={18} /> },
]

export default function App(){
  const location = useLocation()
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('timeline')
  const [timeline, setTimeline] = useState([])
  const [tasks, setTasks] = useState([])
  const [commits, setCommits] = useState([])
  const [agents, setAgents] = useState([])
  const [wallet, setWallet] = useState({ rc: 0 })
  const [contradictions, setContradictions] = useState({ issues: 0 })
  const [system, setSystem] = useState({ cpu: 0, mem: 0, gpu: 0, net: 0 })
  const [notes, setNotesState] = useState('')
  const [stream, setStream] = useState(true)
  const socketRef = useRef(null)
  const streamRef = useRef(stream)

  useEffect(() => { streamRef.current = stream }, [stream])

  const resetState = useCallback(() => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    setTimeline([])
    setTasks([])
    setCommits([])
    setAgents([])
    setWallet({ rc: 0 })
    setContradictions({ issues: 0 })
    setSystem({ cpu: 0, mem: 0, gpu: 0, net: 0 })
    setNotesState('')
    setStream(true)
    streamRef.current = true
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const bootData = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchTimeline(),
      fetchTasks(),
      fetchCommits(),
      fetchAgents(),
      fetchRoadcoinWallet(),
      fetchContradictions(),
      getNotes(),
    ])

    const [tl, ts, cs, ag, w, c, n] = results
    setTimeline(tl.status === 'fulfilled' ? tl.value ?? [] : [])
    setTasks(ts.status === 'fulfilled' ? ts.value ?? [] : [])
    setCommits(cs.status === 'fulfilled' ? cs.value ?? [] : [])
    setAgents(ag.status === 'fulfilled' ? ag.value ?? [] : [])
    if (w.status === 'fulfilled' && w.value) {
      const balance = typeof w.value.balance === 'number' ? w.value.balance : typeof w.value.rc === 'number' ? w.value.rc : 0
      setWallet({ rc: balance })
    } else {
      setWallet({ rc: 0 })
    }
    setContradictions(c.status === 'fulfilled' ? c.value ?? { issues: 0 } : { issues: 0 })
    setNotesState(n.status === 'fulfilled' ? n.value ?? '' : '')
  }, [])

  const connectSocket = useCallback(() => {
    socketRef.current?.disconnect()
    const target = config.agentsApiUrl || config.coreApiUrl || undefined
    const socket = io(target, { transports: ['websocket'], withCredentials: true })
    socketRef.current = socket

    socket.on('system:update', payload => {
      if (!payload || !streamRef.current) return
      setSystem({
        cpu: payload.cpu ?? 0,
        mem: payload.mem ?? 0,
        gpu: payload.gpu ?? 0,
        net: payload.net ?? 0,
      })
    })

    socket.on('timeline:new', message => {
      if (message?.item) {
        setTimeline(prev => [message.item, ...prev])
      }
    })

    socket.on('wallet:update', payload => {
      if (typeof payload?.balance === 'number') {
        setWallet({ rc: payload.balance })
      } else if (typeof payload?.rc === 'number') {
        setWallet({ rc: payload.rc })
      }
    })

    socket.on('notes:update', value => setNotesState(value || ''))
    socket.on('agents:update', list => Array.isArray(list) && setAgents(list))

    return socket
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      resetState()
      setAuthChecked(true)
      return
    }
    setToken(token)
    ;(async () => {
      try {
        const currentUser = await me()
        setUser(currentUser)
        await bootData()
        connectSocket()
      } catch (err) {
        console.error('Failed to restore session', err)
        resetState()
      } finally {
        setAuthChecked(true)
      }
    })()
  }, [bootData, connectSocket, resetState])

  useEffect(() => () => { socketRef.current?.disconnect() }, [])

  const handleLogin = useCallback(async (username, password) => {
    const { token, user: nextUser } = await login(username, password)
    localStorage.setItem('token', token)
    setToken(token)
    setUser(nextUser)
    await bootData()
    connectSocket()
  }, [bootData, connectSocket])

  const handleAction = useCallback(async (name) => {
    try {
      await action(name)
    } catch (err) {
      console.error('Action failed', err)
    }
  }, [])

  const handleNotesChange = useCallback(async (value) => {
    setNotesState(value)
    try {
      await saveNotes(value)
    } catch (err) {
      console.error('Failed to save notes', err)
    }
  }, [])

  const handleWalletUpdate = useCallback((data) => {
    if (!data) return
    const balance = typeof data.balance === 'number' ? data.balance : typeof data.rc === 'number' ? data.rc : wallet.rc
    setWallet({ rc: balance })
  }, [wallet.rc])

  const currentPath = location.pathname

  const sidebar = useMemo(() => (
    <nav className="space-y-1">
      {NAV_ITEMS.map(item => (
        <NavItem
          key={item.key}
          icon={item.icon}
          text={item.text}
          to={item.to}
          href={item.href}
          currentPath={currentPath}
          match={item.match}
        />
      ))}
    </nav>
  ), [currentPath])

  if (location.pathname === '/subscribe') {
    return <Subscribe />
  }

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-950" />
  }

  const socket = socketRef.current

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {!user && <Login onLogin={handleLogin} />}
      {user && (
        <>
          <aside className="w-64 p-4 space-y-6 border-r border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-500" />
              BlackRoad.io
            </div>
            {sidebar}

            <nav className="space-y-1">
              <NavItem icon={<Activity size={18} />} text="Dashboard" href="/dashboard" />
              <NavItem icon={<User size={18} />} text="You" href="/you" />
              <NavItem icon={<LayoutGrid size={18} />} text="Workspace" href="/" />
              <NavItem icon={<SquareDashedMousePointer size={18} />} text="Projects" />
              <NavItem icon={<Brain size={18} />} text="Agents" />
              <NavItem icon={<Database size={18} />} text="Datasets" />
              <NavItem icon={<ShieldCheck size={18} />} text="Models" />
              <NavItem icon={<Settings size={18} />} text="Integrations" />
              <NavItem icon={<Cpu size={18} />} text="Claude" href="/claude" />
              <NavItem icon={<Cpu size={18} />} text="Codex" href="/codex" />
              <NavItem icon={<Wallet size={18} />} text="RoadCoin" href="/roadcoin" />
              <NavItem icon={<Rocket size={18} />} text="Subscribe" href="/subscribe" />
              <NavItem icon={<BookOpen size={18} />} text="Roadbook" to="/roadbook" />
              <NavItem to="/" icon={<Activity size={18} />} text="Chat" />
              <NavItem to="/projects" icon={<SquareDashedMousePointer size={18} />} text="Projects" />
              <NavItem to="/agents" icon={<Brain size={18} />} text="Agents" />
              <NavItem to="/datasets" icon={<Database size={18} />} text="Datasets" />
              <NavItem to="/models" icon={<ShieldCheck size={18} />} text="Models" />
              <NavItem to="/integrations" icon={<Settings size={18} />} text="Integrations" />
              <NavItem to="/git" icon={<GitCommit size={18} />} text="Git" />
              <NavItem to="/roadview" icon={<LayoutGrid size={18} />} text="RoadView" />
              <NavItem to="/autoheal" icon={<HeartPulse size={18} />} text="Auto-Heal" />
              <NavItem to="/novelty" icon={<Sparkles size={18} />} text="Novelty Dashboard" />
              <NavItem icon={<Rocket size={18} />} text="Orchestrator" to="/orchestrator" />
              <NavItem icon={<Rocket size={18} />} text="Manifesto" href="/manifesto" />
            </nav>
          </aside>

          <main className="flex-1 px-6 py-4 grid grid-cols-12 gap-6 items-start">
            <Routes>
              <Route path="/" element={<Dashboard tab={tab} setTab={setTab} timeline={timeline} tasks={tasks} commits={commits} onAction={handleAction} stream={stream} setStream={setStream} system={system} wallet={wallet} contradictions={contradictions} notes={notes} setNotes={handleNotesChange} />} />
              <Route path="/dashboard" element={<Dashboard tab={tab} setTab={setTab} timeline={timeline} tasks={tasks} commits={commits} onAction={handleAction} stream={stream} setStream={setStream} system={system} wallet={wallet} contradictions={contradictions} notes={notes} setNotes={handleNotesChange} />} />
              <Route path="/you" element={<Section><You /></Section>} />
              <Route path="/roadview" element={<Section><RoadView /></Section>} />
              <Route path="/web-engine" element={<Section><WebEngine /></Section>} />
              <Route path="/simplified-os" element={<Section><SimplifiedOS /></Section>} />
              <Route path="/desktop-os" element={<Section><DesktopOS /></Section>} />
              <Route path="/autoheal" element={<Section><AutoHeal /></Section>} />
              <Route path="/api-health" element={<Section><ApiHealthDashboard /></Section>} />
              <Route path="/security" element={<Section><SecuritySpotlights /></Section>} />
              <Route path="/guardian" element={<Section><Guardian /></Section>} />
              <Route path="/agents" element={<Section><AgentLineage /></Section>} />
              <Route path="/claude" element={<Section><Claude socket={socket} /></Section>} />
              <Route path="/codex" element={<Section><Codex socket={socket} /></Section>} />
              <Route path="/equations" element={<Section><PeriodicTableOfEquations /></Section>} />
              <Route path="/equations-lab" element={<Section><EquationsLab /></Section>} />
              <Route path="/lucidia" element={<Section><LucidiaDemo /></Section>} />
              <Route path="/roadcoin" element={<Section><RoadCoin onUpdate={handleWalletUpdate} /></Section>} />
              <Route path="/orchestrator" element={<Section><Orchestrator socket={socket} /></Section>} />
              <Route path="/roadbook" element={<Section><Roadbook /></Section>} />
              <Route path="/manifesto" element={<Section><Manifesto /></Section>} />
              <Route path="/homework" element={<Section><Homework /></Section>} />
              <Route path="/resilience" element={<Section><Resilience /></Section>} />
              <Route path="/git" element={<Section><Git /></Section>} />
              <Route path="/git-console" element={<Section><GitPage /></Section>} />
              <Route path="/control" element={<Section><ControlPanel /></Section>} />
              <Route path="/roadchain" element={<Section><RoadChain /></Section>} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/listing/:id" element={<MarketplaceDetail />} />
              <Route path="/marketplace/dashboard" element={<SellerDashboard />} />
              <Route path="/marketplace/sell" element={<SellerDashboard />} />
              <Route path="/marketplace/purchases" element={<MyPurchases />} />
              <Route path="/marketplace/admin" element={<MarketplaceAdmin />} />
              <Route path="/music" element={<Section><MusicStudio /></Section>} />
              <Route path="/sonic" element={<Section><MusicApp /></Section>} />
              <Route path="/novelty" element={<Section><Novelty /></Section>} />
              <Route path="/nexus" element={<Section><Nexus /></Section>} />
              <Route path="*" element={<Dashboard tab={tab} setTab={setTab} timeline={timeline} tasks={tasks} commits={commits} onAction={handleAction} stream={stream} setStream={setStream} system={system} wallet={wallet} contradictions={contradictions} notes={notes} setNotes={handleNotesChange} />} />
              <Route path="/" element={<Dashboard tab={tab} setTab={setTab} timeline={timeline} tasks={tasks} commits={commits} onAction={onAction} stream={stream} setStream={setStream} system={system} wallet={wallet} contradictions={contradictions} notes={notes} setNotes={async (v)=>{ setNotesState(v); await setNotes(v); }} />} />
              <Route path="/roadview" element={<RoadView agents={agents} stream={stream} setStream={setStream} system={system} wallet={wallet} contradictions={contradictions} notes={notes} setNotes={async (v)=>{ setNotesState(v); await setNotes(v); }} />} />
              <Route path="/autoheal" element={<AutoHeal />} />
              <Route path="/git" element={<Git />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  )
}

function NavItem({ icon, text, to, href, currentPath, match }){
  const base = 'flex items-center gap-3 px-2 py-2 rounded-xl transition-colors'
  const isActive = match ? match(currentPath) : to ? currentPath === to : false
  const className = `${base} ${isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-900/60'}`

  if (href) {
    return (
      <a href={href} className={className}>
        {icon}
        <span>{text}</span>
      </a>
    )
  }

  return (
    <NavLink to={to} className={className}>
      {icon}
      <span>{text}</span>
    </NavLink>
  )
}

function Section({ children }){
  return <section className="col-span-12 lg:col-span-8 space-y-4">{children}</section>
}
