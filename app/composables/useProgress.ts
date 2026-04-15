// 使用 localforage 儲存本機答題進度
import localforage from 'localforage'

// 進度記錄型別
interface ProgressRecord {
  grade: number
  subject: string
  questionIndex: number
  records: Array<{
    questionId: string
    selected: number
    isCorrect: boolean
  }>
  savedAt: number
}

const PROGRESS_KEY = 'animal_academy_progress'

export const useProgress = () => {
  // 儲存進度
  const saveProgress = async (data: Omit<ProgressRecord, 'savedAt'>) => {
    try {
      const record: ProgressRecord = {
        ...data,
        savedAt: Date.now()
      }
      await localforage.setItem(PROGRESS_KEY, record)
    } catch (err) {
      console.error('儲存進度失敗:', err)
    }
  }

  // 讀取進度
  const loadProgress = async (): Promise<ProgressRecord | null> => {
    try {
      return await localforage.getItem<ProgressRecord>(PROGRESS_KEY)
    } catch (err) {
      console.error('讀取進度失敗:', err)
      return null
    }
  }

  // 清除進度
  const clearProgress = async () => {
    try {
      await localforage.removeItem(PROGRESS_KEY)
    } catch (err) {
      console.error('清除進度失敗:', err)
    }
  }

  // 檢查是否有未完成的進度
  const hasUnfinishedProgress = async (
    grade: number,
    subject: string
  ): Promise<boolean> => {
    const progress = await loadProgress()
    if (!progress) return false
    return progress.grade === grade && progress.subject === subject
  }

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasUnfinishedProgress
  }
}
