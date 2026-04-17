<template>
  <div class="kinder-page">
    <!-- 載入中 -->
    <div v-if="quizStore.loading" class="loading-state">
      <div class="loading-spinner">⏳</div>
      <p>載入題庫中...</p>
    </div>

    <!-- 完成過渡 -->
    <div v-else-if="quizStore.isFinished" class="finished-state">
      <div class="finished-mascot">🎉</div>
      <p>答題完成！計算結果中...</p>
    </div>

    <!-- 主畫面 -->
    <template v-else-if="quizStore.currentQuestion">
      <!-- 頂部 -->
      <div class="quiz-header">
        <NuxtLink to="/" class="back-btn" aria-label="返回首頁">←</NuxtLink>
        <div class="progress-bar" role="progressbar" :aria-valuenow="quizStore.currentIndex + 1" :aria-valuemax="quizStore.totalQuestions">
          <div class="progress-bar__fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-label">{{ quizStore.currentIndex + 1 }} / {{ quizStore.totalQuestions }}</span>
      </div>

      <!-- 分數 -->
      <div class="score-display">
        <span>⭐</span>
        <span>{{ quizStore.correctCount }}</span>
      </div>

      <!-- 圖卡 -->
      <div class="picture-section" :class="{ 'picture-section--enter': questionEnter }">
        <div
          class="picture-emoji"
          :class="{
            'picture-emoji--correct': answerState === 'correct',
            'picture-emoji--wrong': answerState === 'wrong'
          }"
        >
          {{ quizStore.currentQuestion.question }}
        </div>
        <p class="picture-prompt">這是什麼英文？</p>
      </div>

      <!-- 選項 -->
      <div class="word-grid">
        <button
          v-for="(option, index) in quizStore.currentQuestion.options"
          :key="index"
          class="word-btn"
          :class="[`word-btn--${btnColors[index]}`, getOptionClass(index)]"
          :disabled="answerState !== 'idle'"
          @click="handleAnswer(index)"
        >
          {{ option }}
        </button>
      </div>

      <!-- 回饋列 -->
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

    <!-- 無資料 -->
    <div v-else class="empty-state">
      <p>找不到題庫資料</p>
      <NuxtLink to="/" class="btn btn--primary">回首頁</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'
import { useProgress } from '~/composables/useProgress'
import { useSound } from '~/composables/useSound'

const router = useRouter()
const quizStore = useQuizStore()
const { saveProgress, clearProgress } = useProgress()
const { playCorrect, playWrong } = useSound()

const answerState = ref<'idle' | 'correct' | 'wrong'>('idle')
const questionEnter = ref(false)
const selectedIndex = ref(-1)

const btnColors = ['blue', 'orange', 'purple', 'green']

const progressPercent = computed(
  () => ((quizStore.currentIndex + 1) / quizStore.totalQuestions) * 100
)

const isLastQuestion = computed(
  () => quizStore.currentIndex === quizStore.totalQuestions - 1
)

const getOptionClass = (index: number) => {
  if (answerState.value === 'idle') return ''
  const correctIndex = quizStore.currentQuestion?.answer ?? -1
  if (index === correctIndex) return 'word-btn--correct'
  if (answerState.value === 'wrong' && index === selectedIndex.value) return 'word-btn--wrong'
  return 'word-btn--disabled'
}

const handleAnswer = (index: number) => {
  if (answerState.value !== 'idle') return
  selectedIndex.value = index
  quizStore.submitAnswer(index)
  const isCorrect = index === quizStore.currentQuestion?.answer
  answerState.value = isCorrect ? 'correct' : 'wrong'
  if (isCorrect) { playCorrect() } else { playWrong() }

  saveProgress({
    grade: 0,
    subject: 'english',
    questionIndex: quizStore.currentIndex,
    records: quizStore.records
  })
}

const goNext = async () => {
  if (isLastQuestion.value) {
    await clearProgress()
    router.push('/result')
  } else {
    quizStore.nextQuestion()
    answerState.value = 'idle'
    selectedIndex.value = -1
    questionEnter.value = false
    await nextTick()
    questionEnter.value = true
    setTimeout(() => { questionEnter.value = false }, 400)
  }
}

onMounted(async () => {
  await quizStore.loadQuiz(0, 'english')
  questionEnter.value = true
  setTimeout(() => { questionEnter.value = false }, 400)
})

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
.kinder-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 6rem;
}

/* 頂部（共用 quiz 樣式） */
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
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: #FF9800;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF9800;
  align-self: flex-end;
}

/* 圖卡區塊 */
.picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.picture-section--enter {
  animation: slideIn 0.35s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.picture-emoji {
  font-size: 7rem;
  line-height: 1;
  transition: transform 0.3s;
  user-select: none;
}

.picture-emoji--correct {
  animation: correctBounce 0.6s ease;
}

.picture-emoji--wrong {
  animation: wrongShake 0.5s ease;
}

@keyframes correctBounce {
  0%, 100% { transform: scale(1) rotate(0); }
  30% { transform: scale(1.25) rotate(10deg); }
  60% { transform: scale(1.1) rotate(-5deg); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-7px); }
  80% { transform: translateX(7px); }
}

.picture-prompt {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

/* 選項格 */
.word-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.word-btn {
  padding: 1.2rem 0.75rem;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  color: white;
  transition: transform 0.15s, opacity 0.15s;
  letter-spacing: 0.02em;
}

.word-btn:not(:disabled):hover,
.word-btn:not(:disabled):focus-visible {
  transform: translateY(-3px) scale(1.03);
}

.word-btn:not(:disabled):active {
  transform: scale(0.96);
}

/* 四色配色 */
.word-btn--blue   { background: #2196F3; }
.word-btn--orange { background: #FF9800; }
.word-btn--purple { background: #9C27B0; }
.word-btn--green  { background: #4CAF50; }

/* 答題後狀態覆蓋顏色 */
.word-btn--correct {
  background: #4CAF50 !important;
  box-shadow: 0 0 0 3px #A5D6A7;
  transform: scale(1.05) !important;
}

.word-btn--wrong {
  background: #F44336 !important;
  box-shadow: 0 0 0 3px #FFCDD2;
}

.word-btn--disabled {
  opacity: 0.4;
}

/* 回饋列 */
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

.feedback-bar--correct { background: #4CAF50; color: white; }
.feedback-bar--wrong   { background: #F44336; color: white; }

.feedback-bar__icon { font-size: 1.5rem; flex-shrink: 0; }
.feedback-bar__text { flex: 1; min-width: 0; font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.feedback-bar .btn  { width: auto; flex-shrink: 0; }

.feedback-enter-active,
.feedback-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.feedback-enter-from,
.feedback-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 狀態頁 */
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

.loading-spinner { font-size: 4rem; animation: spin 1.5s linear infinite; }
.finished-mascot { font-size: 4rem; animation: bounce 0.8s ease infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}

@media (max-width: 480px) {
  .word-btn { font-size: 1.15rem; padding: 1rem 0.5rem; }
  .picture-emoji { font-size: 6rem; }
}
</style>
