/**
 * Normalizes GET /quiz responses: legacy bare array or paginated { items, total, ... }.
 * @param {unknown} result - `response.result` from RestApi.get
 * @returns {{ items: any[], total: number, page: number, limit: number, totalPages: number }}
 */
export function normalizeQuizListResult(result) {
  if (result == null) {
    return { items: [], total: 0, page: 1, limit: 0, totalPages: 0 }
  }
  if (Array.isArray(result)) {
    const n = result.length
    return { items: result, total: n, page: 1, limit: n, totalPages: n ? 1 : 0 }
  }
  const items = result.items ?? result.data ?? []
  const total = typeof result.total === 'number' ? result.total : items.length
  const limit = typeof result.limit === 'number' ? result.limit : items.length || 1
  const page = typeof result.page === 'number' ? result.page : 1
  const totalPages =
    typeof result.totalPages === 'number' ? result.totalPages : total === 0 ? 0 : Math.ceil(total / limit)
  return { items, total, limit, page, totalPages }
}
