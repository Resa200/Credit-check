import { supabase } from './supabase'

interface AuditEntry {
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, unknown>
}

export async function createAuditLog(entry: AuditEntry): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: entry.userId,
    action: entry.action,
    resource_type: entry.resourceType ?? null,
    resource_id: entry.resourceId ?? null,
    details: entry.details ?? null,
    ip_address: null,
    meta: null,
    created_by: entry.userId,
    modified_by: entry.userId,
  })

  if (error) {
    console.error('Failed to create audit log:', error.message)
  }
}
