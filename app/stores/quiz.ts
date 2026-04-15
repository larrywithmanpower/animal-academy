import { defineStore } from 'pinia'

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
  // 當前選擇的年級 (1-3)
  currentGrade: number | null
  // 當前選擇的科目
  currentSubject: 'english' | 'math' | null
  // 當前題庫
  questions: Question[]
  // 當前題目索引
  currentIndex: number
  // 答題記錄
  records: QuizRecord[]
  // 是否正在載入題庫
  loading: boolean
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    currentGrade: null,
    currentSubject: null,
    questions: [],
    currentIndex: 0,
    records: [],
    loading: false
  }),

  getters: {
    // 當前題目
    currentQuestion: (state): Question | null => {
      return state.questions[state.currentIndex] ?? null
    },

    // 總題數
    totalQuestions: (state): number => state.questions.length,

    // 正確題數
    correctCount: (state): number =>
      state.records.filter(r => r.isCorrect).length,

    // 得分百分比
    scorePercent: (state): number => {
      if (state.records.length === 0) return 0
      const correct = state.records.filter(r => r.isCorrect).length
      return Math.round((correct / state.questions.length) * 100)
    },

    // 是否已完成所有題目
    isFinished: (state): boolean =>
      state.records.length === state.questions.length && state.questions.length > 0
  },

  actions: {
    // 設定年級
    setGrade(grade: number) {
      this.currentGrade = grade
    },

    // 設定科目並載入題庫
    async loadQuiz(grade: number, subject: 'english' | 'math') {
      this.currentGrade = grade
      this.currentSubject = subject
      this.currentIndex = 0
      this.records = []
      this.loading = true

      try {
        const fileName = `grade${grade}_${subject}.json`
        const data = await $fetch<{ questions: Question[] }>(`/data/${fileName}`)
        this.questions = data.questions
      } catch (err) {
        console.error('載入題庫失敗:', err)
        this.questions = []
      } finally {
        this.loading = false
      }
    },

    // 提交答案
    submitAnswer(selected: number) {
      const question = this.currentQuestion
      if (!question) return

      const isCorrect = selected === question.answer
      this.records.push({
        questionId: question.id,
        selected,
        isCorrect
      })
    },

    // 前往下一題
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },

    // 重置答題進度
    resetQuiz() {
      this.currentIndex = 0
      this.records = []
    },

    // 完整重置（回首頁）
    fullReset() {
      this.currentGrade = null
      this.currentSubject = null
      this.questions = []
      this.currentIndex = 0
      this.records = []
    }
  }
})
