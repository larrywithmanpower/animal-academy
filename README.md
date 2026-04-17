# 動物學堂 Animal Academy

國小互動學習遊戲，支援一至三年級英文與數學題庫，具備 PWA 離線能力。

## 線上體驗

**https://larrywithmanpower.github.io/animal-academy/**

> 支援手機加入主畫面（PWA），可離線使用。

## 功能特色

- 一至三年級英文、數學題庫，各 50 題，每局隨機抽 10 題
- 答對／答錯音效回饋（Web Audio API 合成，不需下載）
- 點擊動物吉祥物互動：貓叫、狗吠、熊吼
- 答題完成後顯示得分與明細
- PWA：可安裝至手機主畫面、離線可用

## 本地開發

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 正式環境打包
npm run generate # 靜態輸出
```

## 部署

推送到 `main` 分支後，GitHub Actions 自動部署至 GitHub Pages。
