// ==================== クリニック一覧 ====================
export const clinics = [
  {
    id: 1,
    name: '表参道メディエイジクリニック',
    address: '東京都渋谷区神宮前5-10-2 表参道ヒルズ本館B2F',
    mapLink: 'https://maps.google.com/?q=表参道ヒルズ',
    hours: '10:00〜20:00（最終受付 19:30）',
    closedDays: '毎週火曜日・第2水曜日',
    phone: '03-1234-5678',
    email: 'omotesando@mediage.jp',
  },
  {
    id: 2,
    name: '銀座メディエイジクリニック',
    address: '東京都中央区銀座6-10-1 GINZA SIX 5F',
    mapLink: 'https://maps.google.com/?q=GINZA+SIX',
    hours: '11:00〜21:00（最終受付 20:30）',
    closedDays: '毎週月曜日・不定休',
    phone: '03-9876-5432',
    email: 'ginza@mediage.jp',
  },
]

// ==================== スタッフデータ ====================
export const staff = [
  { id: 1, name: '山田 太郎', role: 'doctor', specialty: '美容外科・レーザー治療' },
  { id: 2, name: '鈴木 花子', role: 'doctor', specialty: '美容皮膚科・注入治療' },
  { id: 3, name: '田中 美咲', role: 'counselor', department: 'カウンセリング' },
  { id: 4, name: '佐藤 あかり', role: 'counselor', department: 'カウンセリング' },
]

// ==================== メニューデータ ====================
export const menus = [
  { id: 1, name: 'ヒアルロン酸注入（1本）', price: 55000, downtime: '1〜3日', description: '唇・ほうれい線・涙袋などに注入してボリュームアップ', category: '注入' },
  { id: 2, name: 'ボトックス（眉間）', price: 33000, downtime: 'なし', description: '眉間のシワに対するボトックス注入', category: '注入' },
  { id: 3, name: 'ボトックス（額）', price: 44000, downtime: 'なし', description: '額のシワに対するボトックス注入', category: '注入' },
  { id: 4, name: 'ボトックス（エラ）', price: 66000, downtime: 'なし', description: 'エラ張りの改善・小顔効果', category: '注入' },
  { id: 5, name: 'フォトフェイシャル（全顔）', price: 22000, downtime: '1〜2日', description: '光治療によるシミ・くすみ改善', category: 'レーザー' },
  { id: 6, name: 'フラクショナルレーザー', price: 44000, downtime: '3〜5日', description: '毛穴・ニキビ跡・小じわの改善', category: 'レーザー' },
  { id: 7, name: 'ピコレーザー（シミ1個）', price: 16500, downtime: '1週間', description: 'シミ・そばかすのスポット照射', category: 'レーザー' },
  { id: 8, name: 'ウルセラ（額〜頬）', price: 198000, downtime: '1〜3日', description: '超音波によるリフトアップ', category: 'リフトアップ' },
  { id: 9, name: 'サーマクール（全顔）', price: 330000, downtime: 'なし', description: '高周波によるたるみ改善', category: 'リフトアップ' },
  { id: 10, name: 'スレッドリフト（2本）', price: 88000, downtime: '1週間', description: '糸によるリフトアップ施術', category: 'リフトアップ' },
  { id: 11, name: 'ダーマペン4', price: 27500, downtime: '2〜3日', description: 'マイクロニードルによる肌再生', category: 'スキンケア' },
  { id: 12, name: 'ケミカルピーリング', price: 11000, downtime: '1〜3日', description: '角質ケアによる肌改善', category: 'スキンケア' },
  { id: 13, name: 'ビタミン点滴（美白）', price: 16500, downtime: 'なし', description: '高濃度ビタミンC点滴', category: '点滴・注射' },
  { id: 14, name: '脂肪溶解注射（1部位）', price: 22000, downtime: '3〜7日', description: '局所的な脂肪への注入治療', category: '注入' },
  { id: 15, name: 'ニードルRF（全顔）', price: 110000, downtime: '3〜5日', description: '針付き高周波による肌質改善', category: 'スキンケア' },
]

