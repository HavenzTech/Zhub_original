import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { Document } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function useDocumentsQuery() {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => {
      const data = await bmsApi.documents.getAll()
      return extractArray<Document>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useDocumentDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => bmsApi.documents.getById(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useCheckedOutDocumentsQuery() {
  return useQuery({
    queryKey: queryKeys.documents.checkedOut,
    queryFn: () => bmsApi.documentSearch.getCheckedOut(),
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

export function useMyCheckoutsQuery() {
  return useQuery({
    queryKey: queryKeys.documents.myCheckouts,
    queryFn: () => bmsApi.documentSearch.getMyCheckouts(),
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

export function useNeedsReviewQuery() {
  return useQuery({
    queryKey: queryKeys.documents.needsReview,
    queryFn: () => bmsApi.documentSearch.getNeedsReview(),
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

// --- Mutations ---

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Document>) => bmsApi.documents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create document', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      bmsApi.documents.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update document', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete document', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useDocumentsQueryCompat() {
  const { data, isLoading, error, refetch } = useDocumentsQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const deleteMutation = useDeleteDocument()

  return {
    documents: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadDocuments: async () => { await refetch() },
    createDocument: async (documentData: Partial<Document>): Promise<Document | null> => {
      try { return await createMutation.mutateAsync(documentData) as Document } catch { return null }
    },
    updateDocument: async (id: string, documentData: Partial<Document>): Promise<boolean> => {
      try { await updateMutation.mutateAsync({ id, data: documentData }); return true } catch { return false }
    },
    deleteDocument: async (id: string): Promise<boolean> => {
      try { await deleteMutation.mutateAsync(id); return true } catch { return false }
    },
    setDocuments: (updater: React.SetStateAction<Document[]>) => {
      queryClient.setQueryData(queryKeys.documents.all, (old: Document[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
