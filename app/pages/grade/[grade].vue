<template>
  <div class="grade-page">
    <div class="page-header">
      <NuxtLink to="/" class="back-btn" aria-label="返回首頁">
        <span>←</span>
      </NuxtLink>
      <h1 class="page-title">{{ gradeLabel }}・選擇科目</h1>
    </div>

    <!-- 動物裝飾 -->
    <div class="mascot" aria-hidden="true">{{ mascotEmoji }}</div>

    <!-- 科目選擇 -->
    <div class="subject-grid">
      <button
        v-for="subject in subjects"
        :key="subject.value"
        class="subject-btn"
        :class="`subject-btn--${subject.value}`"
        @click="selectSubject(subject.value)"
      >
        <span class="subject-btn__icon">{{ subject.icon }}</span>
        <span class="subject-btn__label">{{ subject.label }}</span>
        <span class="subject-btn__desc">{{ subject.desc }}</span>
      </button>
    </div>

    <!-- 如果有未完成進度，顯示繼續提示 -->
    <div v-if="savedProgress" class="continue-banner">
      <p>
        你有 <strong>{{ savedProgress.subject === 'english' ? '英文' : '數學' }}</strong> 的未完成進度
      </p>
      <div class="continue-banner__actions">
        <button class="btn btn--primary" @click="continueProgress">繼續作答</button>
        <button class="btn btn--ghost" @click="clearSavedProgress">放棄進度</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'
import { useProgress } from '~/composables/useProgress'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

// 取得年級參數，確保為數字
const grade = computed(() => Number(route.params.grade))

// 年級標籤
const gradeLabel = computed(() => `${grade.value} 年級`)

// 不同年級的吉祥物
const mascotEmoji = computed(() => {
  const emojis = { 1: '🐣', 2: '🐤', 3: '🦅' }
  return emojis[grade.value as keyof typeof emojis] ?? '🐾'
})

// 科目選項
const subjects = [
  {
    value: 'english' as const,
    label: '英文',
    desc: 'English',
    icon: '📚'
  },
  {
    value: 'math' as const,
    label: '數學',
    desc: 'Math',
    icon: '🔢'
  }
]

const { loadProgress, clearProgress } = useProgress()
const savedProgress = ref<Awaited<ReturnType<typeof loadProgress>>>(null)

// 選擇科目，進入答題頁
const selectSubject = (subject: 'english' | 'math') => {
  router.push(`/quiz/${grade.value}/${subject}`)
}

// 繼續未完成的進度
const continueProgress = () => {
  if (!savedProgress.value) return
  router.push(`/quiz/${savedProgress.value.grade}/${savedProgress.value.subject}`)
}

// 清除已儲存的進度
const clearSavedProgress = async () => {
  await clearProgress()
  savedProgress.value = null
}

// 載入時確認是否有未完成進度
onMounted(async () => {
  const progress = await loadProgress()
  if (progress && progress.grade === grade.value) {
    savedProgress.value = progress
  }
})

// 確認年級有效（1-3），否則回首頁
watchEffect(() => {
  const g = grade.value
  if (isNaN(g) || g < 1 || g > 3) {
    router.push('/')
  }
})
</script>

<style scoped>
.grade-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  gap: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 480px;
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
  transition: background 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--color-border);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.mascot {
  font-size: 5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: 480px;
}

.subject-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  background: white;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s, box-shadow 0.2s;
}

.subject-btn:hover,
.subject-btn:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.subject-btn--english { border-bottom: 4px solid #2196F3; }
.subject-btn--math { border-bottom: 4px solid #FF9800; }

.subject-btn__icon { font-size: 3rem; }
.subject-btn__label { font-size: 1.3rem; font-weight: 700; color: var(--color-text); }
.subject-btn__desc { font-size: 0.85rem; color: var(--color-text-muted); }

/* 繼續作答提示條 */
.continue-banner {
  width: 100%;
  max-width: 480px;
  background: #E3F2FD;
  border: 1px solid #90CAF9;
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  text-align: center;
}

.continue-banner p {
  margin: 0 0 0.75rem;
  color: #1565C0;
  font-size: 0.95rem;
}

.continue-banner__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* RWD：手機 */
@media (max-width: 480px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }

  .subject-btn {
    flex-direction: row;
    padding: 1.5rem;
    gap: 1.25rem;
  }
}
</style>