// ==================== 顧客データ ====================
export const customers = [
  {
    id: 1, name: '佐々木 莉子', lineId: 'U1a2b3c4', visitCount: 8, lastVisit: '2026-03-15',
    totalSpend: 385000, age: 35, gender: 'female',
    treatments: ['ヒアルロン酸注入', 'ボトックス（眉間）', 'フォトフェイシャル'],
    tags: ['VIP', '注入系'],
  },
  {
    id: 2, name: '山本 優花', lineId: 'U2b3c4d5', visitCount: 5, lastVisit: '2026-03-20',
    totalSpend: 154000, age: 28, gender: 'female',
    treatments: ['フォトフェイシャル', 'ダーマペン4', 'ケミカルピーリング'],
    tags: ['VIP', 'レーザー系'],
  },
  {
    id: 3, name: '田村 智子', lineId: 'U3c4d5e6', visitCount: 1, lastVisit: '2026-03-25',
    totalSpend: 22000, age: 42, gender: 'female',
    treatments: ['フォトフェイシャル（全顔）'],
    tags: ['新規'],
  },
  {
    id: 4, name: '木村 健太', lineId: 'U4d5e6f7', visitCount: 2, lastVisit: '2025-12-10',
    totalSpend: 77000, age: 38, gender: 'male',
    treatments: ['ボトックス（エラ）', 'フォトフェイシャル'],
    tags: ['要フォロー'],
  },
  {
    id: 5, name: '中村 彩花', lineId: 'U5e6f7g8', visitCount: 4, lastVisit: '2026-02-28',
    totalSpend: 132000, age: 31, gender: 'female',
    treatments: ['ヒアルロン酸注入', 'ボトックス（額）', 'ダーマペン4'],
    tags: ['VIP', '注入系'],
  },
  {
    id: 6, name: '林 浩二', lineId: 'U6f7g8h9', visitCount: 1, lastVisit: '2026-03-22',
    totalSpend: 33000, age: 45, gender: 'male',
    treatments: ['ボトックス（眉間）'],
    tags: ['新規'],
  },
  {
    id: 7, name: '加藤 みなみ', lineId: 'U7g8h9i0', visitCount: 3, lastVisit: '2026-01-15',
    totalSpend: 89000, age: 26, gender: 'female',
    treatments: ['ピコレーザー', 'ケミカルピーリング', 'ビタミン点滴'],
    tags: ['要フォロー', 'レーザー系'],
  },
  {
    id: 8, name: '伊藤 さくら', lineId: 'U8h9i0j1', visitCount: 6, lastVisit: '2026-03-18',
    totalSpend: 264000, age: 33, gender: 'female',
    treatments: ['ウルセラ', 'ヒアルロン酸注入', 'ボトックス'],
    tags: ['VIP', 'リフトアップ系'],
  },
  {
    id: 9, name: '渡辺 恵美', lineId: 'U9i0j1k2', visitCount: 2, lastVisit: '2026-03-05',
    totalSpend: 55000, age: 39, gender: 'female',
    treatments: ['ヒアルロン酸注入', 'フォトフェイシャル'],
    tags: ['リピーター'],
  },
  {
    id: 10, name: '小林 大輔', lineId: 'U0j1k2l3', visitCount: 1, lastVisit: '2025-11-20',
    totalSpend: 66000, age: 47, gender: 'male',
    treatments: ['ボトックス（エラ）'],
    tags: ['要フォロー'],
  },
  {
    id: 11, name: '吉田 のぞみ', lineId: 'Uk1l2m3n', visitCount: 7, lastVisit: '2026-03-10',
    totalSpend: 418000, age: 29, gender: 'female',
    treatments: ['サーマクール', 'ヒアルロン酸注入', 'ボトックス'],
    tags: ['VIP', 'リフトアップ系'],
  },
  {
    id: 12, name: '松本 亜希子', lineId: 'Ul2m3n4o', visitCount: 3, lastVisit: '2026-02-14',
    totalSpend: 110000, age: 36, gender: 'female',
    treatments: ['フラクショナルレーザー', 'ダーマペン4'],
    tags: ['VIP', 'レーザー系'],
  },
  {
    id: 13, name: '坂本 真一', lineId: 'Um3n4o5p', visitCount: 2, lastVisit: '2026-03-01',
    totalSpend: 44000, age: 52, gender: 'male',
    treatments: ['ボトックス（額）', 'フォトフェイシャル'],
    tags: ['リピーター'],
  },
  {
    id: 14, name: '浜田 桃子', lineId: 'Un4o5p6q', visitCount: 1, lastVisit: '2026-03-28',
    totalSpend: 16500, age: 24, gender: 'female',
    treatments: ['ケミカルピーリング'],
    tags: ['新規'],
  },
  {
    id: 15, name: '藤田 雄介', lineId: 'Uo5p6q7r', visitCount: 4, lastVisit: '2025-10-05',
    totalSpend: 176000, age: 41, gender: 'male',
    treatments: ['スレッドリフト', 'ボトックス（エラ）'],
    tags: ['要フォロー', 'VIP'],
  },
  {
    id: 16, name: '竹内 あずさ', lineId: 'Up6q7r8s', visitCount: 2, lastVisit: '2026-03-12',
    totalSpend: 38500, age: 27, gender: 'female',
    treatments: ['ダーマペン4', 'ビタミン点滴'],
    tags: ['リピーター'],
  },
  {
    id: 17, name: '三浦 千春', lineId: 'Uq7r8s9t', visitCount: 5, lastVisit: '2026-03-23',
    totalSpend: 231000, age: 34, gender: 'female',
    treatments: ['ヒアルロン酸注入', 'ウルセラ', 'フォトフェイシャル'],
    tags: ['VIP'],
  },
  {
    id: 18, name: '橋本 翔太', lineId: 'Ur8s9t0u', visitCount: 1, lastVisit: '2026-03-26',
    totalSpend: 22000, age: 32, gender: 'male',
    treatments: ['フォトフェイシャル（全顔）'],
    tags: ['新規'],
  },
  {
    id: 19, name: '岡田 麻衣', lineId: 'Us9t0u1v', visitCount: 3, lastVisit: '2026-01-30',
    totalSpend: 99000, age: 30, gender: 'female',
    treatments: ['ピコレーザー', 'ケミカルピーリング', 'ダーマペン4'],
    tags: ['要フォロー'],
  },
  {
    id: 20, name: '西村 京子', lineId: 'Ut0u1v2w', visitCount: 9, lastVisit: '2026-03-27',
    totalSpend: 572000, age: 44, gender: 'female',
    treatments: ['サーマクール', 'ヒアルロン酸注入', 'ボトックス', 'ウルセラ'],
    tags: ['VIP', 'リフトアップ系'],
  },
  {
    id: 21, name: '石田 かな', lineId: 'Uu1v2w3x', visitCount: 2, lastVisit: '2026-02-20',
    totalSpend: 49500, age: 23, gender: 'female',
    treatments: ['ケミカルピーリング', 'ビタミン点滴'],
    tags: ['リピーター'],
  },
  {
    id: 22, name: '前田 洋平', lineId: 'Uv2w3x4y', visitCount: 1, lastVisit: '2026-03-20',
    totalSpend: 55000, age: 48, gender: 'male',
    treatments: ['ヒアルロン酸注入（1本）'],
    tags: ['新規'],
  },
]

