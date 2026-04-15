<template>
  <div class="quiz-page">
    <!-- 載入中狀態 -->
    <div v-if="quizStore.loading" class="loading-state">
      <div class="loading-spinner" aria-label="載入中">⏳</div>
      <p>載入題庫中...</p>
    </div>

    <!-- 答題完成，跳轉前的過渡 -->
    <div v-else-if="quizStore.isFinished" class="finished-state">
      <div class="finished-mascot" aria-hidden="true">🎉</div>
      <p>答題完成！計算結果中...</p>
    </div>

    <!-- 答題遊戲主畫面 -->
    <template v-else-if="quizStore.currentQuestion">
      <!-- 頂部進度列 -->
      <div class="quiz-header">
        <NuxtLink :to="`/grade/${grade}`" class="back-btn" aria-label="返回科目選擇">
          ←
        </NuxtLink>
        <div class="progress-bar" role="progressbar" :aria-valuenow="quizStore.currentIndex + 1" :aria-valuemax="quizStore.totalQuestions">
          <div class="progress-bar__fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-label">
          {{ quizStore.currentIndex + 1 }} / {{ quizStore.totalQuestions }}
        </span>
      </div>

      <!-- 分數顯示 -->
      <div class="score-display" aria-label="目前得分">
        <span class="score-icon">⭐</span>
        <span>{{ quizStore.correctCount }}</span>
      </div>

      <!-- 像素動物 + 題目區塊 -->
      <div class="quiz-main">
        <!-- 動物角色（佔位圖） -->
        <div class="animal-mascot" :class="{ 'animal-mascot--correct': answerState === 'correct', 'animal-mascot--wrong': answerState === 'wrong' }" aria-hidden="true">
          {{ animalEmoji }}
        </div>

        <!-- 題目 -->
        <div class="question-card" :class="{ 'question-card--enter': questionEnter }">
          <p class="question-text">{{ quizStore.currentQuestion.question }}</p>
        </div>
      </div>

      <!-- 選項按鈕 -->
      <div class="options-grid">
        <button
          v-for="(option, index) in quizStore.currentQuestion.options"
          :key="index"
          class="option-btn"
          :class="getOptionClass(index)"
          :disabled="answerState !== 'idle'"
          @click="handleAnswer(index)"
        >
          <span class="option-btn__letter">{{ optionLetters[index] }}</span>
          <span class="option-btn__text">{{ option }}</span>
        </button>
      </div>

      <!-- 答題回饋 + 下一題按鈕 -->
      <Transition name="feedback">
        <div v-if="answerState !== 'idle'" class="feedback-bar" :class="`feedback-bar--${answerState}`">
          <span class="feedback-bar__icon">{{ answerState === 'correct' ? '✅' : '❌' }}</span>
          <span class="feedback-bar__text">
            {{ answerState === 'correct' ? '答對了！太棒了！' : `正確答案是：${quizStore.currentQuestion.options[quizStore.currentQuestion.answer]}` }}
          </span>
          <button class="btn btn--white" @click="goNext">
            {{ isLastQuestion ? '查看結果' : '下一題 →' }}
          </button>
        </div>
      </Transition>
    </template>

    <!-- 無題庫狀態 -->
    <div v-else class="empty-state">
      <p>找不到題庫資料</p>
      <NuxtLink to="/" class="btn btn--primary">回首頁</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'
import { useProgress } from '~/composables/useProgress'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()
const { saveProgress, clearProgress } = useProgress()

const grade = computed(() => Number(route.params.grade))
const subject = computed(() => route.params.subject as 'english' | 'math')

// 答題狀態：idle / correct / wrong
const answerState = ref<'idle' | 'correct' | 'wrong'>('idle')
// 題目進場動畫觸發
const questionEnter = ref(false)

const optionLetters = ['A', 'B', 'C', 'D']

// 進度百分比
const progressPercent = computed(
  () => ((quizStore.currentIndex + 1) / quizStore.totalQuestions) * 100
)

// 是否為最後一題
const isLastQuestion = computed(
  () => quizStore.currentIndex === quizStore.totalQuestions - 1
)

// 根據年級顯示不同動物
const animalEmoji = computed(() => {
  const animals = {
    1: '🐱',
    2: '🐶',
    3: '🐻'
  }
  return animals[grade.value as keyof typeof animals] ?? '🐾'
})

