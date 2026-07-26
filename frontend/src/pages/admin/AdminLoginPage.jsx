import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '../../services/api'
import { isAuthenticated, setToken } from '../../lib/auth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async ({ password }) => {
    setError('')
    try {
      const { data } = await authApi.login(password)
      if (!data.success) {
        setError(data.message || 'Contraseña incorrecta')
        return
      }
      setToken(data.token)
      toast.success('Bienvenido')
      navigate('/admin')
    } catch {
      setError('No se pudo conectar con el servidor')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(193,18,31,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_35%)]" />
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-md border border-white/10 bg-white p-8 shadow-2xl"
      >
        <p className="font-display text-3xl font-semibold">
          ECA<span className="text-brand">360</span>
        </p>
        <h1 className="mt-2 text-lg font-medium text-ink">Acceso administrativo</h1>
        <p className="mt-1 text-sm text-muted">Ingresa la contraseña definida en ADMIN_PASSWORD.</p>

        <label className="mt-8 block text-sm font-medium text-ink">
          Contraseña
          <input
            type="password"
            autoFocus
            {...register('password', { required: true })}
            className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-brand"
          />
        </label>
        {error && <p className="mt-2 text-sm text-brand">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </motion.form>
    </div>
  )
}
