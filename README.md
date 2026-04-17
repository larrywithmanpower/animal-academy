# 動物學堂 Animal Academy

國小互動學習遊戲 PWA，支援幼幼班至三年級英文與數學學習。

## 線上體驗

**https://larrywithmanpower.github.io/animal-academy/**

> 支援加入手機主畫面（PWA），可離線使用。

---

## 功能總覽

### 幼幼班（看圖學單字）
- 顯示大型 emoji 圖案，選出正確英文單字
- 100 題圖卡題庫，涵蓋：動物、食物、飲品、顏色、衣物、天氣、居家物品、身體部位、交通工具等
- 每局隨機抽 10 題，四個彩色大按鈕（適合幼兒點擊）

### 一至三年級
| 年級 | 英文 | 數學 |
|------|------|------|
| 一年級 | 基礎單字、反義詞、動物、顏色 | 20 以內加減法、奇偶數 |
| 二年級 | 文法（has/have、複數）、星期月份、介係詞 | 九九乘法、除法、測量、幾何 |
| 三年級 | 過去式、比較級最高級、字彙、副詞 | 多位數乘除、分數、小數、面積周長 |

- 各科目 **50 題題庫**，每局隨機抽 10 題，每次玩順序不同

### 答題體驗
- **音效回饋**：答對播放上行歡快音階；答錯播放輕柔下行音（Web Audio API 合成，不需下載音效檔）
- **動物吉祥物互動**：點擊吉祥物發出對應音效 + 對話氣泡
  - 一年級 🐱 → 貓叫 + 「喵～」
  - 二年級 🐶 → 狗吠 + 「汪汪！」
  - 三年級 🐻 → 熊吼 + 「吼～」

### 錯題重考
- 每次答題結束後，自動記錄答錯的題目
- 結果頁顯示「**重考錯題（N 題）**」按鈕
- 點擊後只出現本輪答錯的題目，讓小朋友重新練習
- 若重考全對，顯示「🎉 全部答對了！真棒！」

### 結果頁
- 顯示得分、答對率、金銀銅評語
- 完整答題明細（每題對錯一覽）
- 可再玩一次（重新從完整題庫抽題）、換科目、回首頁

### PWA
- 可安裝至 iOS / Android 主畫面
- Workbox 快取題庫 JSON（CacheFirst，30 天），離線可用
- 推送 `main` 分支後 GitHub Actions 自動部署至 GitHub Pages

---

## 本地開發

```bash
npm install
npm run dev      # 開發伺服器 http://localhost:3000
npm run build    # 正式環境打包
npm run generate # 靜態輸出（用於部署）
```

## 專案結構

```
app/
  pages/
    index.vue              # 首頁（年級 + 幼幼班選擇）
    kindergarten.vue       # 幼幼班看圖學單字
    grade/[grade].vue      # 科目選擇頁
    quiz/[grade]/[subject].vue  # 答題主頁面
    result.vue             # 成績結果頁
  stores/
    quiz.ts                # 全域答題狀態（Pinia）
  composables/
    useSound.ts            # Web Audio API 音效合成
    useProgress.ts         # localforage 進度儲存
    usePwaInstall.ts       # PWA 安裝引導

public/data/
  grade0_english.json      # 幼幼班圖卡（100 題）
  grade1_english.json      # 一年級英文（50 題）
  grade1_math.json         # 一年級數學（50 題）
  grade2_english.json      # 二年級英文（50 題）
  grade2_math.json         # 二年級數學（50 題）
  grade3_english.json      # 三年級英文（50 題）
  grade3_math.json         # 三年級數學（50 題）
```

## 部署

推送到 `main` 分支後，GitHub Actions 自動執行 `nuxt generate` 並部署至 GitHub Pages。
