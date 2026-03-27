import { useState, useRef, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import Button from '@/components/atoms/Button'
import type { DataLookupRequestRow } from '@/types/supabase.types'

interface ExportMenuProps {
  rows: DataLookupRequestRow[]
}

export default function ExportMenu({ rows }: ExportMenuProps) {
  const { exportHistoryCSV, exportHistoryJSON } = useExport()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (rows.length === 0) return null

  return (
    <div className="relative" ref={menuRef}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
      >
        <Download size={14} />
        Export
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1 z-50">
          <button
            type="button"
            onClick={() => {
              exportHistoryCSV(rows)
              setOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
          >
            Export as CSV
          </button>
          <button
            type="button"
            onClick={() => {
              exportHistoryJSON(rows)
              setOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  )
}
