// ── ID カウンター ──────────────────────────────────────────────────────────────
let _nextId = 200
export const nextId = () => ++_nextId

// ── 初期データのディープコピー ─────────────────────────────────────────────────
const clone = (v) => JSON.parse(JSON.stringify(v))

// ── 料金メニュー（3階層） ─────────────────────────────────────────────────────
const INITIAL_TREE = [
  {
    id: 1, clinic_id: 1, name: '注入治療', sort_order: 0,
    sub_categories: [
      {
        id: 1, main_category_id: 1, name: 'ヒアルロン酸注入',
        description: '唇・ほうれい線・涙袋などに注入してボリュームアップ', sort_order: 0,
        items: [
          { id: 1, sub_category_id: 1, name: 'ヒアルロン酸注入', size_or_part: '1本', price: 55000, price_display: '¥55,000', sort_order: 0 },
        ],
      },
      {
        id: 2, main_category_id: 1, name: 'ボトックス',
        description: 'シワ改善・小顔効果', sort_order: 1,
        items: [
          { id: 2, sub_category_id: 2, name: 'ボトックス', size_or_part: '眉間', price: 33000, price_display: '¥33,000', sort_order: 0 },
          { id: 3, sub_category_id: 2, name: 'ボトックス', size_or_part: '額', price: 44000, price_display: '¥44,000', sort_order: 1 },
          { id: 4, sub_category_id: 2, name: 'ボトックス', size_or_part: 'エラ', price: 66000, price_display: '¥66,000', sort_order: 2 },
        ],
      },
      {
        id: 3, main_category_id: 1, name: '脂肪溶解注射',
        description: '局所的な脂肪への注入治療', sort_order: 2,
        items: [
          { id: 5, sub_category_id: 3, name: '脂肪溶解注射', size_or_part: '1部位', price: 22000, price_display: '¥22,000', sort_order: 0 },
        ],
      },
    ],
  },
  {
    id: 2, clinic_id: 1, name: 'レーザー・光治療', sort_order: 1,
    sub_categories: [
      {
        id: 4, main_category_id: 2, name: 'フォトフェイシャル',
        description: '光治療によるシミ・くすみ改善', sort_order: 0,
        items: [
          { id: 6, sub_category_id: 4, name: 'フォトフェイシャル', size_or_part: '全顔', price: 22000, price_display: '¥22,000', sort_order: 0 },
        ],
      },
      {
        id: 5, main_category_id: 2, name: 'フラクショナルレーザー',
        description: '毛穴・ニキビ跡・小じわの改善', sort_order: 1,
        items: [
          { id: 7, sub_category_id: 5, name: 'フラクショナルレーザー', size_or_part: '全顔', price: 44000, price_display: '¥44,000', sort_order: 0 },
        ],
      },
      {
        id: 6, main_category_id: 2, name: 'ピコレーザー',
        description: 'シミ・そばかすのスポット照射', sort_order: 2,
        items: [
          { id: 8, sub_category_id: 6, name: 'ピコレーザー', size_or_part: 'シミ1個', price: 16500, price_display: '¥16,500', sort_order: 0 },
        ],
      },
    ],
  },
  {
    id: 3, clinic_id: 1, name: 'リフトアップ', sort_order: 2,
    sub_categories: [
      {
        id: 7, main_category_id: 3, name: 'ウルセラ',
        description: '超音波によるリフトアップ', sort_order: 0,
        items: [
          { id: 9, sub_category_id: 7, name: 'ウルセラ', size_or_part: '額〜頬', price: 198000, price_display: '¥198,000', sort_order: 0 },
        ],
      },
      {
        id: 8, main_category_id: 3, name: 'サーマクール',
        description: '高周波によるたるみ改善', sort_order: 1,
        items: [
          { id: 10, sub_category_id: 8, name: 'サーマクール', size_or_part: '全顔', price: 330000, price_display: '¥330,000', sort_order: 0 },
        ],
      },
      {
        id: 9, main_category_id: 3, name: 'スレッドリフト',
        description: '糸によるリフトアップ施術', sort_order: 2,
        items: [
          { id: 11, sub_category_id: 9, name: 'スレッドリフト', size_or_part: '2本', price: 88000, price_display: '¥88,000', sort_order: 0 },
        ],
      },
    ],
  },
  {
    id: 4, clinic_id: 1, name: 'スキンケア', sort_order: 3,
    sub_categories: [
      {
        id: 10, main_category_id: 4, name: 'ダーマペン4',
        description: 'マイクロニードルによる肌再生', sort_order: 0,
        items: [
          { id: 12, sub_category_id: 10, name: 'ダーマペン4', size_or_part: '全顔', price: 27500, price_display: '¥27,500', sort_order: 0 },
        ],
      },
      {
        id: 11, main_category_id: 4, name: 'ケミカルピーリング',
        description: '角質ケアによる肌改善', sort_order: 1,
        items: [
          { id: 13, sub_category_id: 11, name: 'ケミカルピーリング', size_or_part: '全顔', price: 11000, price_display: '¥11,000', sort_order: 0 },
        ],
      },
      {
        id: 12, main_category_id: 4, name: 'ニードルRF',
        description: '針付き高周波による肌質改善', sort_order: 2,
        items: [
          { id: 14, sub_category_id: 12, name: 'ニードルRF', size_or_part: '全顔', price: 110000, price_display: '¥110,000', sort_order: 0 },
        ],
      },
    ],
  },
  {
    id: 5, clinic_id: 1, name: '点滴・注射', sort_order: 4,
    sub_categories: [
      {
        id: 13, main_category_id: 5, name: '美容点滴',
        description: '美白・疲労回復', sort_order: 0,
        items: [
          { id: 15, sub_category_id: 13, name: 'ビタミン点滴（美白）', size_or_part: '', price: 16500, price_display: '¥16,500', sort_order: 0 },
        ],
      },
    ],
  },
]

