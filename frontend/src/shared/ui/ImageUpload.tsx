import { useRef, useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { validateImageFile, readFileAsDataURL, uploadImage, UploadError } from '../lib/imageUpload'

type ImageFolder = 'barbershops' | 'services' | 'professionals'

interface ImageUploadProps {
  folder: ImageFolder
  id: string
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
  description?: string
  aspect?: 'square' | 'cover' | 'portrait'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fileNamePrefix?: string
  errorMessage?: string
}

export function ImageUpload({
  folder,
  id,
  value,
  onChange,
  label = 'Imagem',
  description = 'Selecione uma imagem em JPG, PNG ou WEBP (máx. 5MB).',
  aspect = 'cover',
  size = 'md',
  disabled = false,
  fileNamePrefix,
  errorMessage,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setPreview(value ?? null)
  }, [value])

  function triggerInput() {
    if (disabled || loading) return
    inputRef.current?.click()
  }

  function clearImage() {
    if (disabled || loading) return
    setPreview(null)
    onChange(null)
    setError(null)
    setSuccess(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleChange(file: File | undefined) {
    if (!file) return
    setError(null)
    setSuccess(false)

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      const localPreview = await readFileAsDataURL(file)
      setPreview(localPreview)
      const url = await uploadImage({
        file,
        folder,
        id,
        fileName: fileNamePrefix,
      })
      setPreview(url)
      onChange(url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      const msg = err instanceof UploadError ? err.message : 'Falha no envio da imagem.'
      setError(msg)
      setPreview(value ?? null)
    } finally {
      setLoading(false)
    }
  }

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square'
      : aspect === 'portrait'
        ? 'aspect-[4/5]'
        : 'aspect-[16/10]'

  const sizeDimensoes =
    size === 'sm'
      ? 'w-40'
      : size === 'lg'
        ? 'w-full max-w-md'
        : 'w-full max-w-xs'

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold text-text-primary tracking-tight">
          {label}
        </label>
      )}

      <div className={`${sizeDimensoes}`}>
        <div
          className={`relative w-full ${aspectClass} rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
            preview
              ? 'border-selected/40 bg-secondary'
              : errorMessage || error
                ? 'border-red-300 bg-red-50'
                : 'border-border bg-secondary hover:border-selected/40 hover:bg-secondary/70'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={triggerInput}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') triggerInput()
          }}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex items-center justify-end gap-1.5">
                  {loading && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 backdrop-blur text-white text-xs font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      Enviando...
                    </span>
                  )}
                  {success && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-selected/90 text-white text-xs font-semibold">
                      <CheckCircle2 size={12} />
                      Enviada
                    </span>
                  )}
                  {!disabled && !loading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                      className="w-7 h-7 rounded-lg bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-colors"
                      aria-label="Remover imagem"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {!disabled && (
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur text-white text-xs font-semibold">
                      Clique para trocar
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                  errorMessage || error
                    ? 'bg-red-100 border-red-200 text-red-500'
                    : 'bg-selected/10 border-selected/20 text-selected'
                }`}
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : errorMessage || error ? (
                  <X size={22} />
                ) : (
                  <ImageIcon size={22} strokeWidth={2} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-text-primary">
                  {loading ? 'Enviando imagem...' : 'Adicionar imagem'}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed max-w-[220px]">
                  {description}
                </p>
              </div>
              {!disabled && !loading && (
                <span className="inline-flex items-center gap-1.5 mt-1 px-3.5 py-1.5 rounded-xl bg-selected text-white text-xs font-semibold shadow-sm shadow-selected/20">
                  <Upload size={13} />
                  Escolher arquivo
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {(error || errorMessage) && (
        <p className="text-xs text-red-500 font-medium">{error || errorMessage}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled || loading}
        className="hidden"
        onChange={(e) => handleChange(e.target.files?.[0])}
      />
    </div>
  )
}
