// PWA 相關功能：iOS 安裝引導、SW 更新通知
export const usePwaInstall = () => {
  // 是否顯示 iOS 安裝提示
  const showIosInstallGuide = ref(false)
  // 是否顯示 SW 更新通知條
  const showUpdateBanner = ref(false)

  // 偵測是否為 iOS Safari 且尚未安裝
  const detectIosInstall = () => {
    if (import.meta.client) {
      const isIos =
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isNavigatorStandalone = 'standalone' in navigator && (navigator as Navigator & { standalone: boolean }).standalone

      // 只在 iOS Safari 且未安裝時顯示
      if (isIos && !isInStandalone && !isNavigatorStandalone) {
        // 確認使用者尚未關閉過此提示
        const dismissed = sessionStorage.getItem('ios_install_dismissed')
        if (!dismissed) {
          showIosInstallGuide.value = true
        }
      }
    }
  }

  // 關閉 iOS 安裝提示
  const dismissIosGuide = () => {
    showIosInstallGuide.value = false
    if (import.meta.client) {
      sessionStorage.setItem('ios_install_dismissed', '1')
    }
  }

  // 關閉更新通知
  const dismissUpdateBanner = () => {
    showUpdateBanner.value = false
  }

  // 觸發 SW 更新
  const triggerUpdate = () => {
    if (import.meta.client) {
      window.location.reload()
    }
  }

  // 使用 @vite-pwa/nuxt 提供的 useRegisterSW
  onMounted(() => {
    detectIosInstall()
  })

  return {
    showIosInstallGuide,
    showUpdateBanner,
    dismissIosGuide,
    dismissUpdateBanner,
    triggerUpdate
  }
}
