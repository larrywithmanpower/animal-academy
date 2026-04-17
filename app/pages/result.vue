<template>
  <div class="result-page">
    <!-- 獎勵動物 -->
    <div class="result-mascot" aria-hidden="true">{{ resultEmoji }}</div>

    <!-- 得分卡 -->
    <div class="score-card">
      <p class="score-card__subtitle">{{ quizStore.isRetryMode ? '錯題重考成績' : '本輪得分' }}</p>
      <div class="score-card__big">
        <span class="score-card__number">{{ quizStore.correctCount }}</span>
        <span class="score-card__divider">/</span>
        <span class="score-card__total">{{ quizStore.totalQuestions }}</span>
      </div>
      <div class="score-badge" :class="scoreBadgeClass">
        {{ scoreLabel }}
      </div>
      <p class="score-card__percent">答對率 {{ quizStore.scorePercent }}%</p>
    </div>

    <!-- 錯題重考區塊 -->
    <div v-if="wrongCount > 0" class="retry-section">
      <p class="retry-section__hint">有 <strong>{{ wrongCount }}</strong> 題答錯，再練習一次吧！</p>
      <button class="btn btn--retry" @click="retryWrong">
        📝 重考錯題（{{ wrongCount }} 題）
      </button>
    </div>
    <div v-else-if="quizStore.isRetryMode" class="retry-section retry-section--perfect">
      <p>🎉 全部答對了！真棒！</p>
    </div>

    <!-- 答題明細 -->
    <div class="records-list">
      <h2 class="records-title">答題明細</h2>
      <div
        v-for="(record, index) in quizStore.records"
        :key="record.questionId"
        class="record-item"
        :class="record.isCorrect ? 'record-item--correct' : 'record-item--wrong'"
      >
        <span class="record-item__index">{{ index + 1 }}</span>
        <span class="record-item__text">{{ quizStore.questions[index]?.question }}</span>
        <span class="record-item__icon">{{ record.isCorrect ? '✅' : '❌' }}</span>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="result-actions">
      <button class="btn btn--primary" @click="replayQuiz">
        🔄 再玩一次
      </button>
      <NuxtLink v-if="quizStore.currentGrade && quizStore.currentGrade > 0" :to="`/grade/${quizStore.currentGrade}`" class="btn btn--secondary">
        換科目
      </NuxtLink>
      <NuxtLink to="/" class="btn btn--ghost">
        回首頁
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'

const router = useRouter()
const quizStore = useQuizStore()

onMounted(() => {
  if (quizStore.records.length === 0) {
    router.push('/')
    return
  }
  // 結算答錯的題目
  quizStore.saveWrongQuestions()
})

const wrongCount = computed(() => quizStore.wrongQuestions.length)

const resultEmoji = computed(() => {
  const percent = quizStore.scorePercent
  if (percent >= 90) return '🏆'
  if (percent >= 70) return '😊'
  if (percent >= 50) return '😅'
  return '😢'
})

const scoreLabel = computed(() => {
  const percent = quizStore.scorePercent
  if (percent >= 90) return '太厲害了！'
  if (percent >= 70) return '做得不錯！'
  if (percent >= 50) return '再加油！'
  return '繼續練習！'
})

const scoreBadgeClass = computed(() => {
  const percent = quizStore.scorePercent
  if (percent >= 90) return 'score-badge--gold'
  if (percent >= 70) return 'score-badge--silver'
  if (percent >= 50) return 'score-badge--bronze'
  return 'score-badge--default'
})

// 重考錯題
const retryWrong = () => {
  const grade = quizStore.currentGrade
  quizStore.startRetry()
  if (grade === 0) {
    router.push('/kindergarten')
  } else {
    router.push(`/quiz/${grade}/${quizStore.currentSubject}`)
  }
}

// 再玩一次（重新從完整題庫抽題）
const replayQuiz = () => {
  const { currentGrade, currentSubject } = quizStore
  if (!currentGrade || !currentSubject) {
    router.push('/')
    return
  }
  if (currentGrade === 0) {
    quizStore.resetQuiz()
    router.push('/kindergarten')
  } else {
    quizStore.resetQuiz()
    router.push(`/quiz/${currentGrade}/${currentSubject}`)
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  gap: 1.5rem;
  max-width: 640px;
  margin: 0 auto;
}

.result-mascot {
  font-size: 6rem;
  animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes popIn {
  from { transform: scale(0) rotate(-20deg); opacity: 0; }
  to   { transform: scale(1) rotate(0); opacity: 1; }
}

.score-card {
  width: 100%;
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  text-align: center;
  animation: slideUp 0.4s ease 0.2s both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.score-card__subtitle { margin: 0 0 0.5rem; color: var(--color-text-muted); font-size: 0.95rem; }
.score-card__big { display: flex; align-items: baseline; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.score-card__number { font-size: 4rem; font-weight: 900; color: var(--color-primary); line-height: 1; }
.score-card__divider { font-size: 2rem; color: var(--color-text-muted); }
.score-card__total { font-size: 2rem; font-weight: 700; color: var(--color-text); }

.score-badge { display: inline-block; padding: 0.4rem 1.25rem; border-radius: 99px; font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; }
.score-badge--gold    { background: #FFF9C4; color: #F57F17; }
.score-badge--silver  { background: #E3F2FD; color: #1565C0; }
.score-badge--bronze  { background: #FFF3E0; color: #E65100; }
.score-badge--default { background: var(--color-surface); color: var(--color-text-muted); }

.score-card__percent { margin: 0; color: var(--color-text-muted); font-size: 0.9rem; }

/* 錯題重考區塊 */
.retry-section {
  width: 100%;
  background: #FFF3E0;
  border: 2px solid #FFB300;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  animation: slideUp 0.4s ease 0.35s both;
}

.retry-section--perfect {
  background: #E8F5E9;
  border-color: #4CAF50;
  font-size: 1.05rem;
  font-weight: 700;
  color: #2E7D32;
}

.retry-section__hint { margin: 0; font-size: 0.95rem; color: var(--color-text); }
.retry-section__hint strong { color: #F44336; }

.btn--retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: #FF6F00;
  color: white;
  width: 100%;
  transition: opacity 0.2s, transform 0.15s;
}

.btn--retry:hover { opacity: 0.9; transform: translateY(-1px); }
.btn--retry:active { transform: translateY(0); }

/* 答題明細 */
.records-list { width: 100%; }

.records-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.record-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.record-item--correct { border-left: 3px solid #4CAF50; }
.record-item--wrong   { border-left: 3px solid #F44336; }

.record-item__index {
  width: 1.5rem; height: 1.5rem;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  color: var(--color-text-muted);
}

.record-item__text { flex: 1; font-size: 0.9rem; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.record-item__icon { flex-shrink: 0; }

/* 操作按鈕 */
.result-actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 320px; }
</style>