// ==================== 予約データ ====================
export const appointments = [
  { id: 1, date: '2026-03-28', time: '10:00', customerName: '佐々木 莉子', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '確定' },
  { id: 2, date: '2026-03-28', time: '11:00', customerName: '山本 優花', treatment: 'フォトフェイシャル', amount: 22000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '確定' },
  { id: 3, date: '2026-03-28', time: '13:00', customerName: '浜田 桃子', treatment: 'ケミカルピーリング', amount: 11000, doctor: '鈴木 花子', counselor: '田中 美咲', status: '確定' },
  { id: 4, date: '2026-03-28', time: '14:00', customerName: '橋本 翔太', treatment: 'フォトフェイシャル（全顔）', amount: 22000, doctor: '山田 太郎', counselor: '佐藤 あかり', status: '確定' },
  { id: 5, date: '2026-03-27', time: '10:30', customerName: '西村 京子', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 6, date: '2026-03-27', time: '12:00', customerName: '三浦 千春', treatment: 'フォトフェイシャル', amount: 22000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 7, date: '2026-03-26', time: '15:00', customerName: '伊藤 さくら', treatment: 'ウルセラ', amount: 198000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 8, date: '2026-03-25', time: '11:00', customerName: '田村 智子', treatment: 'フォトフェイシャル（全顔）', amount: 22000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 9, date: '2026-03-24', time: '14:30', customerName: '吉田 のぞみ', treatment: 'ボトックス（額）', amount: 44000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 10, date: '2026-03-23', time: '10:00', customerName: '三浦 千春', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 11, date: '2026-03-22', time: '13:00', customerName: '林 浩二', treatment: 'ボトックス（眉間）', amount: 33000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 12, date: '2026-03-21', time: '15:30', customerName: '吉田 のぞみ', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 13, date: '2026-03-20', time: '11:00', customerName: '山本 優花', treatment: 'ダーマペン4', amount: 27500, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 14, date: '2026-03-20', time: '13:30', customerName: '前田 洋平', treatment: 'ヒアルロン酸注入（1本）', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 15, date: '2026-03-18', time: '10:00', customerName: '伊藤 さくら', treatment: 'ボトックス（眉間）', amount: 33000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 16, date: '2026-03-15', time: '14:00', customerName: '佐々木 莉子', treatment: 'ボトックス（眉間）', amount: 33000, doctor: '鈴木 花子', counselor: '田中 美咲', status: '完了' },
  { id: 17, date: '2026-03-12', time: '11:30', customerName: '吉田 のぞみ', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 18, date: '2026-03-10', time: '10:00', customerName: '竹内 あずさ', treatment: 'ダーマペン4', amount: 27500, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 19, date: '2026-03-10', time: '13:00', customerName: '吉田 のぞみ', treatment: 'サーマクール', amount: 330000, doctor: '山田 太郎', counselor: '田中 美咲', status: 'キャンセル' },
  { id: 20, date: '2026-03-08', time: '15:00', customerName: '中村 彩花', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '佐藤 あかり', status: '完了' },
  { id: 21, date: '2026-03-05', time: '11:00', customerName: '渡辺 恵美', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 22, date: '2026-03-01', time: '14:00', customerName: '坂本 真一', treatment: 'フォトフェイシャル', amount: 22000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 23, date: '2026-02-28', time: '10:30', customerName: '中村 彩花', treatment: 'ボトックス（額）', amount: 44000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 24, date: '2026-02-20', time: '13:00', customerName: '石田 かな', treatment: 'ビタミン点滴', amount: 16500, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 25, date: '2026-02-14', time: '15:00', customerName: '松本 亜希子', treatment: 'ダーマペン4', amount: 27500, doctor: '鈴木 花子', counselor: '田中 美咲', status: '完了' },
  { id: 26, date: '2026-02-10', time: '11:00', customerName: '三浦 千春', treatment: 'ウルセラ', amount: 198000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 27, date: '2026-01-30', time: '14:00', customerName: '岡田 麻衣', treatment: 'ピコレーザー', amount: 16500, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 28, date: '2026-01-15', time: '10:00', customerName: '加藤 みなみ', treatment: 'ケミカルピーリング', amount: 11000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 29, date: '2026-01-10', time: '13:00', customerName: '竹内 あずさ', treatment: 'ケミカルピーリング', amount: 11000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 30, date: '2025-12-20', time: '15:00', customerName: '西村 京子', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '完了' },
  { id: 31, date: '2025-12-10', time: '11:30', customerName: '木村 健太', treatment: 'フォトフェイシャル', amount: 22000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '完了' },
  { id: 32, date: '2026-03-29', time: '10:00', customerName: '佐々木 莉子', treatment: 'ヒアルロン酸注入', amount: 55000, doctor: '山田 太郎', counselor: '田中 美咲', status: '確定' },
  { id: 33, date: '2026-03-29', time: '14:00', customerName: '西村 京子', treatment: 'ボトックス', amount: 44000, doctor: '鈴木 花子', counselor: '佐藤 あかり', status: '確定' },
]

