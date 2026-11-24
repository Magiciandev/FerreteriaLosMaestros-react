// Agrega comprobadores de DOM a expect: toBeInTheDocument, toBeDisabled, toHaveAttribute, etc.
import '@testing-library/jest-dom/vitest'

// Después de cada prueba: se restituye fetch, se borra la sesión y se limpian las funciones simuladas.
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})
