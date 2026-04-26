<template>
  <div class="home-page">
    <!-- 右上角：成績紀錄按鈕 -->
    <button
      class="history-btn"
      type="button"
      aria-label="成績紀錄"
      @click="openHistory"
    >
      <span class="history-btn__icon">📊</span>
      <span class="history-btn__label">紀錄</span>
    </button>

    <div class="hero">
      <!-- 像素動物裝飾佔位 -->
      <div class="pixel-animals">
        <div class="pixel-animal pixel-animal--cat" aria-hidden="true">🐱</div>
        <div class="pixel-animal pixel-animal--dog" aria-hidden="true">🐶</div>
        <div class="pixel-animal pixel-animal--rabbit" aria-hidden="true">🐰</div>
      </div>

      <h1 class="hero-title">
        <span class="title-en">Animal Academy</span>
        <span class="title-zh">動物學堂</span>
      </h1>
      <p class="hero-subtitle">選擇年級，開始學習吧！</p>
    </div>

    <!-- 幼幼班入口 -->
    <NuxtLink to="/kindergarten" class="kinder-btn fade-in-up">
      <span class="kinder-btn__icon">🐣</span>
      <span class="kinder-btn__label">幼幼班</span>
      <span class="kinder-btn__sub">Kindergarten</span>
    </NuxtLink>

    <!-- 年級選擇按鈕 -->
    <div class="grade-grid">
      <button
        v-for="grade in grades"
        :key="grade.value"
        class="grade-btn"
        :class="`grade-btn--${grade.value}`"
        @click="selectGrade(grade.value)"
      >
        <span class="grade-btn__icon">{{ grade.icon }}</span>
        <span class="grade-btn__label">{{ grade.label }}</span>
        <span class="grade-btn__sub">{{ grade.sub }}</span>
      </button>
    </div>

    <!-- 成績紀錄抽屜 -->
    <Transition name="drawer">
      <div v-if="historyOpen" class="history-drawer">
        <div class="history-drawer__overlay" @click="closeHistory"></div>
        <aside class="history-drawer__panel" role="dialog" aria-label="成績紀錄">
          <header class="history-drawer__header">
            <h2 class="history-drawer__title">📊 成績紀錄</h2>
            <button
              class="history-drawer__close"
              type="button"
              aria-label="關閉"
              @click="closeHistory"
            >
              ×
            </button>
          </header>

          <div v-if="historyLoading" class="history-drawer__empty">載入中…</div>
          <div v-else-if="historyList.length === 0" class="history-drawer__empty">
            還沒有任何紀錄<br />去答題吧！
          </div>
          <ul v-else class="history-list">
            <li
              v-for="item in historyList"
              :key="item.playedAt"
              class="history-item"
              :class="badgeClass(item)"
            >
              <div class="history-item__row">
                <span class="history-item__category">
                  {{ gradeLabel(item.grade) }} · {{ subjectLabel(item.subject) }}
                </span>
                <span class="history-item__score">
                  {{ item.score }} / {{ item.total }}
                </span>
              </div>
              <div class="history-item__row history-item__row--meta">
                <span>{{ formatDateTime(item.playedAt) }}</span>
                <span>⏱ {{ formatDuration(item.durationMs) }}</span>
              </div>
            </li>
          </ul>

          <footer v-if="historyList.length > 0" class="history-drawer__footer">
            <button class="history-clear-btn" type="button" @click="confirmClear">
              清除全部紀錄
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'
import { useHistory, type HistoryEntry } from '~/composables/useHistory'
import { useLeaderboard } from '~/composables/useLeaderboard'

// 年級選項設定
const grades = [
  { value: 1, label: '一年級', sub: 'Grade 1', icon: '🌱' },
  { value: 2, label: '二年級', sub: 'Grade 2', icon: '🌿' },
  { value: 3, label: '三年級', sub: 'Grade 3', icon: '🌳' }
]

const quizStore = useQuizStore()
const router = useRouter()
const { loadAll, clearHistory } = useHistory()
const { formatDuration } = useLeaderboard()

// 選擇年級後導向科目選擇頁
const selectGrade = (grade: number) => {
  quizStore.setGrade(grade)
  router.push(`/grade/${grade}`)
}

// 成績紀錄抽屜
const historyOpen = ref(false)
const historyLoading = ref(false)
const historyList = ref<HistoryEntry[]>([])

const openHistory = async () => {
  historyOpen.value = true
  historyLoading.value = true
  try {
    historyList.value = await loadAll()
  } finally {
    historyLoading.value = false
  }
}

const closeHistory = () => {
  historyOpen.value = false
}

const confirmClear = async () => {
  if (!confirm('確定要清除全部成績紀錄嗎？此操作無法復原。')) return
  await clearHistory()
  historyList.value = []
}

const gradeLabel = (grade: number) => {
  if (grade === 0) return '幼幼班'
  return `${['一', '二', '三'][grade - 1] ?? grade}年級`
}