// ==================== 日次売上データ ====================
export const dailySalesData = [
  { date: '3/1', sales: 66000 },
  { date: '3/2', sales: 88000 },
  { date: '3/3', sales: 44000 },
  { date: '3/4', sales: 0 },
  { date: '3/5', sales: 110000 },
  { date: '3/6', sales: 132000 },
  { date: '3/7', sales: 55000 },
  { date: '3/8', sales: 77000 },
  { date: '3/9', sales: 99000 },
  { date: '3/10', sales: 385000 },
  { date: '3/11', sales: 44000 },
  { date: '3/12', sales: 82500 },
  { date: '3/13', sales: 66000 },
  { date: '3/14', sales: 110000 },
  { date: '3/15', sales: 88000 },
  { date: '3/16', sales: 55000 },
  { date: '3/17', sales: 33000 },
  { date: '3/18', sales: 253000 },
  { date: '3/19', sales: 77000 },
  { date: '3/20', sales: 137500 },
  { date: '3/21', sales: 55000 },
  { date: '3/22', sales: 33000 },
  { date: '3/23', sales: 55000 },
  { date: '3/24', sales: 44000 },
  { date: '3/25', sales: 22000 },
  { date: '3/26', sales: 198000 },
  { date: '3/27', sales: 77000 },
  { date: '3/28', sales: 110000 },
]

