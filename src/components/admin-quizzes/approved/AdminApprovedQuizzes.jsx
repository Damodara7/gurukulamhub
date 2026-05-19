import React, { useCallback, useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import Loading from '@/components/Loading'
import QuizzesTable from './QuizzesTable'
import { ADMIN_QUIZ_TABLE_PAGE_SIZE } from '@/constants/quizListPagination'
import { normalizeQuizListResult } from '@/utils/quizListApi'

function AdminApprovedQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState({ quizzes: false })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(ADMIN_QUIZ_TABLE_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const getQuizData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, quizzes: true }))
      const params = new URLSearchParams({
        approvalState: 'approved',
        privacyFilter: 'PUBLIC',
        limit: String(rowsPerPage),
        page: String(page + 1)
      })
      if (search.trim()) params.set('search', search.trim())
      const result = await RestApi.get(`${ApiUrls.v0.USERS_QUIZ}?${params}`)
      if (result?.status === 'success') {
        const { items, total: t } = normalizeQuizListResult(result.result)
        setQuizzes(items)
        setTotal(t)
      } else {
        setQuizzes([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching approved quizzes:', error)
      setQuizzes([])
      setTotal(0)
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }))
    }
  }, [page, rowsPerPage, search])

  useEffect(() => {
    getQuizData()
  }, [getQuizData])

  if (loading.quizzes && quizzes.length === 0) {
    return <Loading />
  }

  return (
    <QuizzesTable
      data={quizzes}
      refreshData={getQuizData}
      serverPagination={{
        total,
        page,
        rowsPerPage,
        search,
        isLoading: loading.quizzes,
        onPageChange: setPage,
        onRowsPerPageChange: n => {
          setRowsPerPage(n)
          setPage(0)
        },
        onSearchChange: v => {
          setSearch(v)
          setPage(0)
        }
      }}
    />
  )
}

export default AdminApprovedQuizzes
