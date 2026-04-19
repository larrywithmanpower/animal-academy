import { defineStore } from 'pinia'

const QUESTIONS_PER_GAME = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]!; a[j] = tmp!
  }
  return a
}

// 題目資料型別
export interface Question {
  id: string
  question: string
  image: string | null
  options: string[]
  answer: number
}

// 答題記錄型別
export interface QuizRecord {
  questionId: string
  selected: number
  isCorrect: boolean
}

// Store 狀態型別
interface QuizState {
  currentGrade: number | null
  currentSubject: 'english' | 'math' | null
  questions: Question[]
  currentIndex: number
  records: QuizRecord[]
  loading: boolean
  // 本輪答錯的題目（供錯題重考用）
  wrongQuestions: Question[]
  // 是否處於錯題重考模式
  isRetryMode: boolean
  // 計時（排行榜用）
  startedAt: number | null
  finishedAt: number | null
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    currentGrade: null,
    currentSubject: null,
    questions: [],
    currentIndex: 0,
    records: [],
    loading: false,
    wrongQuestions: [],
    isRetryMode: false,
    startedAt: null,
    finishedAt: null
  }),

  getters: {
    currentQuestion: (state): Question | null =>
      state.questions[state.currentIndex] ?? null,

    totalQuestions: (state): number => state.questions.length,

    correctCount: (state): number =>
      state.records.filter(r => r.isCorrect).length,

    scorePercent: (state): number => {
      if (state.records.length === 0) return 0
      const correct = state.records.filter(r => r.isCorrect).length
      return Math.round((correct / state.questions.length) * 100)
    },

    isFinished: (state): boolean =>
      state.records.length === state.questions.length && state.questions.length > 0,

    // 本輪完成所花的毫秒數（未結束則為 0）
    durationMs: (state): number => {
      if (!state.startedAt || !state.finishedAt) return 0
      return state.finishedAt - state.startedAt
    }
  },

  actions: {
    setGrade(grade: number) {
      this.currentGrade = grade
    },

    async loadQuiz(grade: number, subject: 'english' | 'math') {
      this.currentGrade = grade
      this.currentSubject = subject
      this.currentIndex = 0
      this.records = []
      this.wrongQuestions = []
      this.isRetryMode = false
      this.loading = true

      try {
        const fileName = `grade${grade}_${subject}.json`
        const data = await $fetch<{ questions: Question[] }>(`/data/${fileName}`)
        this.questions = shuffle(data.questions).slice(0, QUESTIONS_PER_GAME)
        // 題庫載入完成即開始計時
        this.startedAt = Date.now()
        this.finishedAt = null
      } catch (err) {
        console.error('載入題庫失敗:', err)
        this.questions = []
      } finally {
        this.loading = false
      }
    },

    // 結算本輪答錯的題目（進結果頁前呼叫）
    saveWrongQuestions() {
      this.wrongQuestions = this.records
        .filter(r => !r.isCorrect)
        .map(r => this.questions.find(q => q.id === r.questionId))
        .filter((q): q is Question => q !== undefined)
    },

    // 啟動錯題重考（直接用 wrongQuestions，不重新抓 JSON）
    startRetry() {
      this.questions = shuffle([...this.wrongQuestions])
      this.currentIndex = 0
      this.records = []
      this.wrongQuestions = []
      this.isRetryMode = true
      // 重考不計入排行榜，清空計時
      this.startedAt = null
      this.finishedAt = null
    },

    submitAnswer(selected: number) {
      const question = this.currentQuestion
      if (!question) return
      const isCorrect = selected === question.answer
      this.records.push({ questionId: question.id, selected, isCorrect })
      // 最後一題答完記錄結束時間
      if (this.records.length === this.questions.length && this.startedAt) {
        this.finishedAt = Date.now()
      }
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },

    resetQuiz() {
      this.currentIndex = 0
      this.records = []
      this.isRetryMode = false
    },

    fullReset() {
      this.currentGrade = null
      this.currentSubject = null
      this.questions = []
      this.currentIndex = 0
      this.records = []
      this.wrongQuestions = []
      this.isRetryMode = false
      this.startedAt = null
      this.finishedAt = null
    }
  }
})