// ==================== 月次売上データ ====================
export const monthlySalesData = [
  { month: '2025/4', sales: 1980000, newPatients: 12, repeatPatients: 28 },
  { month: '2025/5', sales: 2310000, newPatients: 15, repeatPatients: 32 },
  { month: '2025/6', sales: 2145000, newPatients: 11, repeatPatients: 30 },
  { month: '2025/7', sales: 2640000, newPatients: 18, repeatPatients: 35 },
  { month: '2025/8', sales: 2860000, newPatients: 20, repeatPatients: 38 },
  { month: '2025/9', sales: 2475000, newPatients: 14, repeatPatients: 33 },
  { month: '2025/10', sales: 3080000, newPatients: 22, repeatPatients: 42 },
  { month: '2025/11', sales: 3520000, newPatients: 25, repeatPatients: 48 },
  { month: '2025/12', sales: 4180000, newPatients: 30, repeatPatients: 55 },
  { month: '2026/1', sales: 2640000, newPatients: 16, repeatPatients: 36 },
  { month: '2026/2', sales: 2970000, newPatients: 19, repeatPatients: 40 },
  { month: '2026/3', sales: 3300000, newPatients: 22, repeatPatients: 45 },
]

// ==================== 年次売上データ ====================
export const yearlySalesData = [
  { year: '2022', sales: 18700000 },
  { year: '2023', sales: 24200000 },
  { year: '2024', sales: 31500000 },
  { year: '2025', sales: 39600000 },
  { year: '2026', sales: 12100000 },
]

// ==================== 施術別売上 ====================
export const treatmentSalesData = [
  { name: 'ヒアルロン酸注入', sales: 825000 },
  { name: 'ウルセラ', sales: 594000 },
  { name: 'サーマクール', sales: 330000 },
  { name: 'ボトックス（エラ）', sales: 264000 },
  { name: 'ダーマペン4', sales: 192500 },
  { name: 'ボトックス（額）', sales: 176000 },
  { name: 'フォトフェイシャル', sales: 154000 },
  { name: 'フラクショナルレーザー', sales: 132000 },
  { name: 'スレッドリフト', sales: 88000 },
  { name: 'ピコレーザー', sales: 66000 },
]

