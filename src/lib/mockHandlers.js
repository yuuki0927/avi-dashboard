// Mock API handler — routes fake requests to in-memory store
import { store, nextId } from './mockStore.js'

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms))

export async function mockRequest(method, url, data) {
  await delay()
  // Strip origin so we match just the path
  const path = url.replace(/^https?:\/\/[^/]+/, '')

  // ── GET /api/settings/price-menu ──────────────────────────────────────────
  if (method === 'get' && /\/price-menu/.test(path)) {
    return { data: store.priceTree }
  }

  // ── main-categories ───────────────────────────────────────────────────────
  const mainIdMatch = path.match(/\/main-categories\/(\d+)/)
  if (mainIdMatch) {
    const id = parseInt(mainIdMatch[1])
    if (method === 'put') {
      const mc = store.priceTree.find(m => m.id === id)
      if (mc) Object.assign(mc, { name: data.name })
      return { data: mc }
    }
    if (method === 'delete') {
      store.priceTree = store.priceTree.filter(m => m.id !== id)
      return { data: { ok: true } }
    }
  }
  if (/\/main-categories$/.test(path) && method === 'post') {
    const mc = {
      id: nextId(),
      clinic_id: data.clinic_id,
      name: data.name,
      sort_order: store.priceTree.length,
      sub_categories: [],
    }
    store.priceTree.push(mc)
    return { data: mc }
  }

  // ── sub-categories ────────────────────────────────────────────────────────
  const subIdMatch = path.match(/\/sub-categories\/(\d+)/)
  if (subIdMatch) {
    const id = parseInt(subIdMatch[1])
    if (method === 'put') {
      for (const mc of store.priceTree) {
        const sub = mc.sub_categories.find(s => s.id === id)
        if (sub) {
          Object.assign(sub, { name: data.name, description: data.description ?? sub.description, main_category_id: data.main_category_id ?? sub.main_category_id })
          return { data: sub }
        }
      }
    }
    if (method === 'delete') {
      for (const mc of store.priceTree) {
        const idx = mc.sub_categories.findIndex(s => s.id === id)
        if (idx !== -1) {
          mc.sub_categories.splice(idx, 1)
          return { data: { ok: true } }
        }
      }
    }
  }
  if (/\/sub-categories$/.test(path) && method === 'post') {
    const mc = store.priceTree.find(m => m.id === data.main_category_id)
    if (!mc) throw new Error('[mock] main category not found')
    const sub = {
      id: nextId(),
      main_category_id: data.main_category_id,
      name: data.name,
      description: data.description || '',
      sort_order: mc.sub_categories.length,
      items: [],
    }
    mc.sub_categories.push(sub)
    return { data: sub }
  }

  // ── price-items ───────────────────────────────────────────────────────────
  const itemIdMatch = path.match(/\/price-items\/(\d+)/)
  if (itemIdMatch) {
    const id = parseInt(itemIdMatch[1])
    if (method === 'put') {
      for (const mc of store.priceTree) {
        for (const sub of mc.sub_categories) {
          const item = sub.items.find(i => i.id === id)
          if (item) {
            Object.assign(item, { name: data.name, size_or_part: data.size_or_part ?? item.size_or_part, price: data.price, price_display: data.price_display })
            return { data: item }
          }
        }
      }
    }
    if (method === 'delete') {
      for (const mc of store.priceTree) {
        for (const sub of mc.sub_categories) {
          const idx = sub.items.findIndex(i => i.id === id)
          if (idx !== -1) {
            sub.items.splice(idx, 1)
            return { data: { ok: true } }
          }
        }
      }
    }
  }
  if (/\/price-items$/.test(path) && method === 'post') {
    for (const mc of store.priceTree) {
      const sub = mc.sub_categories.find(s => s.id === data.sub_category_id)
      if (sub) {
        const item = {
          id: nextId(),
          sub_category_id: data.sub_category_id,
          name: data.name,
          size_or_part: data.size_or_part || '',
          price: data.price,
          price_display: data.price_display,
          sort_order: sub.items.length,
        }
        sub.items.push(item)
        return { data: item }
      }
    }
    throw new Error('[mock] sub category not found')
  }

  // ── rules ─────────────────────────────────────────────────────────────────
  if (/\/rules$/.test(path)) {
    if (method === 'get') return { data: store.rules }
    if (method === 'put') {
      store.rules = data
      return { data: store.rules }
    }
  }

  // ── prompt ────────────────────────────────────────────────────────────────
  if (/\/prompt$/.test(path)) {
    if (method === 'get') return { data: store.prompt }
    if (method === 'put') {
      Object.assign(store.prompt, data)
      return { data: store.prompt }
    }
  }

  // ── test-message ──────────────────────────────────────────────────────────
  if (/\/test-message$/.test(path) && method === 'post') {
    return {
      data: {
        reply: `[モックモード] "${data.message}" — モックモードでは実際のAI応答は返りません。サーバーを起動してモックをオフにするとリアルタイムで動作します。`,
      },
    }
  }

  throw new Error(`[mock] 未処理のリクエスト: ${method.toUpperCase()} ${path}`)
}
