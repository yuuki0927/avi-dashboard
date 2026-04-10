/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ブルーネイビー (#1B3F80 ベース)
        primary: {
          50:  '#EBF1FB',
          100: '#C8D9F5',
          200: '#91B2EB',
          300: '#5A8BE0',
          400: '#2E66CC',
          500: '#1F4EA8',
          600: '#1B3F80',
          700: '#14305F',
          800: '#0D203F',
          900: '#071020',
        },
        // ウォームゴールド
        accent: {
          50:  '#FFF8EC',
          100: '#FFEECE',
          200: '#FFD98A',
          300: '#FFC24A',
          400: '#F0A820',
          500: '#C88A1A',
          600: '#A06810',
          700: '#784E0C',
          800: '#503408',
          900: '#281A04',
        },
        // サイドバー専用 (rgb(76,134,193) = #4C86C1 ベース)
        sidebar: {
          DEFAULT: '#4C86C1',  // メイン
          hover:   '#3D72A8',  // ホバー (10%暗)
          active:  '#2A5A8C',  // アクティブ項目 (20%暗・コントラスト確保)
          border:  '#4179B4',  // 区切り線
          text:    '#D6E8F7',  // 通常テキスト
          dark:    '#1F3F62',  // ロゴ下部・最暗部
        },
      },
    },
  },
  plugins: [],
}
