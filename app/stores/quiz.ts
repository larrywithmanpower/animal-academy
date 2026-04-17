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
    isRetryMode: false
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
      state.records.length === state.questions.length && state.questions.length > 0
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
    },

    submitAnswer(selected: number) {
      const question = this.currentQuestion
      if (!question) return
      const isCorrect = selected === question.answer
      this.records.push({ questionId: question.id, selected, isCorrect })
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
    }
  }
})
