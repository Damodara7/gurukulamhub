import { useState, useMemo, useEffect, useCallback } from 'react'

/**
 * Client-side pagination for management card lists.
 * @param {Array} items - Full list to paginate
 * @param {number} pageSize - Items per page
 */
export function useManagementCardPagination(items, pageSize) {
  const [page, setPage] = useState(1)
  const [pageChanging, setPageChanging] = useState(false)

  const itemCount = items?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize) || 1)

  const paginatedItems = useMemo(() => {
    if (!itemCount) return []
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize, itemCount])

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const handlePageChange = useCallback(
    (_, value) => {
      if (value === page) return
      setPageChanging(true)
      setPage(value)
    },
    [page]
  )

  useEffect(() => {
    if (!pageChanging) return
    const id = setTimeout(() => setPageChanging(false), 250)
    return () => clearTimeout(id)
  }, [page, pageChanging])

  const resetPage = useCallback(() => setPage(1), [])

  return {
    page,
    paginatedItems,
    totalPages,
    pageChanging,
    handlePageChange,
    resetPage,
    showPagination: totalPages > 1
  }
}
