// 個人排行榜：依「年級 + 科目」分別存前三名紀錄
import localforage from 'localforage'

export interface LeaderboardEntry {
  score: number        // 答對題數
  total: number        // 總題數
  durationMs: number   // 完成耗時（毫秒）
  playedAt: number     // 時間戳（同時作為唯一識別）
}

export type LeaderboardMap = Record<string, LeaderboardEntry[]>

const STORAGE_KEY = 'animal_academy_leaderboard'
const MAX_ENTRIES = 3

// 動物稱號（呼應吉祥物）
export const RANK_TITLES = [
  { rank: 1, icon: '🐻', title: '學霸熊熊' },
  { rank: 2, icon: '🐶', title: '聰明汪汪' },
  { rank: 3, icon: '🐱', title: '加油貓貓' }
] as const

// 排序規則：答對數高優先，同分比用時短者勝
const sortEntries = (list: LeaderboardEntry[]) =>
  [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.durationMs - b.durationMs
  })

export const useLeaderboard = () => {
  const keyFor = (grade: number, subject: string) => `${grade}_${subject}`

  const loadAll = async (): Promise<LeaderboardMap> => {
    try {
      return (await localforage.getItem<LeaderboardMap>(STORAGE_KEY)) ?? {}
    } catch (err) {
      console.error('讀取排行榜失敗:', err)
      return {}
    }
  }

  // 取得指定年級 + 科目的前三名
  const getLeaderboard = async (
    grade: number,
    subject: string
  ): Promise<LeaderboardEntry[]> => {
    const all = await loadAll()
    return all[keyFor(grade, subject)] ?? []
  }

  // 送出一筆紀錄，回傳本次名次（1–3）或 null（未上榜）及更新後的榜單
  const submitRecord = async (
    grade: number,
    subject: string,
    entry: LeaderboardEntry
  ): Promise<{ rank: number | null; board: LeaderboardEntry[] }> => {
    const all = await loadAll()
    const key = keyFor(grade, subject)
    const merged = sortEntries([...(all[key] ?? []), entry])
    const top = merged.slice(0, MAX_ENTRIES)
    all[key] = top
    try {
      await localforage.setItem(STORAGE_KEY, all)
    } catch (err) {
      console.error('儲存排行榜失敗:', err)
    }
    const idx = top.findIndex(e => e.playedAt === entry.playedAt)
    return { rank: idx >= 0 ? idx + 1 : null, board: top }
  }

  // 用時格式化：mm:ss
  const formatDuration = (ms: number): string => {
    if (!ms || ms < 0) return '—'
    const totalSec = Math.round(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return {
    getLeaderboard,
    submitRecord,
    formatDuration,
    RANK_TITLES
  }
}
