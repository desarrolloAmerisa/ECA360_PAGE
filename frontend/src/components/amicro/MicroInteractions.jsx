import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Share2, Sparkles, Star } from 'lucide-react'

const spring = { type: 'spring', stiffness: 500, damping: 28 }

/** Slide arrow — icono sale / entra al hover */
export function SlideArrowButton({
  children,
  icon: Icon = Share2,
  className = '',
  as: Comp = 'button',
  ...props
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="inline-flex"
    >
      <Comp
        className={`relative inline-flex items-center gap-0 overflow-hidden bg-brand px-5 py-3 text-sm font-semibold text-white ${className}`}
        {...props}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!hovered ? (
            <motion.span
              key="i1"
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={spring}
              className="mr-2.5 inline-flex"
            >
              <Icon size={16} />
            </motion.span>
          ) : null}
        </AnimatePresence>
        <motion.span layout transition={spring}>
          {children}
        </motion.span>
        <AnimatePresence mode="popLayout" initial={false}>
          {hovered ? (
            <motion.span
              key="i2"
              layout
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={spring}
              className="ml-2.5 inline-flex"
            >
              <ArrowRight size={16} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </Comp>
    </motion.div>
  )
}

/** Sparkle — partículas al hover */
export function SparkleButton({ children, icon: Icon = Sparkles, className = '', ...props }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center gap-2.5 bg-brand px-5 py-3 text-sm font-semibold text-white ${className}`}
      {...props}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {!hovered ? (
            <motion.span
              key="a"
              initial={{ y: -10, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.8 }}
              transition={spring}
              className="absolute"
            >
              <Icon size={16} />
            </motion.span>
          ) : (
            <motion.span
              key="b"
              initial={{ y: 10, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.8 }}
              transition={spring}
              className="absolute"
            >
              <Star size={16} fill="currentColor" />
              <motion.span
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="absolute -right-2 -top-2 text-[8px]"
              >
                ✦
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0, rotate: 45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.05 }}
                className="absolute -left-2 top-0 text-[8px]"
              >
                ✦
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {children}
    </motion.button>
  )
}

/** Morph — cambia icono/texto (ej. Copiar → Copiado) */
export function MorphButton({
  idleLabel,
  activeLabel,
  idleIcon: IdleIcon = Share2,
  activeIcon: ActiveIcon = Check,
  active = false,
  className = '',
  ...props
}) {
  const show = active
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center gap-2.5 border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white ${className}`}
      {...props}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {!show ? (
            <motion.span
              key="idle"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={spring}
              className="absolute"
            >
              <IdleIcon size={16} />
            </motion.span>
          ) : (
            <motion.span
              key="on"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={spring}
              className="absolute text-emerald-300"
            >
              <ActiveIcon size={16} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <motion.span layout>{show ? activeLabel : idleLabel}</motion.span>
    </motion.button>
  )
}

/** Pulse — icono late */
export function PulseButton({ children, icon: Icon, className = '', style, ...props }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white ${className}`}
      style={style}
      {...props}
    >
      {Icon ? (
        <motion.span
          animate={{ scale: hovered ? [1, 1.28, 1] : 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="inline-flex"
        >
          <Icon size={18} />
        </motion.span>
      ) : null}
      {children}
    </motion.button>
  )
}

/** Shake — vibra al hover */
export function ShakeButton({ children, icon: Icon, className = '', style, ...props }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white ${className}`}
      style={style}
      {...props}
    >
      {Icon ? (
        <motion.span
          animate={
            hovered
              ? { y: [0, -2, 0, -2, 0], rotate: [0, -12, 12, -10, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={{ duration: 0.4 }}
          className="inline-flex"
        >
          <Icon size={18} />
        </motion.span>
      ) : null}
      {children}
    </motion.button>
  )
}

/** Text reveal — el label se desliza a una segunda línea */
export function TextRevealButton({ children, icon: Icon, className = '', style, href, ...props }) {
  const [hovered, setHovered] = useState(false)
  const Comp = href ? motion.a : motion.button
  const extra = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { type: 'button' }
  return (
    <Comp
      {...extra}
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      style={style}
      className={`inline-flex items-center gap-2.5 overflow-hidden px-4 py-3 text-sm font-semibold text-white ${className}`}
    >
      {Icon ? (
        <motion.span
          animate={{ rotate: hovered ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="inline-flex"
        >
          <Icon size={18} />
        </motion.span>
      ) : null}
      <span className="relative h-5 overflow-hidden">
        <motion.span
          animate={{ y: hovered ? -20 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex flex-col"
        >
          <span className="h-5 leading-5">{children}</span>
          <span className="h-5 leading-5">{children}</span>
        </motion.span>
      </span>
    </Comp>
  )
}

/** Magnetic pull */
export function Magnetic({ children, className = '', strength = 0.28 }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        setCoords({
          x: (e.clientX - rect.left - rect.width / 2) * strength,
          y: (e.clientY - rect.top - rect.height / 2) * strength,
        })
      }}
      onMouseLeave={() => {
        setHovered(false)
        setCoords({ x: 0, y: 0 })
      }}
      animate={{ x: hovered ? coords.x : 0, y: hovered ? coords.y : 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18, mass: 0.4 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  )
}

/** Expand ring around control */
export function ExpandRingButton({ children, className = '', ...props }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      type="button"
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {children}
      <AnimatePresence>
        {hovered ? (
          <motion.span
            key="ring"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 border border-brand/50"
          />
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}

/** Focus-blur list (nav / social row) */
export function FocusBlurLinks({ items = [], className = '' }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div className={`flex flex-wrap items-center gap-5 ${className}`}>
      {items.map((item, index) => {
        const inactive = hovered !== null && hovered !== index
        const shared = {
          onMouseEnter: () => setHovered(index),
          onMouseLeave: () => setHovered(null),
          className: 'relative text-sm font-semibold outline-none transition-all duration-300',
          style: {
            filter: inactive ? 'blur(3px)' : 'none',
            opacity: inactive ? 0.35 : 1,
            color: hovered === index ? 'var(--color-brand)' : undefined,
          },
        }
        const body = (
          <>
            {item.label}
            <AnimatePresence>
              {hovered === index ? (
                <motion.span
                  key="br"
                  initial={{ opacity: 0, scale: 1.25 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="pointer-events-none absolute inset-0 -m-1 border border-dashed border-brand/40"
                />
              ) : null}
            </AnimatePresence>
          </>
        )
        if (item.to && !item.external) {
          return (
            <Link key={item.id || index} to={item.to} {...shared}>
              {body}
            </Link>
          )
        }
        if (item.to && item.external) {
          return (
            <a key={item.id || index} href={item.to} target="_blank" rel="noopener noreferrer" {...shared}>
              {body}
            </a>
          )
        }
        return (
          <button key={item.id || index} type="button" onClick={item.onClick} {...shared}>
            {body}
          </button>
        )
      })}
    </div>
  )
}

/** Keep glare only where it makes sense (rare) */
export function GlareCard({ children, className = '' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <motion.div
        aria-hidden
        animate={{ x: hovered ? ['-150%', '160%'] : '-150%' }}
        transition={{
          duration: 0.85,
          ease: 'easeInOut',
          repeat: hovered ? Infinity : 0,
          repeatDelay: 1,
        }}
        className="pointer-events-none absolute inset-y-0 z-10 w-14 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </div>
  )
}

/** Entrada distinta por índice (no glare) */
const ENTRANCES = [
  { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } },
  { initial: { opacity: 0, scale: 0.92, rotate: -2 }, animate: { opacity: 1, scale: 1, rotate: 0 } },
  { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } },
  { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } },
  { initial: { opacity: 0, y: 16, scale: 1.04 }, animate: { opacity: 1, y: 0, scale: 1 } },
]

export function AnimatedMedia({ children, className = '', delay = 0, variant }) {
  const v = ENTRANCES[(variant ?? Math.floor(delay * 20)) % ENTRANCES.length]
  return (
    <motion.div
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group overflow-hidden ${className}`}
    >
      <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:transition [&>img]:duration-700 group-hover:[&>img]:scale-[1.06]">
        {children}
      </div>
    </motion.div>
  )
}

// Back-compat alias
export const ExpandRing = ExpandRingButton
