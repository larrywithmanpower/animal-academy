<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- SW 版本更新通知條 -->
    <Transition name="slide-down">
      <div v-if="showUpdateBanner" class="update-banner" role="alert">
        <span>🔔 有新版本可用，點擊更新</span>
        <button class="update-banner__btn" @click="handleUpdate">立即更新</button>
      </div>
    </Transition>

    <!-- iOS 安裝引導 -->
    <Transition name="slide-up">
      <div v-if="showIosInstallGuide" class="ios-install-guide" role="dialog" aria-modal="true" aria-label="加入主畫面說明">
        <div class="ios-install-guide__header">
          <span class="ios-install-guide__title">📲 加入主畫面</span>
          <button class="ios-install-guide__close" aria-label="關閉" @click="dismissIosGuide">✕</button>
        </div>
        <div class="ios-install-guide__steps">
          <div class="ios-install-guide__step">
            <span class="ios-install-guide__step-icon">1️⃣</span>
            <span>點擊下方工具列的「分享」按鈕</span>
          </div>
          <div class="ios-install-guide__step">
            <span class="ios-install-guide__step-icon">2️⃣</span>
            <span>選擇「加入主畫面」</span>
          </div>
          <div class="ios-install-guide__step">
            <span class="ios-install-guide__step-icon">3️⃣</span>
            <span>點擊右上角「新增」即完成！</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 主路由視圖 -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { usePwaInstall } from '~/composables/usePwaInstall'

const { showIosInstallGuide, dismissIosGuide } = usePwaInstall()

// 使用 @vite-pwa/nuxt 提供的 useRegisterSW 監聽更新
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(registration) {
    // Service Worker 已成功註冊
    console.log('SW registered:', registration)
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  }
})

// 是否顯示更新提示條（由 vite-pwa 的 needRefresh ref 控制）
const showUpdateBanner = needRefresh

// 觸發 Service Worker 更新
const handleUpdate = () => {
  updateServiceWorker(true)
}
</script>

<style>
/* Transition：更新條從上滑入 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Transition：iOS 引導從下滑入 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
