# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案簡介

動物學堂（Animal Academy）— 國小互動學習遊戲，支援一至三年級英文與數學題庫，具備 PWA 離線能力。

## 常用指令

```bash
npm run dev       # 啟動開發伺服器 http://localhost:3000
npm run build     # 正式環境打包
npm run preview   # 預覽打包結果
npm run generate  # 靜態輸出
```

## 架構說明

**Nuxt 4**，`srcDir` 預設為 `app/`，所以 `~` alias 指向 `app/`。

### 頁面流程

```
/ (index)
  → /grade/[grade]        # 選科目（英文 / 數學）
    → /quiz/[grade]/[subject]  # 答題主頁面
      → /result           # 成績結果頁
```

### 核心模組

- **`app/stores/quiz.ts`** — Pinia store，管理全部答題狀態（題庫、目前題索引、答題記錄、得分）。`submitAnswer()` 寫入答題結果，`answerState`（`idle / correct / wrong`）由元件本地控制。
- **`app/pages/quiz/[grade]/[subject].vue`** — 答題主邏輯。`handleAnswer()` 處理答題、觸發 `answerState` 變化與進場動畫；`goNext()` 切換下一題或跳轉結果頁。
- **`app/composables/useProgress.ts`** — 用 `localforage` 做本地進度儲存與恢復。
- **`app/composables/usePwaInstall.ts`** — 處理 PWA 安裝提示（iOS 引導 & Android install prompt）。

### 題庫資料

放在 `public/data/grade{1|2|3}_{english|math}.json`，格式：
```json
{ "questions": [{ "id": "", "question": "", "image": null, "options": [""], "answer": 0 }] }
```
`answer` 為正確選項的索引（0-based）。

### 樣式

- 全域 CSS 變數定義在 `app/assets/css/main.css`（`--color-primary`、`--radius-*`、`--shadow-*` 等）
- 各頁面使用 `<style scoped>`
- 無 CSS 框架，純手寫；動畫以 CSS `@keyframes` 為主，GSAP 已安裝但目前未使用

### PWA 快取策略

`nuxt.config.ts` 中 workbox 對 `/data/*.json` 使用 `CacheFirst`（30 天），圖片同策略放在 `/images/`。
