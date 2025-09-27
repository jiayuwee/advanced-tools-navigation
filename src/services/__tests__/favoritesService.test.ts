import FavoritesService from "../favoritesService";
import { vi, describe, it, expect, beforeEach } from "vitest";

// 内存模拟数据库
interface Favorite {
  id: string;
  user_id: string;
  tool_id: string | null;
  product_id: string | null;
  created_at: string;
}

type MemoryDatabase = {
  favorites: Favorite[];
  tools: Record<string, unknown>[];
  products: Record<string, unknown>[];
};

const globalMemory: MemoryDatabase = {
  favorites: [],
  tools: [],
  products: [],
};

// 构造简单 supabase 链式 Mock
vi.mock("../../lib/supabase", () => {
  const builder = (table: string) => {
    const rows: Record<string, unknown>[] = globalMemory[table as keyof MemoryDatabase] as Record<string, unknown>[];
    const filters: Record<string, unknown> = {};
    let notNullCol: string | null = null;
    let orderCfg: { col: string; asc: boolean } | null = null;
    let limitN: number | null = null;

    const api = {
      select() {
        return api;
      },
      eq(col: string, val: unknown) {
        filters[col] = val;
        return api;
      },
      not(col: string, op: string, nullLit: null) {
        // 参数标记为使用
        void op;
        void nullLit;
        notNullCol = col;
        return api;
      },
      in(col: string, vals: unknown[]) {
        filters[col] = { $in: vals };
        return api;
      },
      order(col: string, opt: { ascending: boolean }) {
        orderCfg = { col, asc: opt.ascending };
        return api;
      },
      limit(n: number) {
        limitN = n;
        return api;
      },
      maybeSingle() {
        const { data } = api._filter();
        return { data: data?.[0] ?? null, error: null };
      },
      single() {
        const { data } = api._filter();
        return { data: data?.[0] ?? null, error: null };
      },
      insert(payload: unknown, opt?: { ignoreDuplicates?: boolean }) {
        const arr = Array.isArray(payload) ? payload : [payload];
        arr.forEach((r: Record<string, unknown>) => {
          const dup = globalMemory.favorites.find(
            (f) =>
              f.user_id === r.user_id &&
              ((r.tool_id && f.tool_id === r.tool_id) ||
                (r.product_id && f.product_id === r.product_id)),
          );
          if (dup && !(opt && opt.ignoreDuplicates)) return;
          globalMemory.favorites.push({
            id: crypto.randomUUID(),
            user_id: r.user_id as string,
            tool_id: (r.tool_id as string) ?? null,
            product_id: (r.product_id as string) ?? null,
            created_at: new Date().toISOString(),
          });
        });
        return api;
      },
      delete() {
        api._delete = true;
        return api;
      },
      _delete: false,
      _filter() {
        let result = [...rows];
        Object.entries(filters).forEach(([k, v]) => {
          if (typeof v === "object" && v && "$in" in v) {
            result = result.filter((r) => (v.$in as unknown[]).includes(r[k]));
          } else {
            result = result.filter((r) => r[k] === v);
          }
        });
        if (notNullCol) {
          result = result.filter((r) => r[notNullCol!] !== null);
        }
        if (api._delete) {
          globalMemory.favorites = globalMemory.favorites.filter(
            (r) => !result.includes(r as Record<string, unknown>),
          );
          return { data: null, error: null };
        }
        if (orderCfg) {
          result.sort((a, b) =>
            orderCfg!.asc
              ? (a[orderCfg!.col] || "").toString().localeCompare(
                  (b[orderCfg!.col] || "").toString(),
                )
              : (b[orderCfg!.col] || "").toString().localeCompare(
                  (a[orderCfg!.col] || "").toString(),
                ),
          );
        }
        if (limitN) result = result.slice(0, limitN);
        return { data: result, error: null };
      },
      then(res: (result: { data: unknown[]; error: null }) => void) {
        // 兼容 insert(...).select() 调用链
        const { data, error } = api._filter();
        res({ data: data as unknown[], error });
      },
    };
    return api;
  };

  return {
    supabase: {
      from: (table: string) => builder(table),
    },
  };
});

describe("FavoritesService", () => {
  const user = "u1";
  
  beforeEach(() => {
    globalMemory.favorites.length = 0;
    globalMemory.tools.length = 0;
    globalMemory.products.length = 0;
    
    // 准备工具 / 产品
    for (let i = 1; i <= 3; i++) {
      globalMemory.tools.push({
        id: `t${i}`,
        name: `Tool ${i}`,
        description: "",
        url: "http://x",
        icon: null,
        category_id: "c1",
        click_count: 0,
        is_featured: false,
        status: "active",
        created_at: new Date(Date.now() - i * 1000).toISOString(),
        updated_at: null,
        created_by: null,
        meta_title: null,
        meta_description: null,
        sort_order: null,
        category: null,
      });
    }
    
    globalMemory.products.push({
      id: "p1",
      name: "Prod 1",
      description: "",
      short_description: "",
      price: 10,
      original_price: null,
      currency: "USD",
      category_id: "pc1",
      is_featured: false,
      is_digital: true,
      stock_quantity: 10,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: null,
      created_by: null,
      meta_title: null,
      meta_description: null,
      sort_order: null,
      images: [],
      features: [],
      demo_url: null,
      download_url: null,
      category: null,
    });
  });

  it("toggleFavorite 工具：添加 -> 取消", async () => {
    const r1 = await FavoritesService.toggleFavorite(user, "t1", "tool");
    expect(r1.isFavorite).toBe(true);
    expect(globalMemory.favorites.length).toBe(1);
    
    const r2 = await FavoritesService.toggleFavorite(user, "t1", "tool");
    expect(r2.isFavorite).toBe(false);
    expect(globalMemory.favorites.length).toBe(0);
  });

  it("添加多个工具并保持顺序", async () => {
    // 收藏顺序：t2 -> t1 -> t3
    await FavoritesService.addToolToFavorites(user, "t2");
    await FavoritesService.addToolToFavorites(user, "t1");
    await FavoritesService.addToolToFavorites(user, "t3");

    const list = await FavoritesService.getFavoriteTools(user);
    expect(list.map((i) => i.id)).toEqual(["t3", "t1", "t2"]); // 因为 service 中按 created_at 逆序
  });

  it("重复收藏忽略（通过 insertFavoriteGuard 防重复）", async () => {
    await FavoritesService.addToolToFavorites(user, "t1");
    await expect(
      FavoritesService.addToolToFavorites(user, "t1"),
    ).rejects.toThrow(/已经收藏过此工具/);
    expect(globalMemory.favorites.length).toBe(1);
  });

  it("产品收藏与统计", async () => {
    await FavoritesService.addProductToFavorites(user, "p1");
    const stats = await FavoritesService.getFavoriteStats(user);
    expect(stats.productsCount).toBe(1);
    expect(stats.toolsCount).toBe(0);
  });
});