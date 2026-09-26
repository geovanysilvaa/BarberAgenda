import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import type { Ref } from 'react'
import {
  validateImageFile,
  readFileAsDataURL,
  uploadImage,
  UploadError,
} from '../lib/imageUpload'

type ImageFolder = 'barbershops' | 'services' | 'professionals'

export interface ImageUploadHiddenHandle {
  trigger: () => void
}

interface ImageUploadHiddenProps {
  folder: ImageFolder
  id: string
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  fileNamePrefix?: string
}

/**
 * Componente headless (sem UI) — apenas faz upload de imagem e expõe trigger() via ref.
 * Ideal para designs customizados que usam seu próprio visual de avatar/miniaturas.
 */
export const ImageUploadHidden = forwardRef(function ImageUploadHidden(
  {
    folder,
    id,
    value,
    onChange,
    disabled = false,
    fileNamePrefix,
  }: ImageUploadHiddenProps,
  ref: Ref<ImageUploadHiddenHandle | null>,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Sincroniza o value com o controle externo
    if (inputRef.current && !value) {
      inputRef.current.value = ''
    }
  }, [value])

  useImperativeHandle(
    ref,
    () => ({
      trigger() {
        if (disabled || loading) return
        inputRef.current?.click()
      },
    }),
    [disabled, loading],
  )

  async function handleChange(file: File | undefined) {
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) return

    try {
      setLoading(true)
      await readFileAsDataURL(file) // preview apenas para manter consistência interna (não usamos)
      const url = await uploadImage({
        file,
        folder,
        id,
        fileName: fileNamePrefix,
      })
      onChange(url)
    } catch (err) {
      const msg =
        err instanceof UploadError ? err.message : 'Falha no envio da imagem.'
      // Não exibimos UI de erro (é headless), mas repassamos null para evitar estado inconsistente
      console.warn('[ImageUploadHidden]', msg, err)
      onChange(value ?? null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      disabled={disabled || loading}
      className="hidden"
      onChange={(e) => handleChange(e.target.files?.[0])}
    />
  )
})