// 取得選項按鈕樣式 class
const getOptionClass = (index: number) => {
  if (answerState.value === 'idle') return ''
  const correctIndex = quizStore.currentQuestion?.answer ?? -1
  if (index === correctIndex) return 'option-btn--correct'
  if (answerState.value === 'wrong' && index === selectedIndex.value) {
    return 'option-btn--wrong'
  }
  return 'option-btn--disabled'
}

const selectedIndex = ref(-1)

// 處理答題
const handleAnswer = (index: number) => {
  if (answerState.value !== 'idle') return
  selectedIndex.value = index
  quizStore.submitAnswer(index)
  const isCorrect = index === quizStore.currentQuestion?.answer
  answerState.value = isCorrect ? 'correct' : 'wrong'

  // 儲存進度
  saveProgress({
    grade: grade.value,
    subject: subject.value,
    questionIndex: quizStore.currentIndex,
    records: quizStore.records
  })
}

// 前往下一題或結果頁
const goNext = async () => {
  if (isLastQuestion.value) {
    // 清除進度，跳轉結果頁
    await clearProgress()
    router.push('/result')
  } else {
    quizStore.nextQuestion()
    answerState.value = 'idle'
    selectedIndex.value = -1

    // 題目進場動畫
    questionEnter.value = false
    await nextTick()
    questionEnter.value = true
    setTimeout(() => { questionEnter.value = false }, 400)
  }
}

// 載入題庫，並嘗試恢復進度
onMounted(async () => {
  await quizStore.loadQuiz(grade.value, subject.value)

  // 觸發進場動畫
  questionEnter.value = true
  setTimeout(() => { questionEnter.value = false }, 400)
})

// 答題完成後自動跳轉結果頁
watch(
  () => quizStore.isFinished,
  async (finished) => {
    if (finished) {
      await clearProgress()
      setTimeout(() => router.push('/result'), 800)
    }
  }
)
</script>

<style scoped>
.quiz-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1.25rem;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 6rem;
}

/* 頂部進度列 */
.quiz-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: background 0.2s;
}

.back-btn:hover { background: var(--color-border); }

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* 分數 */
.score-display {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  align-self: flex-end;
}

/* 答題主區塊 */
.quiz-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.animal-mascot {
  font-size: 5rem;
  transition: transform 0.3s;
}

.animal-mascot--correct {
  animation: correctBounce 0.6s ease;
}

.animal-mascot--wrong {
  animation: wrongShake 0.5s ease;
}

@keyframes correctBounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  30% { transform: translateY(-16px) rotate(10deg); }
  60% { transform: translateY(-8px) rotate(-5deg); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.question-card {
  width: 100%;
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  text-align: center;
}

.question-card--enter {
  animation: slideIn 0.35s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.question-text {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--color-text);
}

/* 選項 */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.option-btn:not(:disabled):hover,
.option-btn:not(:disabled):focus-visible {
  border-color: var(--color-primary);
  background: #E8F5E9;
}

.option-btn--correct {
  border-color: #4CAF50 !important;
  background: #E8F5E9 !important;
}

.option-btn--wrong {
  border-color: #F44336 !important;
  background: #FFEBEE !important;
}

.option-btn--disabled {
  opacity: 0.5;
}

.option-btn__letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-surface);
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.option-btn__text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}

/* 答題回饋列 */
.feedback-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  z-index: 100;
}

.feedback-bar--correct {
  background: #4CAF50;
  color: white;
}

.feedback-bar--wrong {
  background: #F44336;
  color: white;
}

.feedback-bar__icon { font-size: 1.5rem; }
.feedback-bar__text { flex: 1; font-weight: 600; font-size: 0.95rem; }

/* Transition 動畫 */
.feedback-enter-active,
.feedback-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.feedback-enter-from,
.feedback-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 載入 / 空狀態 */
.loading-state,
.finished-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 1rem;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.loading-spinner,
.finished-mascot {
  font-size: 4rem;
  animation: spin 1.5s linear infinite;
}

.finished-mascot {
  animation: bounce 0.8s ease infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* RWD：手機小螢幕 */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 1.05rem;
  }
}
</style>
