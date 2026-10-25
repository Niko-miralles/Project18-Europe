import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import App from './App.jsx'
import Community from './pages/Community.jsx'
import Barcelona from './pages/Barcelona.jsx'
import About from './pages/About.jsx'
import Ambassadors from './pages/Ambassadors.jsx'
import Sponsors from './pages/Sponsors.jsx'
import Admin from './pages/Admin.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import { trackPage } from './track.js'

const INTRO_WIDTH = 240
const INTRO_STROKE_PX = 2.2
const DRAW_MS = 1900
const SETTLE_MS = 1100

const normalize = path => path.replace(/\/+$/, '') || '/'

const Root = () => {
  const [path, setPath] = useState(() => normalize(window.location.pathname))
  const [entered, setEntered] = useState(false)
  const [intro] = useState(
    () =>
      normalize(window.location.pathname) === '/' &&
      !new URLSearchParams(window.location.search).has('apply') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [revealed, setRevealed] = useState(!intro)
  const [applying, setApplying] = useState(false)
  const [applyFocus, setApplyFocus] = useState(0)
  const markRef = useRef(null)

  useEffect(() => {
    const onPop = () => {
      setEntered(true)
      setPath(normalize(window.location.pathname))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    trackPage(path)
  }, [path])

  useEffect(() => {
    const onClick = e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.target.closest?.('a[data-spa]')) e.preventDefault()
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [])

  useLayoutEffect(() => {
    const mark = markRef.current
    if (!intro || !mark) return undefined
    const root = document.documentElement
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    root.classList.add('is-intro-locked')
    const rect = mark.getBoundingClientRect()
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2)
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2)
    const scale = Math.min(INTRO_WIDTH, window.innerWidth * 0.56) / rect.width
    const start = `translate(${dx}px, ${dy}px) scale(${scale})`
    const endStroke = getComputedStyle(mark).strokeWidth
    const startStroke = `${(INTRO_STROKE_PX * 460) / (rect.width * scale)}px`
    mark.style.transform = start
    mark.style.strokeWidth = startStroke

    let settle
    const timer = setTimeout(() => {
      settle = mark.animate(
        [
          { transform: start, strokeWidth: startStroke },
          { transform: 'none', strokeWidth: endStroke }
        ],
        { duration: SETTLE_MS, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' }
      )
      mark.style.transform = ''
      mark.style.strokeWidth = ''
      setRevealed(true)
    }, DRAW_MS)
    const unlock = setTimeout(() => root.classList.remove('is-intro-locked'), DRAW_MS + SETTLE_MS)

    return () => {
      clearTimeout(timer)
      clearTimeout(unlock)
      root.classList.remove('is-intro-locked')
      settle?.cancel()
      mark.style.transform = ''
      mark.style.strokeWidth = ''
    }
  }, [intro])

  const navigate = to => {
    if (normalize(to) === path) return
    window.history.pushState(null, '', to)
    window.scrollTo(0, 0)
    setApplyFocus(0)
    setEntered(true)
    setPath(normalize(to))
  }

  const onApply = () => {
    navigate('/')
    setApplyFocus(n => n + 1)
  }

  if (path === '/admin') return <Admin />

  const playIntro = intro && !entered

  let page
  if (path === '/community') page = <Community onApply={onApply} />
  else if (path === '/barcelona-2027') page = <Barcelona onApply={onApply} />
  else if (path === '/ambassadors') page = <Ambassadors />
  else if (path === '/sponsors') page = <Sponsors />
  else if (path === '/about') page = <About navigate={navigate} />
  else
    page = (
      <App
        navigate={navigate}
        intro={playIntro}
        revealed={revealed}
        applyFocus={applyFocus}
        onApplying={setApplying}
      />
    )

  return (
    <>
      {!(path === '/' && applying) && (
        <SiteHeader
          markRef={markRef}
          path={path}
          className={[playIntro && 'is-intro', playIntro && revealed && 'is-revealed'].filter(Boolean).join(' ')}
          animated={playIntro}
          onNavigate={navigate}
          onApply={onApply}
        />
      )}
      {page}
    </>
  )
}

export default Root