const INITIAL_RULES = [
  { id: 1, rule_number: 1, enabled: 1, content: '返信は簡潔に。情報のまとまりごとに改行を入れて読みやすくする。' },
  { id: 2, rule_number: 2, enabled: 1, content: '料金を聞かれたら、以下の料金表の金額をそのまま答える。「カウンセリングで」とは言わない。' },
  { id: 3, rule_number: 3, enabled: 1, content: 'ダウンタイムを聞かれたら、以下のダウンタイム表を参考に具体的に答える。' },
  { id: 4, rule_number: 4, enabled: 1, content: '予約の催促（「ご予約はいかがですか？」）は、お客様が自ら予約に触れたときだけ行う。' },
  { id: 5, rule_number: 5, enabled: 1, content: '予約受付は「施術内容 → 希望日時 → お名前 → 電話番号」の順に1項目ずつ聞き、最後に復唱して確認する。' },
  { id: 6, rule_number: 6, enabled: 1, content: '予約確定後は以下の形式でメッセージを送る（予約番号は記載しない）：\n「ご予約を承りました 😊\n\n📅「日時」〇月〇日（曜日）〇時\n🩺「施術」〇〇\n\n📍 アクセスはこちら\n\n🔔 前日・当日にリマインドいたします。」' },
  { id: 7, rule_number: 7, enabled: 1, content: '過去の会話履歴は常に参照し、前回の内容を活かして継続的な会話を心がける。' },
]

const INITIAL_CLINIC = {
  id: 1,
  name: 'メディアージュクリニック大阪梅田院',
  specialty: '美容皮膚科・エイジングマネジメント',
  hours: '10:00〜19:00（不定休・完全予約制）',
  closed_days: '不定休',
  map_url: 'https://www.google.com/maps?q=メディアージュクリニック大阪梅田院',
  initial_fee: '2,200円',
  revisit_fee: '2,200円（1年以上空いた場合）',
  counseling: '無料',
  features: '美容医療初心者でも気軽に来院できる。患者様の話をじっくり聞く。靴を脱いで畳に上がる和の空間。',
}

const INITIAL_PROMPT = {
  prompt: '',
  use_override: false,
  current_prompt: '[モック] 対応ルールに基づくシステムプロンプトが適用されています。',
}

// ── メモリストア（ページリロードでリセット）─────────────────────────────────
export const store = {
  priceTree: clone(INITIAL_TREE),
  rules: clone(INITIAL_RULES),
  clinicInfo: clone(INITIAL_CLINIC),
  prompt: clone(INITIAL_PROMPT),
}
