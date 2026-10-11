import { useEffect, useState } from 'react'
import App from './App.jsx'
import Community from './pages/Community.jsx'
import Barcelona from './pages/Barcelona.jsx'
import About from './pages/About.jsx'
import Admin from './pages/Admin.jsx'

const normalize = path => path.replace(/\/+$/, '') || '/'

const Root = () => {
  const [path, setPath] = useState(() => normalize(window.location.pathname))
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const onPop = () => {
      setEntered(true)
      setPath(normalize(window.location.pathname))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = to => {
    window.history.pushState(null, '', to)
    window.scrollTo(0, 0)
    setEntered(true)
    setPath(normalize(to))
  }

  if (path === '/admin') return <Admin />

  let page
  if (path === '/community') page = <Community navigate={navigate} />
  else if (path === '/barcelona-2027') page = <Barcelona navigate={navigate} />
  else if (path === '/about') page = <About navigate={navigate} />
  else page = <App navigate={navigate} entered={entered} />

  return (
    <>
      {page}
      <a className="site-contact" href="mailto:partnerships@project18.eu">
        partnerships@project18.eu
      </a>
    </>
  )
}

export default Root