const subjectLabel = (subject: string) => {
  return subject === 'english' ? '英文' : subject === 'math' ? '數學' : subject
}

const formatDateTime = (ts: number) => {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}/${mm}/${dd} ${hh}:${mi}`
}

const badgeClass = (item: HistoryEntry) => {
  const percent = item.total > 0 ? (item.score / item.total) * 100 : 0
  if (percent >= 90) return 'history-item--gold'
  if (percent >= 70) return 'history-item--silver'
  if (percent >= 50) return 'history-item--bronze'
  return 'history-item--normal'
}

// 進場動畫（CSS Transition）
onMounted(() => {
  const btns = document.querySelectorAll('.grade-btn')
  btns.forEach((btn, i) => {
    const el = btn as HTMLElement
    el.style.animationDelay = `${i * 0.15}s`
    el.classList.add('fade-in-up')
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  gap: 2.5rem;
  position: relative;
}

/* 右上角紀錄按鈕 */
.history-btn {
  position: fixed;
  top: max(env(safe-area-inset-top), 1rem);
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: 99px;
  background: white;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.9rem;
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 50;
}

.history-btn:hover,
.history-btn:focus-visible {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.history-btn:active {
  transform: scale(0.97);
}

.history-btn__icon { font-size: 1.1rem; }

/* 抽屜 */
.history-drawer {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.history-drawer__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.history-drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 90vw);
  background: var(--color-bg, #f8f8f8);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.history-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.history-drawer__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
}

.history-drawer__close {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-muted);
}

.history-drawer__close:hover { background: var(--color-surface); }

.history-drawer__empty {
  padding: 3rem 1.25rem;
  text-align: center;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem 1rem;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  background: white;
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  margin-bottom: 0.6rem;
  border-left: 4px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.history-item--gold   { border-left-color: #FFC107; }
.history-item--silver { border-left-color: #90A4AE; }
.history-item--bronze { border-left-color: #D7A66A; }
.history-item--normal { border-left-color: #BDBDBD; }

.history-item__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.history-item__row--meta {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.history-item__category {
  font-weight: 700;
  color: var(--color-text);
}

.history-item__score {
  font-weight: 800;
  color: var(--color-primary);
  font-size: 1.05rem;
}

.history-drawer__footer {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: white;
}

.history-clear-btn {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #F44336;
  border-radius: var(--radius-md);
  background: white;
  color: #F44336;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.history-clear-btn:hover { background: #FFEBEE; }

/* 抽屜進場動畫 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .history-drawer__panel,
.drawer-leave-active .history-drawer__panel {
  transition: transform 0.3s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .history-drawer__panel,
.drawer-leave-to .history-drawer__panel {
  transform: translateX(100%);
}

/* 英雄區塊 */
.hero {
  text-align: center;
  position: relative;
}

.pixel-animals {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.pixel-animal {
  font-size: 3rem;
  animation: bounce 2s infinite;
}

.pixel-animal--dog { animation-delay: 0.3s; }
.pixel-animal--rabbit { animation-delay: 0.6s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}

.title-en {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.title-zh {
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
}

.hero-subtitle {
  margin-top: 0.75rem;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

/* 年級按鈕網格 */
.grade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 640px;
}

.grade-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
  box-shadow: var(--shadow-card);
}

.grade-btn:hover,
.grade-btn:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.grade-btn:active {
  transform: translateY(0);
}

.grade-btn--1 { border-top: 4px solid #4CAF50; }
.grade-btn--2 { border-top: 4px solid #2196F3; }
.grade-btn--3 { border-top: 4px solid #FF9800; }

.grade-btn__icon { font-size: 2.5rem; }
.grade-btn__label { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.grade-btn__sub { font-size: 0.8rem; color: var(--color-text-muted); }

/* 幼幼班按鈕 — 與年級卡片同一設計語言，全寬 */
.kinder-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 640px;
  padding: 2rem 1rem;
  border: none;
  border-top: 4px solid #E91E63;
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: var(--shadow-card);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation-delay: 0s !important;
}

.kinder-btn:hover,
.kinder-btn:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.kinder-btn:active { transform: translateY(0); }

.kinder-btn__icon  { font-size: 2.5rem; }
.kinder-btn__label { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.kinder-btn__sub   { font-size: 0.8rem; color: var(--color-text-muted); }

/* 進場動畫 */
.fade-in-up {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* RWD：手機 */
@media (max-width: 480px) {
  .grade-grid {
    grid-template-columns: 1fr;
    max-width: 320px;
  }

  .grade-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 1.25rem 1.5rem;
    gap: 1rem;
  }

  .grade-btn__icon { font-size: 2rem; }

  .kinder-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 1.25rem 1.5rem;
    gap: 1rem;
    max-width: 320px;
    border-top: none;
    border-left: 4px solid #E91E63;
  }

  .kinder-btn__icon { font-size: 2rem; }
}
</style>
