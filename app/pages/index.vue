<template>
  <div class="home-page">
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
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz'

// 年級選項設定
const grades = [
  { value: 1, label: '一年級', sub: 'Grade 1', icon: '🌱' },
  { value: 2, label: '二年級', sub: 'Grade 2', icon: '🌿' },
  { value: 3, label: '三年級', sub: 'Grade 3', icon: '🌳' }
]

const quizStore = useQuizStore()
const router = useRouter()

// 選擇年級後導向科目選擇頁
const selectGrade = (grade: number) => {
  quizStore.setGrade(grade)
  router.push(`/grade/${grade}`)
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