// ==================== ドクター別売上 ====================
export const doctorSalesData = [
  { name: '山田 太郎', sales: 2090000, patients: 38 },
  { name: '鈴木 花子', sales: 1210000, patients: 29 },
]

// ==================== カウンセラー別売上 ====================
export const counselorSalesData = [
  { name: '田中 美咲', sales: 1815000, patients: 35 },
  { name: '佐藤 あかり', sales: 1485000, patients: 32 },
]

// ==================== リピート率データ ====================
export const repeatRateData = [
  { month: '2025/4', rate: 62 },
  { month: '2025/5', rate: 65 },
  { month: '2025/6', rate: 63 },
  { month: '2025/7', rate: 68 },
  { month: '2025/8', rate: 71 },
  { month: '2025/9', rate: 69 },
  { month: '2025/10', rate: 74 },
  { month: '2025/11', rate: 76 },
  { month: '2025/12', sales: 79, rate: 79 },
  { month: '2026/1', rate: 72 },
  { month: '2026/2', rate: 75 },
  { month: '2026/3', rate: 77 },
]

// ==================== チャーンレートデータ ====================
export const churnRateData = [
  { month: '2025/4', rate: 18 },
  { month: '2025/5', rate: 16 },
  { month: '2025/6', rate: 17 },
  { month: '2025/7', rate: 15 },
  { month: '2025/8', rate: 14 },
  { month: '2025/9', rate: 15 },
  { month: '2025/10', rate: 13 },
  { month: '2025/11', rate: 12 },
  { month: '2025/12', rate: 11 },
  { month: '2026/1', rate: 14 },
  { month: '2026/2', rate: 13 },
  { month: '2026/3', rate: 12 },
]

// ==================== 時間帯別予約数 ====================
export const hourlyAppointments = [
  { hour: '10:00', count: 8 },
  { hour: '11:00', count: 12 },
  { hour: '12:00', count: 5 },
  { hour: '13:00', count: 10 },
  { hour: '14:00', count: 14 },
  { hour: '15:00', count: 11 },
  { hour: '16:00', count: 9 },
  { hour: '17:00', count: 7 },
  { hour: '18:00', count: 6 },
  { hour: '19:00', count: 4 },
]

// ==================== 年代別分布 ====================
export const ageDistribution = [
  { name: '20代', value: 28 },
  { name: '30代', value: 38 },
  { name: '40代', value: 22 },
  { name: '50代', value: 9 },
  { name: '60代以上', value: 3 },
]

// ==================== 初再診比率 ====================
export const newVsRepeatData = [
  { name: '初診', value: 22 },
  { name: '再診', value: 78 },
]

// ==================== キャンペーンROI ====================
export const campaignROIData = [
  { name: '春の新生活キャンペーン', investment: 50000, revenue: 385000, roi: 670 },
  { name: 'VIP限定ボトックス', investment: 30000, revenue: 198000, roi: 560 },
  { name: 'フォトフェイシャル初回割引', investment: 20000, revenue: 110000, roi: 450 },
  { name: 'ヒアルロン酸セット割', investment: 40000, revenue: 220000, roi: 450 },
  { name: 'リピーター感謝クーポン', investment: 25000, revenue: 132000, roi: 428 },
]

