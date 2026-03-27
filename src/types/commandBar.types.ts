export type CommandIntent =
  | { type: 'navigate'; path: string; label: string }
  | { type: 'start_service'; service: 'bvn' | 'account' | 'credit'; label: string }
  | { type: 'filter_history'; filters: { serviceType?: string; status?: string; dateFrom?: string; dateTo?: string }; label: string }
  | { type: 'answer'; text: string }
  | { type: 'unknown'; text: string }
