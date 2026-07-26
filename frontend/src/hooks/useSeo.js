import { useEffect } from 'react'

export function useSeo({ title, description, image, url } = {}) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    const setMeta = (selector, attr, value) => {
      if (!value) return
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (selector.includes('property=')) {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)[1])
        } else {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)[1])
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:image"]', 'content', image)
    setMeta('meta[property="og:url"]', 'content', url || window.location.href)
    setMeta('meta[property="og:type"]', 'content', 'article')
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')

    return () => {
      document.title = prevTitle
    }
  }, [title, description, image, url])
}
