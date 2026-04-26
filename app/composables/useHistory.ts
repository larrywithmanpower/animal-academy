// 答題歷史紀錄：保存每一次完成的答題成績
import localforage from 'localforage'

export interface HistoryEntry {
  grade: number          // 0 = 幼幼班
  subject: string        // 'english' | 'math'
  score: number
  total: number
  durationMs: number
  playedAt: number       // 時間戳，同時當唯一識別
}

const STORAGE_KEY = 'animal_academy_history'
const MAX_HISTORY = 200  // 上限避免無限累積

export const useHistory = () => {
  const loadAll = async (): Promise<HistoryEntry[]> => {
    try {
      return (await localforage.getItem<HistoryEntry[]>(STORAGE_KEY)) ?? []
    } catch (err) {
      console.error('讀取歷史失敗:', err)
      return []
    }
  }

  const addRecord = async (entry: HistoryEntry) => {
    const all = await loadAll()
    const updated = [entry, ...all].slice(0, MAX_HISTORY)
    try {
      await localforage.setItem(STORAGE_KEY, updated)
    } catch (err) {
      console.error('儲存歷史失敗:', err)
    }
  }

  const clearHistory = async () => {
    try {
      await localforage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('清除歷史失敗:', err)
    }
  }

  return { loadAll, addRecord, clearHistory }
}