// ==================== キャンペーンデータ ====================
export const campaigns = [
  {
    id: 1,
    title: '春の新生活キャンペーン',
    description: '春から始める美容習慣。対象施術が最大20%OFF！期間限定のお得なキャンペーンです。',
    price: 'フォトフェイシャル 17,600円（税込）',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    target: '全員',
    maxUses: 50,
    usedCount: 32,
    status: 'active',
    abPatterns: [
      { label: 'パターンA', title: '春の美活キャンペーン', ctr: 3.2, cvr: 12.5 },
      { label: 'パターンB', title: '新生活応援！美容スタート', ctr: 4.1, cvr: 15.8 },
    ],
  },
  {
    id: 2,
    title: 'VIP限定ボトックス特別価格',
    description: 'VIP会員様への感謝を込めた特別価格。ボトックス全部位が15%OFF。',
    price: '眉間 28,050円〜（税込）',
    startDate: '2026-03-15',
    endDate: '2026-03-31',
    target: 'VIPタグ',
    maxUses: 20,
    usedCount: 17,
    status: 'active',
    abPatterns: [
      { label: 'パターンA', title: 'VIP感謝祭ボトックス15%OFF', ctr: 5.8, cvr: 22.3 },
      { label: 'パターンB', title: '特別価格でボトックスを', ctr: 4.9, cvr: 18.7 },
    ],
  },
  {
    id: 3,
    title: '初診限定フォトフェイシャル割引',
    description: '初めてご来院の方限定。フォトフェイシャルが初回20%OFFでお試しいただけます。',
    price: '17,600円（税込・通常22,000円）',
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    target: '初診限定',
    maxUses: 100,
    usedCount: 45,
    status: 'active',
    abPatterns: [
      { label: 'パターンA', title: '初診20%OFF！フォトフェイシャル', ctr: 2.9, cvr: 10.2 },
      { label: 'パターンB', title: 'まずは試してみませんか？', ctr: 3.5, cvr: 13.8 },
    ],
  },
  {
    id: 4,
    title: 'リピーター感謝クーポン',
    description: '2回以上ご来院のお客様へ。次回施術で使える5,000円OFFクーポンをプレゼント。',
    price: '5,000円OFFクーポン',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    target: 'リピーター限定',
    maxUses: 200,
    usedCount: 89,
    status: 'active',
    abPatterns: [
      { label: 'パターンA', title: 'いつもありがとうございます5,000円OFF', ctr: 6.2, cvr: 28.4 },
      { label: 'パターンB', title: 'リピーター様専用クーポン', ctr: 5.5, cvr: 24.1 },
    ],
  },
  {
    id: 5,
    title: '年末年始特別コース',
    description: '年末年始に向けて美しく。ヒアルロン酸＋ボトックスのコンビ施術がお得。',
    price: '77,000円（税込・通常88,000円）',
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    target: '全員',
    maxUses: 30,
    usedCount: 30,
    status: 'ended',
    abPatterns: [
      { label: 'パターンA', title: '年末特別コース', ctr: 4.4, cvr: 19.6 },
      { label: 'パターンB', title: '年越し美容プラン', ctr: 3.8, cvr: 16.2 },
    ],
  },
]

// ==================== シフトデータ ====================
export const shiftData = {
  weekStart: '2026-03-23',
  shifts: [
    { staffId: 1, staffName: '山田 太郎', role: 'doctor', schedule: ['出勤', '出勤', '休み', '出勤', '出勤', '出勤', '休み'] },
    { staffId: 2, staffName: '鈴木 花子', role: 'doctor', schedule: ['出勤', '休み', '出勤', '出勤', '出勤', '休み', '出勤'] },
    { staffId: 3, staffName: '田中 美咲', role: 'counselor', schedule: ['出勤', '出勤', '出勤', '休み', '出勤', '出勤', '休み'] },
    { staffId: 4, staffName: '佐藤 あかり', role: 'counselor', schedule: ['休み', '出勤', '出勤', '出勤', '休み', '出勤', '出勤'] },
  ],
}

// ==================== 通知データ ====================
export const notifications = [
  { id: 1, type: 'inventory', message: 'ウルセラの枠が残り2枠です', time: '10分前', urgent: true },
  { id: 2, type: 'campaign', message: '「VIP限定ボトックス」の終了まであと3日です', time: '1時間前', urgent: true },
  { id: 3, type: 'cancel', message: '渡辺 恵美 様が3/30 14:00の予約をキャンセルされました', time: '2時間前', urgent: false },
  { id: 4, type: 'campaign', message: '「春の新生活キャンペーン」の残り枠が18枠になりました', time: '3時間前', urgent: false },
  { id: 5, type: 'cancel', message: '加藤 みなみ 様が4/2 11:00の予約をキャンセルされました', time: '昨日', urgent: false },
]
