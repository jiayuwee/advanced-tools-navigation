import {
  d as e,
  r as t,
  c as r,
  o as s,
  a as i,
  b as n,
  e as o,
  u as a,
  n as l,
  f as c,
  w as h,
  g as u,
  v as d,
  h as f,
  t as p,
  F as g,
  i as v,
  j as y,
  M as m,
  S as w,
  k as _,
  U as b,
  G as k,
  l as T,
  E as S,
  m as E,
  p as j,
  q as O,
} from "./vendor-AZgfH0eb.js";
!(function () {
  const e = document.createElement("link").relList;
  if (!(e && e.supports && e.supports("modulepreload"))) {
    for (const e of document.querySelectorAll('link[rel="modulepreload"]'))
      t(e);
    new MutationObserver((e) => {
      for (const r of e)
        if ("childList" === r.type)
          for (const e of r.addedNodes)
            "LINK" === e.tagName && "modulepreload" === e.rel && t(e);
    }).observe(document, { childList: !0, subtree: !0 });
  }
  function t(e) {
    if (e.ep) return;
    e.ep = !0;
    const t = (function (e) {
      const t = {};
      return (
        e.integrity && (t.integrity = e.integrity),
        e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
        "use-credentials" === e.crossOrigin
          ? (t.credentials = "include")
          : "anonymous" === e.crossOrigin
            ? (t.credentials = "omit")
            : (t.credentials = "same-origin"),
        t
      );
    })(e);
    fetch(e.href, t);
  }
})();
const P = {},
  C = function (e, t, r) {
    let s = Promise.resolve();
    if (t && t.length > 0) {
      const e = document.getElementsByTagName("link"),
        i = document.querySelector("meta[property=csp-nonce]"),
        n =
          (null == i ? void 0 : i.nonce) ||
          (null == i ? void 0 : i.getAttribute("nonce"));
      s = Promise.allSettled(
        t.map((t) => {
          if (
            ((t = (function (e, t) {
              return new URL(e, t).href;
            })(t, r)),
            t in P)
          )
            return;
          P[t] = !0;
          const s = t.endsWith(".css"),
            i = s ? '[rel="stylesheet"]' : "";
          if (!!r)
            for (let r = e.length - 1; r >= 0; r--) {
              const i = e[r];
              if (i.href === t && (!s || "stylesheet" === i.rel)) return;
            }
          else if (document.querySelector(`link[href="${t}"]${i}`)) return;
          const o = document.createElement("link");
          return (
            (o.rel = s ? "stylesheet" : "modulepreload"),
            s || (o.as = "script"),
            (o.crossOrigin = ""),
            (o.href = t),
            n && o.setAttribute("nonce", n),
            document.head.appendChild(o),
            s
              ? new Promise((e, r) => {
                  (o.addEventListener("load", e),
                    o.addEventListener("error", () =>
                      r(new Error(`Unable to preload CSS for ${t}`)),
                    ));
                })
              : void 0
          );
        }),
      );
    }
    function i(e) {
      const t = new Event("vite:preloadError", { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented))
        throw e;
    }
    return s.then((t) => {
      for (const e of t || []) "rejected" === e.status && i(e.reason);
      return e().catch(i);
    });
  };
class A extends Error {
  constructor(e, t = "FunctionsError", r) {
    (super(e), (this.name = t), (this.context = r));
  }
}
class $ extends A {
  constructor(e) {
    super(
      "Failed to send a request to the Edge Function",
      "FunctionsFetchError",
      e,
    );
  }
}
class I extends A {
  constructor(e) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
  }
}
class R extends A {
  constructor(e) {
    super(
      "Edge Function returned a non-2xx status code",
      "FunctionsHttpError",
      e,
    );
  }
}
let x, L;
(((L = x || (x = {})).Any = "any"),
  (L.ApNortheast1 = "ap-northeast-1"),
  (L.ApNortheast2 = "ap-northeast-2"),
  (L.ApSouth1 = "ap-south-1"),
  (L.ApSoutheast1 = "ap-southeast-1"),
  (L.ApSoutheast2 = "ap-southeast-2"),
  (L.CaCentral1 = "ca-central-1"),
  (L.EuCentral1 = "eu-central-1"),
  (L.EuWest1 = "eu-west-1"),
  (L.EuWest2 = "eu-west-2"),
  (L.EuWest3 = "eu-west-3"),
  (L.SaEast1 = "sa-east-1"),
  (L.UsEast1 = "us-east-1"),
  (L.UsWest1 = "us-west-1"),
  (L.UsWest2 = "us-west-2"));
const U = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
class D {
  constructor(e, { headers: t = {}, customFetch: r, region: s = x.Any } = {}) {
    ((this.url = e),
      (this.headers = t),
      (this.region = s),
      (this.fetch = ((e) => {
        let t;
        return (
          (t =
            e ||
            ("undefined" == typeof fetch
              ? (...e) =>
                  C(
                    async () => {
                      const { default: e } = await Promise.resolve().then(
                        () => X,
                      );
                      return { default: e };
                    },
                    void 0,
                    import.meta.url,
                  ).then(({ default: t }) => t(...e))
              : fetch)),
          (...e) => t(...e)
        );
      })(r)));
  }
  setAuth(e) {
    this.headers.Authorization = `Bearer ${e}`;
  }
  invoke(e, t = {}) {
    let r;
    return U(this, void 0, void 0, function* () {
      try {
        const { headers: s, method: i, body: n } = t;
        let o,
          a = {},
          { region: l } = t;
        (l || (l = this.region),
          l && "any" !== l && (a["x-region"] = l),
          n &&
            ((s && !Object.prototype.hasOwnProperty.call(s, "Content-Type")) ||
              !s) &&
            (("undefined" != typeof Blob && n instanceof Blob) ||
            n instanceof ArrayBuffer
              ? ((a["Content-Type"] = "application/octet-stream"), (o = n))
              : "string" == typeof n
                ? ((a["Content-Type"] = "text/plain"), (o = n))
                : "undefined" != typeof FormData && n instanceof FormData
                  ? (o = n)
                  : ((a["Content-Type"] = "application/json"),
                    (o = JSON.stringify(n)))));
        const c = yield this.fetch(`${this.url}/${e}`, {
            method: i || "POST",
            headers: Object.assign(
              Object.assign(Object.assign({}, a), this.headers),
              s,
            ),
            body: o,
          }).catch((e) => {
            throw new $(e);
          }),
          h = c.headers.get("x-relay-error");
        if (h && "true" === h) throw new I(c);
        if (!c.ok) throw new R(c);
        let u,
          d = (
            null !== (r = c.headers.get("Content-Type")) && void 0 !== r
              ? r
              : "text/plain"
          )
            .split(";")[0]
            .trim();
        return (
          (u =
            "application/json" === d
              ? yield c.json()
              : "application/octet-stream" === d
                ? yield c.blob()
                : "text/event-stream" === d
                  ? c
                  : "multipart/form-data" === d
                    ? yield c.formData()
                    : yield c.text()),
          { data: u, error: null }
        );
      } catch (s) {
        return { data: null, error: s };
      }
    });
  }
}
const q =
  "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
      ? window
      : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
          ? self
          : {};
function N(e) {
  if (e.__esModule) return e;
  const t = e.default;
  if ("function" == typeof t) {
    var r = function e() {
      return this instanceof e
        ? Reflect.construct(t, arguments, this.constructor)
        : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return (
    Object.defineProperty(r, "__esModule", { value: !0 }),
    Object.keys(e).forEach(function (t) {
      const s = Object.getOwnPropertyDescriptor(e, t);
      Object.defineProperty(
        r,
        t,
        s.get
          ? s
          : {
              enumerable: !0,
              get: function () {
                return e[t];
              },
            },
      );
    }),
    r
  );
}
const B = {},
  M = {},
  F = {},
  z = {},
  J = {},
  W = {},
  K = (function () {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw new Error("unable to locate global object");
  })();
const H = K.fetch,
  G = K.fetch.bind(K),
  V = K.Headers,
  Q = K.Request,
  Y = K.Response,
  X = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        Headers: V,
        Request: Q,
        Response: Y,
        default: G,
        fetch: H,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Z = N(X);
const ee = {};
Object.defineProperty(ee, "__esModule", { value: !0 });
const te = class extends Error {
  constructor(e) {
    (super(e.message),
      (this.name = "PostgrestError"),
      (this.details = e.details),
      (this.hint = e.hint),
      (this.code = e.code));
  }
};
ee.default = te;
const re =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(W, "__esModule", { value: !0 });
const se = re(Z),
  ie = re(ee);
W.default = class {
  constructor(e) {
    ((this.shouldThrowOnError = !1),
      (this.method = e.method),
      (this.url = e.url),
      (this.headers = e.headers),
      (this.schema = e.schema),
      (this.body = e.body),
      (this.shouldThrowOnError = e.shouldThrowOnError),
      (this.signal = e.signal),
      (this.isMaybeSingle = e.isMaybeSingle),
      e.fetch
        ? (this.fetch = e.fetch)
        : "undefined" == typeof fetch
          ? (this.fetch = se.default)
          : (this.fetch = fetch));
  }
  throwOnError() {
    return ((this.shouldThrowOnError = !0), this);
  }
  setHeader(e, t) {
    return (
      (this.headers = Object.assign({}, this.headers)),
      (this.headers[e] = t),
      this
    );
  }
  then(e, t) {
    (void 0 === this.schema ||
      (["GET", "HEAD"].includes(this.method)
        ? (this.headers["Accept-Profile"] = this.schema)
        : (this.headers["Content-Profile"] = this.schema)),
      "GET" !== this.method &&
        "HEAD" !== this.method &&
        (this.headers["Content-Type"] = "application/json"));
    let r = (0, this.fetch)(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal,
    }).then(async (e) => {
      let t, r, s;
      let i = null,
        n = null,
        o = null,
        a = e.status,
        l = e.statusText;
      if (e.ok) {
        if ("HEAD" !== this.method) {
          const t = await e.text();
          "" === t ||
            (n =
              "text/csv" === this.headers.Accept ||
              (this.headers.Accept &&
                this.headers.Accept.includes("application/vnd.pgrst.plan+text"))
                ? t
                : JSON.parse(t));
        }
        const s =
            null === (t = this.headers.Prefer) || void 0 === t
              ? void 0
              : t.match(/count=(exact|planned|estimated)/),
          c =
            null === (r = e.headers.get("content-range")) || void 0 === r
              ? void 0
              : r.split("/");
        (s && c && c.length > 1 && (o = parseInt(c[1])),
          this.isMaybeSingle &&
            "GET" === this.method &&
            Array.isArray(n) &&
            (n.length > 1
              ? ((i = {
                  code: "PGRST116",
                  details: `Results contain ${n.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                  hint: null,
                  message:
                    "JSON object requested, multiple (or no) rows returned",
                }),
                (n = null),
                (o = null),
                (a = 406),
                (l = "Not Acceptable"))
              : (n = 1 === n.length ? n[0] : null)));
      } else {
        const t = await e.text();
        try {
          ((i = JSON.parse(t)),
            Array.isArray(i) &&
              404 === e.status &&
              ((n = []), (i = null), (a = 200), (l = "OK")));
        } catch (c) {
          404 === e.status && "" === t
            ? ((a = 204), (l = "No Content"))
            : (i = { message: t });
        }
        if (
          (i &&
            this.isMaybeSingle &&
            (null === (s = null == i ? void 0 : i.details) || void 0 === s
              ? void 0
              : s.includes("0 rows")) &&
            ((i = null), (a = 200), (l = "OK")),
          i && this.shouldThrowOnError)
        )
          throw new ie.default(i);
      }
      return { error: i, data: n, count: o, status: a, statusText: l };
    });
    return (
      this.shouldThrowOnError ||
        (r = r.catch((e) => {
          let t, r, s;
          return {
            error: {
              message: `${null !== (t = null == e ? void 0 : e.name) && void 0 !== t ? t : "FetchError"}: ${null == e ? void 0 : e.message}`,
              details: `${null !== (r = null == e ? void 0 : e.stack) && void 0 !== r ? r : ""}`,
              hint: "",
              code: `${null !== (s = null == e ? void 0 : e.code) && void 0 !== s ? s : ""}`,
            },
            data: null,
            count: null,
            status: 0,
            statusText: "",
          };
        })),
      r.then(e, t)
    );
  }
  returns() {
    return this;
  }
  overrideTypes() {
    return this;
  }
};
const ne =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(J, "__esModule", { value: !0 });
const oe = ne(W);
const ae = class extends oe.default {
  select(e) {
    let t = !1;
    const r = (null != e ? e : "*")
      .split("")
      .map((e) => (/\s/.test(e) && !t ? "" : ('"' === e && (t = !t), e)))
      .join("");
    return (
      this.url.searchParams.set("select", r),
      this.headers.Prefer && (this.headers.Prefer += ","),
      (this.headers.Prefer += "return=representation"),
      this
    );
  }
  order(
    e,
    {
      ascending: t = !0,
      nullsFirst: r,
      foreignTable: s,
      referencedTable: i = s,
    } = {},
  ) {
    const n = i ? `${i}.order` : "order",
      o = this.url.searchParams.get(n);
    return (
      this.url.searchParams.set(
        n,
        `${o ? `${o},` : ""}${e}.${t ? "asc" : "desc"}${void 0 === r ? "" : r ? ".nullsfirst" : ".nullslast"}`,
      ),
      this
    );
  }
  limit(e, { foreignTable: t, referencedTable: r = t } = {}) {
    const s = void 0 === r ? "limit" : `${r}.limit`;
    return (this.url.searchParams.set(s, `${e}`), this);
  }
  range(e, t, { foreignTable: r, referencedTable: s = r } = {}) {
    const i = void 0 === s ? "offset" : `${s}.offset`,
      n = void 0 === s ? "limit" : `${s}.limit`;
    return (
      this.url.searchParams.set(i, `${e}`),
      this.url.searchParams.set(n, "" + (t - e + 1)),
      this
    );
  }
  abortSignal(e) {
    return ((this.signal = e), this);
  }
  single() {
    return ((this.headers.Accept = "application/vnd.pgrst.object+json"), this);
  }
  maybeSingle() {
    return (
      "GET" === this.method
        ? (this.headers.Accept = "application/json")
        : (this.headers.Accept = "application/vnd.pgrst.object+json"),
      (this.isMaybeSingle = !0),
      this
    );
  }
  csv() {
    return ((this.headers.Accept = "text/csv"), this);
  }
  geojson() {
    return ((this.headers.Accept = "application/geo+json"), this);
  }
  explain({
    analyze: e = !1,
    verbose: t = !1,
    settings: r = !1,
    buffers: s = !1,
    wal: i = !1,
    format: n = "text",
  } = {}) {
    let o;
    const a = [
        e ? "analyze" : null,
        t ? "verbose" : null,
        r ? "settings" : null,
        s ? "buffers" : null,
        i ? "wal" : null,
      ]
        .filter(Boolean)
        .join("|"),
      l =
        null !== (o = this.headers.Accept) && void 0 !== o
          ? o
          : "application/json";
    return (
      (this.headers.Accept = `application/vnd.pgrst.plan+${n}; for="${l}"; options=${a};`),
      this
    );
  }
  rollback() {
    let e;
    return (
      (null !== (e = this.headers.Prefer) && void 0 !== e ? e : "").trim()
        .length > 0
        ? (this.headers.Prefer += ",tx=rollback")
        : (this.headers.Prefer = "tx=rollback"),
      this
    );
  }
  returns() {
    return this;
  }
};
J.default = ae;
const le =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(z, "__esModule", { value: !0 });
const ce = le(J);
const he = class extends ce.default {
  eq(e, t) {
    return (this.url.searchParams.append(e, `eq.${t}`), this);
  }
  neq(e, t) {
    return (this.url.searchParams.append(e, `neq.${t}`), this);
  }
  gt(e, t) {
    return (this.url.searchParams.append(e, `gt.${t}`), this);
  }
  gte(e, t) {
    return (this.url.searchParams.append(e, `gte.${t}`), this);
  }
  lt(e, t) {
    return (this.url.searchParams.append(e, `lt.${t}`), this);
  }
  lte(e, t) {
    return (this.url.searchParams.append(e, `lte.${t}`), this);
  }
  like(e, t) {
    return (this.url.searchParams.append(e, `like.${t}`), this);
  }
  likeAllOf(e, t) {
    return (
      this.url.searchParams.append(e, `like(all).{${t.join(",")}}`),
      this
    );
  }
  likeAnyOf(e, t) {
    return (
      this.url.searchParams.append(e, `like(any).{${t.join(",")}}`),
      this
    );
  }
  ilike(e, t) {
    return (this.url.searchParams.append(e, `ilike.${t}`), this);
  }
  ilikeAllOf(e, t) {
    return (
      this.url.searchParams.append(e, `ilike(all).{${t.join(",")}}`),
      this
    );
  }
  ilikeAnyOf(e, t) {
    return (
      this.url.searchParams.append(e, `ilike(any).{${t.join(",")}}`),
      this
    );
  }
  is(e, t) {
    return (this.url.searchParams.append(e, `is.${t}`), this);
  }
  in(e, t) {
    const r = Array.from(new Set(t))
      .map((e) =>
        "string" == typeof e && new RegExp("[,()]").test(e) ? `"${e}"` : `${e}`,
      )
      .join(",");
    return (this.url.searchParams.append(e, `in.(${r})`), this);
  }
  contains(e, t) {
    return (
      "string" == typeof t
        ? this.url.searchParams.append(e, `cs.${t}`)
        : Array.isArray(t)
          ? this.url.searchParams.append(e, `cs.{${t.join(",")}}`)
          : this.url.searchParams.append(e, `cs.${JSON.stringify(t)}`),
      this
    );
  }
  containedBy(e, t) {
    return (
      "string" == typeof t
        ? this.url.searchParams.append(e, `cd.${t}`)
        : Array.isArray(t)
          ? this.url.searchParams.append(e, `cd.{${t.join(",")}}`)
          : this.url.searchParams.append(e, `cd.${JSON.stringify(t)}`),
      this
    );
  }
  rangeGt(e, t) {
    return (this.url.searchParams.append(e, `sr.${t}`), this);
  }
  rangeGte(e, t) {
    return (this.url.searchParams.append(e, `nxl.${t}`), this);
  }
  rangeLt(e, t) {
    return (this.url.searchParams.append(e, `sl.${t}`), this);
  }
  rangeLte(e, t) {
    return (this.url.searchParams.append(e, `nxr.${t}`), this);
  }
  rangeAdjacent(e, t) {
    return (this.url.searchParams.append(e, `adj.${t}`), this);
  }
  overlaps(e, t) {
    return (
      "string" == typeof t
        ? this.url.searchParams.append(e, `ov.${t}`)
        : this.url.searchParams.append(e, `ov.{${t.join(",")}}`),
      this
    );
  }
  textSearch(e, t, { config: r, type: s } = {}) {
    let i = "";
    "plain" === s
      ? (i = "pl")
      : "phrase" === s
        ? (i = "ph")
        : "websearch" === s && (i = "w");
    const n = void 0 === r ? "" : `(${r})`;
    return (this.url.searchParams.append(e, `${i}fts${n}.${t}`), this);
  }
  match(e) {
    return (
      Object.entries(e).forEach(([e, t]) => {
        this.url.searchParams.append(e, `eq.${t}`);
      }),
      this
    );
  }
  not(e, t, r) {
    return (this.url.searchParams.append(e, `not.${t}.${r}`), this);
  }
  or(e, { foreignTable: t, referencedTable: r = t } = {}) {
    const s = r ? `${r}.or` : "or";
    return (this.url.searchParams.append(s, `(${e})`), this);
  }
  filter(e, t, r) {
    return (this.url.searchParams.append(e, `${t}.${r}`), this);
  }
};
z.default = he;
const ue =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(F, "__esModule", { value: !0 });
const de = ue(z);
F.default = class {
  constructor(e, { headers: t = {}, schema: r, fetch: s }) {
    ((this.url = e), (this.headers = t), (this.schema = r), (this.fetch = s));
  }
  select(e, { head: t = !1, count: r } = {}) {
    const s = t ? "HEAD" : "GET";
    let i = !1;
    const n = (null != e ? e : "*")
      .split("")
      .map((e) => (/\s/.test(e) && !i ? "" : ('"' === e && (i = !i), e)))
      .join("");
    return (
      this.url.searchParams.set("select", n),
      r && (this.headers.Prefer = `count=${r}`),
      new de.default({
        method: s,
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        fetch: this.fetch,
        allowEmpty: !1,
      })
    );
  }
  insert(e, { count: t, defaultToNull: r = !0 } = {}) {
    const s = [];
    if (
      (this.headers.Prefer && s.push(this.headers.Prefer),
      t && s.push(`count=${t}`),
      r || s.push("missing=default"),
      (this.headers.Prefer = s.join(",")),
      Array.isArray(e))
    ) {
      const t = e.reduce((e, t) => e.concat(Object.keys(t)), []);
      if (t.length > 0) {
        const e = [...new Set(t)].map((e) => `"${e}"`);
        this.url.searchParams.set("columns", e.join(","));
      }
    }
    return new de.default({
      method: "POST",
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: this.fetch,
      allowEmpty: !1,
    });
  }
  upsert(
    e,
    {
      onConflict: t,
      ignoreDuplicates: r = !1,
      count: s,
      defaultToNull: i = !0,
    } = {},
  ) {
    const n = [`resolution=${r ? "ignore" : "merge"}-duplicates`];
    if (
      (void 0 !== t && this.url.searchParams.set("on_conflict", t),
      this.headers.Prefer && n.push(this.headers.Prefer),
      s && n.push(`count=${s}`),
      i || n.push("missing=default"),
      (this.headers.Prefer = n.join(",")),
      Array.isArray(e))
    ) {
      const t = e.reduce((e, t) => e.concat(Object.keys(t)), []);
      if (t.length > 0) {
        const e = [...new Set(t)].map((e) => `"${e}"`);
        this.url.searchParams.set("columns", e.join(","));
      }
    }
    return new de.default({
      method: "POST",
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: this.fetch,
      allowEmpty: !1,
    });
  }
  update(e, { count: t } = {}) {
    const r = [];
    return (
      this.headers.Prefer && r.push(this.headers.Prefer),
      t && r.push(`count=${t}`),
      (this.headers.Prefer = r.join(",")),
      new de.default({
        method: "PATCH",
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        body: e,
        fetch: this.fetch,
        allowEmpty: !1,
      })
    );
  }
  delete({ count: e } = {}) {
    const t = [];
    return (
      e && t.push(`count=${e}`),
      this.headers.Prefer && t.unshift(this.headers.Prefer),
      (this.headers.Prefer = t.join(",")),
      new de.default({
        method: "DELETE",
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        fetch: this.fetch,
        allowEmpty: !1,
      })
    );
  }
};
const fe = {},
  pe = {};
(Object.defineProperty(pe, "__esModule", { value: !0 }),
  (pe.version = void 0),
  (pe.version = "0.0.0-automated"),
  Object.defineProperty(fe, "__esModule", { value: !0 }),
  (fe.DEFAULT_HEADERS = void 0));
const ge = pe;
fe.DEFAULT_HEADERS = { "X-Client-Info": `postgrest-js/${ge.version}` };
const ve =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(M, "__esModule", { value: !0 });
const ye = ve(F),
  me = ve(z),
  we = fe;
M.default = class e {
  constructor(e, { headers: t = {}, schema: r, fetch: s } = {}) {
    ((this.url = e),
      (this.headers = Object.assign(Object.assign({}, we.DEFAULT_HEADERS), t)),
      (this.schemaName = r),
      (this.fetch = s));
  }
  from(e) {
    const t = new URL(`${this.url}/${e}`);
    return new ye.default(t, {
      headers: Object.assign({}, this.headers),
      schema: this.schemaName,
      fetch: this.fetch,
    });
  }
  schema(t) {
    return new e(this.url, {
      headers: this.headers,
      schema: t,
      fetch: this.fetch,
    });
  }
  rpc(e, t = {}, { head: r = !1, get: s = !1, count: i } = {}) {
    let n;
    const o = new URL(`${this.url}/rpc/${e}`);
    let a;
    r || s
      ? ((n = r ? "HEAD" : "GET"),
        Object.entries(t)
          .filter(([e, t]) => void 0 !== t)
          .map(([e, t]) => [e, Array.isArray(t) ? `{${t.join(",")}}` : `${t}`])
          .forEach(([e, t]) => {
            o.searchParams.append(e, t);
          }))
      : ((n = "POST"), (a = t));
    const l = Object.assign({}, this.headers);
    return (
      i && (l.Prefer = `count=${i}`),
      new me.default({
        method: n,
        url: o,
        headers: l,
        schema: this.schemaName,
        body: a,
        fetch: this.fetch,
        allowEmpty: !1,
      })
    );
  }
};
const _e =
  (q && q.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
(Object.defineProperty(B, "__esModule", { value: !0 }),
  (B.PostgrestError =
    B.PostgrestBuilder =
    B.PostgrestTransformBuilder =
    B.PostgrestFilterBuilder =
    B.PostgrestQueryBuilder =
    B.PostgrestClient =
      void 0));
const be = _e(M);
B.PostgrestClient = be.default;
const ke = _e(F);
B.PostgrestQueryBuilder = ke.default;
const Te = _e(z);
B.PostgrestFilterBuilder = Te.default;
const Se = _e(J);
B.PostgrestTransformBuilder = Se.default;
const Ee = _e(W);
B.PostgrestBuilder = Ee.default;
const je = _e(ee);
B.PostgrestError = je.default;
const Oe = (B.default = {
  PostgrestClient: be.default,
  PostgrestQueryBuilder: ke.default,
  PostgrestFilterBuilder: Te.default,
  PostgrestTransformBuilder: Se.default,
  PostgrestBuilder: Ee.default,
  PostgrestError: je.default,
});
const {
  PostgrestClient: Pe,
  PostgrestQueryBuilder: Ce,
  PostgrestFilterBuilder: Ae,
  PostgrestTransformBuilder: $e,
  PostgrestBuilder: Ie,
  PostgrestError: Re,
} = Oe;
const xe = (function () {
    if ("undefined" != typeof WebSocket) return WebSocket;
    if (void 0 !== global.WebSocket) return global.WebSocket;
    if (void 0 !== window.WebSocket) return window.WebSocket;
    if (void 0 !== self.WebSocket) return self.WebSocket;
    throw new Error("`WebSocket` is not supported in this environment");
  })(),
  Le = { "X-Client-Info": "realtime-js/2.11.13" };
let Ue, De, qe, Ne, Be, Me, Fe, ze, Je, We, Ke;
(((De = Ue || (Ue = {}))[(De.connecting = 0)] = "connecting"),
  (De[(De.open = 1)] = "open"),
  (De[(De.closing = 2)] = "closing"),
  (De[(De.closed = 3)] = "closed"),
  ((Ne = qe || (qe = {})).closed = "closed"),
  (Ne.errored = "errored"),
  (Ne.joined = "joined"),
  (Ne.joining = "joining"),
  (Ne.leaving = "leaving"),
  ((Me = Be || (Be = {})).close = "phx_close"),
  (Me.error = "phx_error"),
  (Me.join = "phx_join"),
  (Me.reply = "phx_reply"),
  (Me.leave = "phx_leave"),
  (Me.access_token = "access_token"),
  ((Fe || (Fe = {})).websocket = "websocket"),
  ((Je = ze || (ze = {})).Connecting = "connecting"),
  (Je.Open = "open"),
  (Je.Closing = "closing"),
  (Je.Closed = "closed"));
class He {
  constructor() {
    this.HEADER_LENGTH = 1;
  }
  decode(e, t) {
    return e.constructor === ArrayBuffer
      ? t(this._binaryDecode(e))
      : t("string" == typeof e ? JSON.parse(e) : {});
  }
  _binaryDecode(e) {
    const t = new DataView(e),
      r = new TextDecoder();
    return this._decodeBroadcast(e, t, r);
  }
  _decodeBroadcast(e, t, r) {
    const s = t.getUint8(1),
      i = t.getUint8(2);
    let n = this.HEADER_LENGTH + 2;
    const o = r.decode(e.slice(n, n + s));
    n += s;
    const a = r.decode(e.slice(n, n + i));
    n += i;
    return {
      ref: null,
      topic: o,
      event: a,
      payload: JSON.parse(r.decode(e.slice(n, e.byteLength))),
    };
  }
}
class Ge {
  constructor(e, t) {
    ((this.callback = e),
      (this.timerCalc = t),
      (this.timer = void 0),
      (this.tries = 0),
      (this.callback = e),
      (this.timerCalc = t));
  }
  reset() {
    ((this.tries = 0), clearTimeout(this.timer));
  }
  scheduleTimeout() {
    (clearTimeout(this.timer),
      (this.timer = setTimeout(
        () => {
          ((this.tries = this.tries + 1), this.callback());
        },
        this.timerCalc(this.tries + 1),
      )));
  }
}
(((Ke = We || (We = {})).abstime = "abstime"),
  (Ke.bool = "bool"),
  (Ke.date = "date"),
  (Ke.daterange = "daterange"),
  (Ke.float4 = "float4"),
  (Ke.float8 = "float8"),
  (Ke.int2 = "int2"),
  (Ke.int4 = "int4"),
  (Ke.int4range = "int4range"),
  (Ke.int8 = "int8"),
  (Ke.int8range = "int8range"),
  (Ke.json = "json"),
  (Ke.jsonb = "jsonb"),
  (Ke.money = "money"),
  (Ke.numeric = "numeric"),
  (Ke.oid = "oid"),
  (Ke.reltime = "reltime"),
  (Ke.text = "text"),
  (Ke.time = "time"),
  (Ke.timestamp = "timestamp"),
  (Ke.timestamptz = "timestamptz"),
  (Ke.timetz = "timetz"),
  (Ke.tsrange = "tsrange"),
  (Ke.tstzrange = "tstzrange"));
const Ve = (e, t, r = {}) => {
    let s;
    const i = null !== (s = r.skipTypes) && void 0 !== s ? s : [];
    return Object.keys(t).reduce((r, s) => ((r[s] = Qe(s, e, t, i)), r), {});
  },
  Qe = (e, t, r, s) => {
    const i = t.find((t) => t.name === e),
      n = null == i ? void 0 : i.type,
      o = r[e];
    return n && !s.includes(n) ? Ye(n, o) : Xe(o);
  },
  Ye = (e, t) => {
    if ("_" === e.charAt(0)) {
      const r = e.slice(1, e.length);
      return rt(t, r);
    }
    switch (e) {
      case We.bool:
        return Ze(t);
      case We.float4:
      case We.float8:
      case We.int2:
      case We.int4:
      case We.int8:
      case We.numeric:
      case We.oid:
        return et(t);
      case We.json:
      case We.jsonb:
        return tt(t);
      case We.timestamp:
        return st(t);
      case We.abstime:
      case We.date:
      case We.daterange:
      case We.int4range:
      case We.int8range:
      case We.money:
      case We.reltime:
      case We.text:
      case We.time:
      case We.timestamptz:
      case We.timetz:
      case We.tsrange:
      case We.tstzrange:
      default:
        return Xe(t);
    }
  },
  Xe = (e) => e,
  Ze = (e) => {
    switch (e) {
      case "t":
        return !0;
      case "f":
        return !1;
      default:
        return e;
    }
  },
  et = (e) => {
    if ("string" == typeof e) {
      const t = parseFloat(e);
      if (!Number.isNaN(t)) return t;
    }
    return e;
  },
  tt = (e) => {
    if ("string" == typeof e)
      try {
        return JSON.parse(e);
      } catch (t) {
        return (console.log(`JSON parse error: ${t}`), e);
      }
    return e;
  },
  rt = (e, t) => {
    if ("string" != typeof e) return e;
    const r = e.length - 1,
      s = e[r];
    if ("{" === e[0] && "}" === s) {
      let s;
      const n = e.slice(1, r);
      try {
        s = JSON.parse("[" + n + "]");
      } catch (i) {
        s = n ? n.split(",") : [];
      }
      return s.map((e) => Ye(t, e));
    }
    return e;
  },
  st = (e) => ("string" == typeof e ? e.replace(" ", "T") : e),
  it = (e) => {
    let t = e;
    return (
      (t = t.replace(/^ws/i, "http")),
      (t = t.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, "")),
      t.replace(/\/+$/, "")
    );
  };
class nt {
  constructor(e, t, r = {}, s = 1e4) {
    ((this.channel = e),
      (this.event = t),
      (this.payload = r),
      (this.timeout = s),
      (this.sent = !1),
      (this.timeoutTimer = void 0),
      (this.ref = ""),
      (this.receivedResp = null),
      (this.recHooks = []),
      (this.refEvent = null));
  }
  resend(e) {
    ((this.timeout = e),
      this._cancelRefEvent(),
      (this.ref = ""),
      (this.refEvent = null),
      (this.receivedResp = null),
      (this.sent = !1),
      this.send());
  }
  send() {
    this._hasReceived("timeout") ||
      (this.startTimeout(),
      (this.sent = !0),
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel._joinRef(),
      }));
  }
  updatePayload(e) {
    this.payload = Object.assign(Object.assign({}, this.payload), e);
  }
  receive(e, t) {
    let r;
    return (
      this._hasReceived(e) &&
        t(
          null === (r = this.receivedResp) || void 0 === r
            ? void 0
            : r.response,
        ),
      this.recHooks.push({ status: e, callback: t }),
      this
    );
  }
  startTimeout() {
    if (this.timeoutTimer) return;
    ((this.ref = this.channel.socket._makeRef()),
      (this.refEvent = this.channel._replyEventName(this.ref)));
    (this.channel._on(this.refEvent, {}, (e) => {
      (this._cancelRefEvent(),
        this._cancelTimeout(),
        (this.receivedResp = e),
        this._matchReceive(e));
    }),
      (this.timeoutTimer = setTimeout(() => {
        this.trigger("timeout", {});
      }, this.timeout)));
  }
  trigger(e, t) {
    this.refEvent &&
      this.channel._trigger(this.refEvent, { status: e, response: t });
  }
  destroy() {
    (this._cancelRefEvent(), this._cancelTimeout());
  }
  _cancelRefEvent() {
    this.refEvent && this.channel._off(this.refEvent, {});
  }
  _cancelTimeout() {
    (clearTimeout(this.timeoutTimer), (this.timeoutTimer = void 0));
  }
  _matchReceive({ status: e, response: t }) {
    this.recHooks.filter((t) => t.status === e).forEach((e) => e.callback(t));
  }
  _hasReceived(e) {
    return this.receivedResp && this.receivedResp.status === e;
  }
}
let ot, at, lt, ct, ht, ut, dt, ft;
(((at = ot || (ot = {})).SYNC = "sync"),
  (at.JOIN = "join"),
  (at.LEAVE = "leave"));
class pt {
  constructor(e, t) {
    ((this.channel = e),
      (this.state = {}),
      (this.pendingDiffs = []),
      (this.joinRef = null),
      (this.caller = {
        onJoin: () => {},
        onLeave: () => {},
        onSync: () => {},
      }));
    const r = (null == t ? void 0 : t.events) || {
      state: "presence_state",
      diff: "presence_diff",
    };
    (this.channel._on(r.state, {}, (e) => {
      const { onJoin: t, onLeave: r, onSync: s } = this.caller;
      ((this.joinRef = this.channel._joinRef()),
        (this.state = pt.syncState(this.state, e, t, r)),
        this.pendingDiffs.forEach((e) => {
          this.state = pt.syncDiff(this.state, e, t, r);
        }),
        (this.pendingDiffs = []),
        s());
    }),
      this.channel._on(r.diff, {}, (e) => {
        const { onJoin: t, onLeave: r, onSync: s } = this.caller;
        this.inPendingSyncState()
          ? this.pendingDiffs.push(e)
          : ((this.state = pt.syncDiff(this.state, e, t, r)), s());
      }),
      this.onJoin((e, t, r) => {
        this.channel._trigger("presence", {
          event: "join",
          key: e,
          currentPresences: t,
          newPresences: r,
        });
      }),
      this.onLeave((e, t, r) => {
        this.channel._trigger("presence", {
          event: "leave",
          key: e,
          currentPresences: t,
          leftPresences: r,
        });
      }),
      this.onSync(() => {
        this.channel._trigger("presence", { event: "sync" });
      }));
  }
  static syncState(e, t, r, s) {
    const i = this.cloneDeep(e),
      n = this.transformState(t),
      o = {},
      a = {};
    return (
      this.map(i, (e, t) => {
        n[e] || (a[e] = t);
      }),
      this.map(n, (e, t) => {
        const r = i[e];
        if (r) {
          const s = t.map((e) => e.presence_ref),
            i = r.map((e) => e.presence_ref),
            n = t.filter((e) => i.indexOf(e.presence_ref) < 0),
            l = r.filter((e) => s.indexOf(e.presence_ref) < 0);
          (n.length > 0 && (o[e] = n), l.length > 0 && (a[e] = l));
        } else o[e] = t;
      }),
      this.syncDiff(i, { joins: o, leaves: a }, r, s)
    );
  }
  static syncDiff(e, t, r, s) {
    const { joins: i, leaves: n } = {
      joins: this.transformState(t.joins),
      leaves: this.transformState(t.leaves),
    };
    return (
      r || (r = () => {}),
      s || (s = () => {}),
      this.map(i, (t, s) => {
        let i;
        const n = null !== (i = e[t]) && void 0 !== i ? i : [];
        if (((e[t] = this.cloneDeep(s)), n.length > 0)) {
          const r = e[t].map((e) => e.presence_ref),
            s = n.filter((e) => r.indexOf(e.presence_ref) < 0);
          e[t].unshift(...s);
        }
        r(t, n, s);
      }),
      this.map(n, (t, r) => {
        let i = e[t];
        if (!i) return;
        const n = r.map((e) => e.presence_ref);
        ((i = i.filter((e) => n.indexOf(e.presence_ref) < 0)),
          (e[t] = i),
          s(t, i, r),
          0 === i.length && delete e[t]);
      }),
      e
    );
  }
  static map(e, t) {
    return Object.getOwnPropertyNames(e).map((r) => t(r, e[r]));
  }
  static transformState(e) {
    return (
      (e = this.cloneDeep(e)),
      Object.getOwnPropertyNames(e).reduce((t, r) => {
        const s = e[r];
        return (
          (t[r] =
            "metas" in s
              ? s.metas.map(
                  (e) => (
                    (e.presence_ref = e.phx_ref),
                    delete e.phx_ref,
                    delete e.phx_ref_prev,
                    e
                  ),
                )
              : s),
          t
        );
      }, {})
    );
  }
  static cloneDeep(e) {
    return JSON.parse(JSON.stringify(e));
  }
  onJoin(e) {
    this.caller.onJoin = e;
  }
  onLeave(e) {
    this.caller.onLeave = e;
  }
  onSync(e) {
    this.caller.onSync = e;
  }
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef();
  }
}
(((ct = lt || (lt = {})).ALL = "*"),
  (ct.INSERT = "INSERT"),
  (ct.UPDATE = "UPDATE"),
  (ct.DELETE = "DELETE"),
  ((ut = ht || (ht = {})).BROADCAST = "broadcast"),
  (ut.PRESENCE = "presence"),
  (ut.POSTGRES_CHANGES = "postgres_changes"),
  (ut.SYSTEM = "system"),
  ((ft = dt || (dt = {})).SUBSCRIBED = "SUBSCRIBED"),
  (ft.TIMED_OUT = "TIMED_OUT"),
  (ft.CLOSED = "CLOSED"),
  (ft.CHANNEL_ERROR = "CHANNEL_ERROR"));
class gt {
  constructor(e, t = { config: {} }, r) {
    ((this.topic = e),
      (this.params = t),
      (this.socket = r),
      (this.bindings = {}),
      (this.state = qe.closed),
      (this.joinedOnce = !1),
      (this.pushBuffer = []),
      (this.subTopic = e.replace(/^realtime:/i, "")),
      (this.params.config = Object.assign(
        {
          broadcast: { ack: !1, self: !1 },
          presence: { key: "" },
          private: !1,
        },
        t.config,
      )),
      (this.timeout = this.socket.timeout),
      (this.joinPush = new nt(this, Be.join, this.params, this.timeout)),
      (this.rejoinTimer = new Ge(
        () => this._rejoinUntilConnected(),
        this.socket.reconnectAfterMs,
      )),
      this.joinPush.receive("ok", () => {
        ((this.state = qe.joined),
          this.rejoinTimer.reset(),
          this.pushBuffer.forEach((e) => e.send()),
          (this.pushBuffer = []));
      }),
      this._onClose(() => {
        (this.rejoinTimer.reset(),
          this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`),
          (this.state = qe.closed),
          this.socket._remove(this));
      }),
      this._onError((e) => {
        this._isLeaving() ||
          this._isClosed() ||
          (this.socket.log("channel", `error ${this.topic}`, e),
          (this.state = qe.errored),
          this.rejoinTimer.scheduleTimeout());
      }),
      this.joinPush.receive("timeout", () => {
        this._isJoining() &&
          (this.socket.log(
            "channel",
            `timeout ${this.topic}`,
            this.joinPush.timeout,
          ),
          (this.state = qe.errored),
          this.rejoinTimer.scheduleTimeout());
      }),
      this._on(Be.reply, {}, (e, t) => {
        this._trigger(this._replyEventName(t), e);
      }),
      (this.presence = new pt(this)),
      (this.broadcastEndpointURL = it(this.socket.endPoint) + "/api/broadcast"),
      (this.private = this.params.config.private || !1));
  }
  subscribe(e, t = this.timeout) {
    let r, s;
    if (
      (this.socket.isConnected() || this.socket.connect(),
      this.state == qe.closed)
    ) {
      const {
        config: { broadcast: i, presence: n, private: o },
      } = this.params;
      (this._onError((t) => (null == e ? void 0 : e(dt.CHANNEL_ERROR, t))),
        this._onClose(() => (null == e ? void 0 : e(dt.CLOSED))));
      const a = {},
        l = {
          broadcast: i,
          presence: n,
          postgres_changes:
            null !==
              (s =
                null === (r = this.bindings.postgres_changes) || void 0 === r
                  ? void 0
                  : r.map((e) => e.filter)) && void 0 !== s
              ? s
              : [],
          private: o,
        };
      (this.socket.accessTokenValue &&
        (a.access_token = this.socket.accessTokenValue),
        this.updateJoinPayload(Object.assign({ config: l }, a)),
        (this.joinedOnce = !0),
        this._rejoin(t),
        this.joinPush
          .receive("ok", async ({ postgres_changes: t }) => {
            let r;
            if ((this.socket.setAuth(), void 0 !== t)) {
              const s = this.bindings.postgres_changes,
                i =
                  null !== (r = null == s ? void 0 : s.length) && void 0 !== r
                    ? r
                    : 0,
                n = [];
              for (let r = 0; r < i; r++) {
                const i = s[r],
                  {
                    filter: { event: o, schema: a, table: l, filter: c },
                  } = i,
                  h = t && t[r];
                if (
                  !h ||
                  h.event !== o ||
                  h.schema !== a ||
                  h.table !== l ||
                  h.filter !== c
                )
                  return (
                    this.unsubscribe(),
                    (this.state = qe.errored),
                    void (
                      null == e ||
                      e(
                        dt.CHANNEL_ERROR,
                        new Error(
                          "mismatch between server and client bindings for postgres changes",
                        ),
                      )
                    )
                  );
                n.push(Object.assign(Object.assign({}, i), { id: h.id }));
              }
              return (
                (this.bindings.postgres_changes = n),
                void (e && e(dt.SUBSCRIBED))
              );
            }
            null == e || e(dt.SUBSCRIBED);
          })
          .receive("error", (t) => {
            ((this.state = qe.errored),
              null == e ||
                e(
                  dt.CHANNEL_ERROR,
                  new Error(
                    JSON.stringify(Object.values(t).join(", ") || "error"),
                  ),
                ));
          })
          .receive("timeout", () => {
            null == e || e(dt.TIMED_OUT);
          }));
    }
    return this;
  }
  presenceState() {
    return this.presence.state;
  }
  async track(e, t = {}) {
    return await this.send(
      { type: "presence", event: "track", payload: e },
      t.timeout || this.timeout,
    );
  }
  async untrack(e = {}) {
    return await this.send({ type: "presence", event: "untrack" }, e);
  }
  on(e, t, r) {
    return this._on(e, t, r);
  }
  async send(e, t = {}) {
    let r, s;
    if (this._canPush() || "broadcast" !== e.type)
      return new Promise((r) => {
        let s, i, n;
        const o = this._push(e.type, e, t.timeout || this.timeout);
        ("broadcast" !== e.type ||
          (null ===
            (n =
              null ===
                (i =
                  null === (s = this.params) || void 0 === s
                    ? void 0
                    : s.config) || void 0 === i
                ? void 0
                : i.broadcast) || void 0 === n
            ? void 0
            : n.ack) ||
          r("ok"),
          o.receive("ok", () => r("ok")),
          o.receive("error", () => r("error")),
          o.receive("timeout", () => r("timed out")));
      });
    {
      const { event: n, payload: o } = e,
        a = {
          method: "POST",
          headers: {
            Authorization: this.socket.accessTokenValue
              ? `Bearer ${this.socket.accessTokenValue}`
              : "",
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event: n,
                payload: o,
                private: this.private,
              },
            ],
          }),
        };
      try {
        const e = await this._fetchWithTimeout(
          this.broadcastEndpointURL,
          a,
          null !== (r = t.timeout) && void 0 !== r ? r : this.timeout,
        );
        return (
          await (null === (s = e.body) || void 0 === s ? void 0 : s.cancel()),
          e.ok ? "ok" : "error"
        );
      } catch (i) {
        return "AbortError" === i.name ? "timed out" : "error";
      }
    }
  }
  updateJoinPayload(e) {
    this.joinPush.updatePayload(e);
  }
  unsubscribe(e = this.timeout) {
    this.state = qe.leaving;
    const t = () => {
      (this.socket.log("channel", `leave ${this.topic}`),
        this._trigger(Be.close, "leave", this._joinRef()));
    };
    this.joinPush.destroy();
    let r = null;
    return new Promise((s) => {
      ((r = new nt(this, Be.leave, {}, e)),
        r
          .receive("ok", () => {
            (t(), s("ok"));
          })
          .receive("timeout", () => {
            (t(), s("timed out"));
          })
          .receive("error", () => {
            s("error");
          }),
        r.send(),
        this._canPush() || r.trigger("ok", {}));
    }).finally(() => {
      null == r || r.destroy();
    });
  }
  teardown() {
    (this.pushBuffer.forEach((e) => e.destroy()),
      this.rejoinTimer && clearTimeout(this.rejoinTimer.timer),
      this.joinPush.destroy());
  }
  async _fetchWithTimeout(e, t, r) {
    const s = new AbortController(),
      i = setTimeout(() => s.abort(), r),
      n = await this.socket.fetch(
        e,
        Object.assign(Object.assign({}, t), { signal: s.signal }),
      );
    return (clearTimeout(i), n);
  }
  _push(e, t, r = this.timeout) {
    if (!this.joinedOnce)
      throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    const s = new nt(this, e, t, r);
    return (
      this._canPush() ? s.send() : (s.startTimeout(), this.pushBuffer.push(s)),
      s
    );
  }
  _onMessage(e, t, r) {
    return t;
  }
  _isMember(e) {
    return this.topic === e;
  }
  _joinRef() {
    return this.joinPush.ref;
  }
  _trigger(e, t, r) {
    let s, i;
    const n = e.toLocaleLowerCase(),
      { close: o, error: a, leave: l, join: c } = Be;
    if (r && [o, a, l, c].indexOf(n) >= 0 && r !== this._joinRef()) return;
    let h = this._onMessage(n, t, r);
    if (t && !h)
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    ["insert", "update", "delete"].includes(n)
      ? null === (s = this.bindings.postgres_changes) ||
        void 0 === s ||
        s
          .filter((e) => {
            let t, r, s;
            return (
              "*" ===
                (null === (t = e.filter) || void 0 === t ? void 0 : t.event) ||
              (null ===
                (s =
                  null === (r = e.filter) || void 0 === r ? void 0 : r.event) ||
              void 0 === s
                ? void 0
                : s.toLocaleLowerCase()) === n
            );
          })
          .map((e) => e.callback(h, r))
      : null === (i = this.bindings[n]) ||
        void 0 === i ||
        i
          .filter((e) => {
            let r, s, i, o, a, l;
            if (["broadcast", "presence", "postgres_changes"].includes(n)) {
              if ("id" in e) {
                const n = e.id,
                  o =
                    null === (r = e.filter) || void 0 === r ? void 0 : r.event;
                return (
                  n &&
                  (null === (s = t.ids) || void 0 === s
                    ? void 0
                    : s.includes(n)) &&
                  ("*" === o ||
                    (null == o ? void 0 : o.toLocaleLowerCase()) ===
                      (null === (i = t.data) || void 0 === i
                        ? void 0
                        : i.type.toLocaleLowerCase()))
                );
              }
              {
                const r =
                  null ===
                    (a =
                      null === (o = null == e ? void 0 : e.filter) ||
                      void 0 === o
                        ? void 0
                        : o.event) || void 0 === a
                    ? void 0
                    : a.toLocaleLowerCase();
                return (
                  "*" === r ||
                  r ===
                    (null === (l = null == t ? void 0 : t.event) || void 0 === l
                      ? void 0
                      : l.toLocaleLowerCase())
                );
              }
            }
            return e.type.toLocaleLowerCase() === n;
          })
          .map((e) => {
            if ("object" == typeof h && "ids" in h) {
              const e = h.data,
                {
                  schema: t,
                  table: r,
                  commit_timestamp: s,
                  type: i,
                  errors: n,
                } = e,
                o = {
                  schema: t,
                  table: r,
                  commit_timestamp: s,
                  eventType: i,
                  new: {},
                  old: {},
                  errors: n,
                };
              h = Object.assign(
                Object.assign({}, o),
                this._getPayloadRecords(e),
              );
            }
            e.callback(h, r);
          });
  }
  _isClosed() {
    return this.state === qe.closed;
  }
  _isJoined() {
    return this.state === qe.joined;
  }
  _isJoining() {
    return this.state === qe.joining;
  }
  _isLeaving() {
    return this.state === qe.leaving;
  }
  _replyEventName(e) {
    return `chan_reply_${e}`;
  }
  _on(e, t, r) {
    const s = e.toLocaleLowerCase(),
      i = { type: s, filter: t, callback: r };
    return (
      this.bindings[s] ? this.bindings[s].push(i) : (this.bindings[s] = [i]),
      this
    );
  }
  _off(e, t) {
    const r = e.toLocaleLowerCase();
    return (
      (this.bindings[r] = this.bindings[r].filter((e) => {
        let s;
        return !(
          (null === (s = e.type) || void 0 === s
            ? void 0
            : s.toLocaleLowerCase()) === r && gt.isEqual(e.filter, t)
        );
      })),
      this
    );
  }
  static isEqual(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length) return !1;
    for (const r in e) if (e[r] !== t[r]) return !1;
    return !0;
  }
  _rejoinUntilConnected() {
    (this.rejoinTimer.scheduleTimeout(),
      this.socket.isConnected() && this._rejoin());
  }
  _onClose(e) {
    this._on(Be.close, {}, e);
  }
  _onError(e) {
    this._on(Be.error, {}, (t) => e(t));
  }
  _canPush() {
    return this.socket.isConnected() && this._isJoined();
  }
  _rejoin(e = this.timeout) {
    this._isLeaving() ||
      (this.socket._leaveOpenTopic(this.topic),
      (this.state = qe.joining),
      this.joinPush.resend(e));
  }
  _getPayloadRecords(e) {
    const t = { new: {}, old: {} };
    return (
      ("INSERT" !== e.type && "UPDATE" !== e.type) ||
        (t.new = Ve(e.columns, e.record)),
      ("UPDATE" !== e.type && "DELETE" !== e.type) ||
        (t.old = Ve(e.columns, e.old_record)),
      t
    );
  }
}
const vt = () => {};
class yt {
  constructor(e, t) {
    let r;
    ((this.accessTokenValue = null),
      (this.apiKey = null),
      (this.channels = []),
      (this.endPoint = ""),
      (this.httpEndpoint = ""),
      (this.headers = Le),
      (this.params = {}),
      (this.timeout = 1e4),
      (this.heartbeatIntervalMs = 25e3),
      (this.heartbeatTimer = void 0),
      (this.pendingHeartbeatRef = null),
      (this.heartbeatCallback = vt),
      (this.ref = 0),
      (this.logger = vt),
      (this.conn = null),
      (this.sendBuffer = []),
      (this.serializer = new He()),
      (this.stateChangeCallbacks = {
        open: [],
        close: [],
        error: [],
        message: [],
      }),
      (this.accessToken = null),
      (this._resolveFetch = (e) => {
        let t;
        return (
          (t =
            e ||
            ("undefined" == typeof fetch
              ? (...e) =>
                  C(
                    async () => {
                      const { default: e } = await Promise.resolve().then(
                        () => X,
                      );
                      return { default: e };
                    },
                    void 0,
                    import.meta.url,
                  ).then(({ default: t }) => t(...e))
              : fetch)),
          (...e) => t(...e)
        );
      }),
      (this.endPoint = `${e}/${Fe.websocket}`),
      (this.httpEndpoint = it(e)),
      (null == t ? void 0 : t.transport)
        ? (this.transport = t.transport)
        : (this.transport = null),
      (null == t ? void 0 : t.params) && (this.params = t.params),
      (null == t ? void 0 : t.headers) &&
        (this.headers = Object.assign(
          Object.assign({}, this.headers),
          t.headers,
        )),
      (null == t ? void 0 : t.timeout) && (this.timeout = t.timeout),
      (null == t ? void 0 : t.logger) && (this.logger = t.logger),
      ((null == t ? void 0 : t.logLevel) ||
        (null == t ? void 0 : t.log_level)) &&
        ((this.logLevel = t.logLevel || t.log_level),
        (this.params = Object.assign(Object.assign({}, this.params), {
          log_level: this.logLevel,
        }))),
      (null == t ? void 0 : t.heartbeatIntervalMs) &&
        (this.heartbeatIntervalMs = t.heartbeatIntervalMs));
    const s =
      null === (r = null == t ? void 0 : t.params) || void 0 === r
        ? void 0
        : r.apikey;
    if (
      (s && ((this.accessTokenValue = s), (this.apiKey = s)),
      (this.reconnectAfterMs = (null == t ? void 0 : t.reconnectAfterMs)
        ? t.reconnectAfterMs
        : (e) => [1e3, 2e3, 5e3, 1e4][e - 1] || 1e4),
      (this.encode = (null == t ? void 0 : t.encode)
        ? t.encode
        : (e, t) => t(JSON.stringify(e))),
      (this.decode = (null == t ? void 0 : t.decode)
        ? t.decode
        : this.serializer.decode.bind(this.serializer)),
      (this.reconnectTimer = new Ge(async () => {
        (this.disconnect(), this.connect());
      }, this.reconnectAfterMs)),
      (this.fetch = this._resolveFetch(null == t ? void 0 : t.fetch)),
      null == t ? void 0 : t.worker)
    ) {
      if ("undefined" != typeof window && !window.Worker)
        throw new Error("Web Worker is not supported");
      ((this.worker = (null == t ? void 0 : t.worker) || !1),
        (this.workerUrl = null == t ? void 0 : t.workerUrl));
    }
    this.accessToken = (null == t ? void 0 : t.accessToken) || null;
  }
  connect() {
    this.conn ||
      (this.transport || (this.transport = xe),
      (this.conn = new this.transport(this.endpointURL(), void 0, {
        headers: this.headers,
      })),
      this.setupConnection());
  }
  endpointURL() {
    return this._appendParams(
      this.endPoint,
      Object.assign({}, this.params, { vsn: "1.0.0" }),
    );
  }
  disconnect(e, t) {
    this.conn &&
      ((this.conn.onclose = function () {}),
      e ? this.conn.close(e, null != t ? t : "") : this.conn.close(),
      (this.conn = null),
      this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      this.reconnectTimer.reset(),
      this.channels.forEach((e) => e.teardown()));
  }
  getChannels() {
    return this.channels;
  }
  async removeChannel(e) {
    const t = await e.unsubscribe();
    return (0 === this.channels.length && this.disconnect(), t);
  }
  async removeAllChannels() {
    const e = await Promise.all(this.channels.map((e) => e.unsubscribe()));
    return ((this.channels = []), this.disconnect(), e);
  }
  log(e, t, r) {
    this.logger(e, t, r);
  }
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case Ue.connecting:
        return ze.Connecting;
      case Ue.open:
        return ze.Open;
      case Ue.closing:
        return ze.Closing;
      default:
        return ze.Closed;
    }
  }
  isConnected() {
    return this.connectionState() === ze.Open;
  }
  channel(e, t = { config: {} }) {
    const r = `realtime:${e}`,
      s = this.getChannels().find((e) => e.topic === r);
    if (s) return s;
    {
      const r = new gt(`realtime:${e}`, t, this);
      return (this.channels.push(r), r);
    }
  }
  push(e) {
    const { topic: t, event: r, payload: s, ref: i } = e,
      n = () => {
        this.encode(e, (e) => {
          let t;
          null === (t = this.conn) || void 0 === t || t.send(e);
        });
      };
    (this.log("push", `${t} ${r} (${i})`, s),
      this.isConnected() ? n() : this.sendBuffer.push(n));
  }
  async setAuth(e = null) {
    const t =
      e ||
      (this.accessToken && (await this.accessToken())) ||
      this.accessTokenValue;
    this.accessTokenValue != t &&
      ((this.accessTokenValue = t),
      this.channels.forEach((e) => {
        (t &&
          e.updateJoinPayload({
            access_token: t,
            version: this.headers && this.headers["X-Client-Info"],
          }),
          e.joinedOnce &&
            e._isJoined() &&
            e._push(Be.access_token, { access_token: t }));
      }));
  }
  async sendHeartbeat() {
    let e;
    if (this.isConnected()) {
      if (this.pendingHeartbeatRef)
        return (
          (this.pendingHeartbeatRef = null),
          this.log(
            "transport",
            "heartbeat timeout. Attempting to re-establish connection",
          ),
          this.heartbeatCallback("timeout"),
          void (
            null === (e = this.conn) ||
            void 0 === e ||
            e.close(1e3, "hearbeat timeout")
          )
        );
      ((this.pendingHeartbeatRef = this._makeRef()),
        this.push({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: this.pendingHeartbeatRef,
        }),
        this.heartbeatCallback("sent"),
        await this.setAuth());
    } else this.heartbeatCallback("disconnected");
  }
  onHeartbeat(e) {
    this.heartbeatCallback = e;
  }
  flushSendBuffer() {
    this.isConnected() &&
      this.sendBuffer.length > 0 &&
      (this.sendBuffer.forEach((e) => e()), (this.sendBuffer = []));
  }
  _makeRef() {
    const e = this.ref + 1;
    return (
      e === this.ref ? (this.ref = 0) : (this.ref = e),
      this.ref.toString()
    );
  }
  _leaveOpenTopic(e) {
    const t = this.channels.find(
      (t) => t.topic === e && (t._isJoined() || t._isJoining()),
    );
    t &&
      (this.log("transport", `leaving duplicate topic "${e}"`),
      t.unsubscribe());
  }
  _remove(e) {
    this.channels = this.channels.filter((t) => t.topic !== e.topic);
  }
  setupConnection() {
    this.conn &&
      ((this.conn.binaryType = "arraybuffer"),
      (this.conn.onopen = () => this._onConnOpen()),
      (this.conn.onerror = (e) => this._onConnError(e)),
      (this.conn.onmessage = (e) => this._onConnMessage(e)),
      (this.conn.onclose = (e) => this._onConnClose(e)));
  }
  _onConnMessage(e) {
    this.decode(e.data, (e) => {
      const { topic: t, event: r, payload: s, ref: i } = e;
      ("phoenix" === t &&
        "phx_reply" === r &&
        this.heartbeatCallback("ok" == e.payload.status ? "ok" : "error"),
        i &&
          i === this.pendingHeartbeatRef &&
          (this.pendingHeartbeatRef = null),
        this.log(
          "receive",
          `${s.status || ""} ${t} ${r} ${(i && "(" + i + ")") || ""}`,
          s,
        ),
        Array.from(this.channels)
          .filter((e) => e._isMember(t))
          .forEach((e) => e._trigger(r, s, i)),
        this.stateChangeCallbacks.message.forEach((t) => t(e)));
    });
  }
  _onConnOpen() {
    (this.log("transport", `connected to ${this.endpointURL()}`),
      this.flushSendBuffer(),
      this.reconnectTimer.reset(),
      this.worker
        ? this.workerRef || this._startWorkerHeartbeat()
        : this._startHeartbeat(),
      this.stateChangeCallbacks.open.forEach((e) => e()));
  }
  _startHeartbeat() {
    (this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = setInterval(
        () => this.sendHeartbeat(),
        this.heartbeatIntervalMs,
      )));
  }
  _startWorkerHeartbeat() {
    this.workerUrl
      ? this.log("worker", `starting worker for from ${this.workerUrl}`)
      : this.log("worker", "starting default worker");
    const e = this._workerObjectUrl(this.workerUrl);
    ((this.workerRef = new Worker(e)),
      (this.workerRef.onerror = (e) => {
        (this.log("worker", "worker error", e.message),
          this.workerRef.terminate());
      }),
      (this.workerRef.onmessage = (e) => {
        "keepAlive" === e.data.event && this.sendHeartbeat();
      }),
      this.workerRef.postMessage({
        event: "start",
        interval: this.heartbeatIntervalMs,
      }));
  }
  _onConnClose(e) {
    (this.log("transport", "close", e),
      this._triggerChanError(),
      this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      this.reconnectTimer.scheduleTimeout(),
      this.stateChangeCallbacks.close.forEach((t) => t(e)));
  }
  _onConnError(e) {
    (this.log("transport", `${e}`),
      this._triggerChanError(),
      this.stateChangeCallbacks.error.forEach((t) => t(e)));
  }
  _triggerChanError() {
    this.channels.forEach((e) => e._trigger(Be.error));
  }
  _appendParams(e, t) {
    if (0 === Object.keys(t).length) return e;
    const r = e.match(/\?/) ? "&" : "?";
    return `${e}${r}${new URLSearchParams(t)}`;
  }
  _workerObjectUrl(e) {
    let t;
    if (e) t = e;
    else {
      const e = new Blob(
        [
          '\n  addEventListener("message", (e) => {\n    if (e.data.event === "start") {\n      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);\n    }\n  });',
        ],
        { type: "application/javascript" },
      );
      t = URL.createObjectURL(e);
    }
    return t;
  }
}
class mt extends Error {
  constructor(e) {
    (super(e), (this.__isStorageError = !0), (this.name = "StorageError"));
  }
}
function wt(e) {
  return "object" == typeof e && null !== e && "__isStorageError" in e;
}
class _t extends mt {
  constructor(e, t) {
    (super(e), (this.name = "StorageApiError"), (this.status = t));
  }
  toJSON() {
    return { name: this.name, message: this.message, status: this.status };
  }
}
class bt extends mt {
  constructor(e, t) {
    (super(e), (this.name = "StorageUnknownError"), (this.originalError = t));
  }
}
const kt = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
const Tt = (e) => {
    let t;
    return (
      (t =
        e ||
        ("undefined" == typeof fetch
          ? (...e) =>
              C(
                async () => {
                  const { default: e } = await Promise.resolve().then(() => X);
                  return { default: e };
                },
                void 0,
                import.meta.url,
              ).then(({ default: t }) => t(...e))
          : fetch)),
      (...e) => t(...e)
    );
  },
  St = (e) => {
    if (Array.isArray(e)) return e.map((e) => St(e));
    if ("function" == typeof e || e !== Object(e)) return e;
    const t = {};
    return (
      Object.entries(e).forEach(([e, r]) => {
        const s = e.replace(/([-_][a-z])/gi, (e) =>
          e.toUpperCase().replace(/[-_]/g, ""),
        );
        t[s] = St(r);
      }),
      t
    );
  };
const Et = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
const jt = (e) =>
    e.msg || e.message || e.error_description || e.error || JSON.stringify(e),
  Ot = (e, t, r) =>
    Et(void 0, void 0, void 0, function* () {
      const s = yield kt(void 0, void 0, void 0, function* () {
        return "undefined" == typeof Response
          ? (yield C(
              () => Promise.resolve().then(() => X),
              void 0,
              import.meta.url,
            )).Response
          : Response;
      });
      e instanceof s && !(null == r ? void 0 : r.noResolveJson)
        ? e
            .json()
            .then((r) => {
              t(new _t(jt(r), e.status || 500));
            })
            .catch((e) => {
              t(new bt(jt(e), e));
            })
        : t(new bt(jt(e), e));
    });
function Pt(e, t, r, s, i, n) {
  return Et(this, void 0, void 0, function* () {
    return new Promise((o, a) => {
      e(
        r,
        ((e, t, r, s) => {
          const i = {
            method: e,
            headers: (null == t ? void 0 : t.headers) || {},
          };
          return "GET" === e
            ? i
            : ((i.headers = Object.assign(
                { "Content-Type": "application/json" },
                null == t ? void 0 : t.headers,
              )),
              s && (i.body = JSON.stringify(s)),
              Object.assign(Object.assign({}, i), r));
        })(t, s, i, n),
      )
        .then((e) => {
          if (!e.ok) throw e;
          return (null == s ? void 0 : s.noResolveJson) ? e : e.json();
        })
        .then((e) => o(e))
        .catch((e) => Ot(e, a, s));
    });
  });
}
function Ct(e, t, r, s) {
  return Et(this, void 0, void 0, function* () {
    return Pt(e, "GET", t, r, s);
  });
}
function At(e, t, r, s, i) {
  return Et(this, void 0, void 0, function* () {
    return Pt(e, "POST", t, s, i, r);
  });
}
function $t(e, t, r, s, i) {
  return Et(this, void 0, void 0, function* () {
    return Pt(e, "DELETE", t, s, i, r);
  });
}
const It = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
const Rt = { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } },
  xt = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: !1,
  };
class Lt {
  constructor(e, t = {}, r, s) {
    ((this.url = e),
      (this.headers = t),
      (this.bucketId = r),
      (this.fetch = Tt(s)));
  }
  uploadOrUpdate(e, t, r, s) {
    return It(this, void 0, void 0, function* () {
      try {
        let i;
        const n = Object.assign(Object.assign({}, xt), s);
        let o = Object.assign(
          Object.assign({}, this.headers),
          "POST" === e && { "x-upsert": String(n.upsert) },
        );
        const a = n.metadata;
        ("undefined" != typeof Blob && r instanceof Blob
          ? ((i = new FormData()),
            i.append("cacheControl", n.cacheControl),
            a && i.append("metadata", this.encodeMetadata(a)),
            i.append("", r))
          : "undefined" != typeof FormData && r instanceof FormData
            ? ((i = r),
              i.append("cacheControl", n.cacheControl),
              a && i.append("metadata", this.encodeMetadata(a)))
            : ((i = r),
              (o["cache-control"] = `max-age=${n.cacheControl}`),
              (o["content-type"] = n.contentType),
              a && (o["x-metadata"] = this.toBase64(this.encodeMetadata(a)))),
          (null == s ? void 0 : s.headers) &&
            (o = Object.assign(Object.assign({}, o), s.headers)));
        const l = this._removeEmptyFolders(t),
          c = this._getFinalPath(l),
          h = yield this.fetch(
            `${this.url}/object/${c}`,
            Object.assign(
              { method: e, body: i, headers: o },
              (null == n ? void 0 : n.duplex) ? { duplex: n.duplex } : {},
            ),
          ),
          u = yield h.json();
        if (h.ok)
          return { data: { path: l, id: u.Id, fullPath: u.Key }, error: null };
        return { data: null, error: u };
      } catch (i) {
        if (wt(i)) return { data: null, error: i };
        throw i;
      }
    });
  }
  upload(e, t, r) {
    return It(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("POST", e, t, r);
    });
  }
  uploadToSignedUrl(e, t, r, s) {
    return It(this, void 0, void 0, function* () {
      const i = this._removeEmptyFolders(e),
        n = this._getFinalPath(i),
        o = new URL(this.url + `/object/upload/sign/${n}`);
      o.searchParams.set("token", t);
      try {
        let e;
        const t = Object.assign({ upsert: xt.upsert }, s),
          n = Object.assign(Object.assign({}, this.headers), {
            "x-upsert": String(t.upsert),
          });
        "undefined" != typeof Blob && r instanceof Blob
          ? ((e = new FormData()),
            e.append("cacheControl", t.cacheControl),
            e.append("", r))
          : "undefined" != typeof FormData && r instanceof FormData
            ? ((e = r), e.append("cacheControl", t.cacheControl))
            : ((e = r),
              (n["cache-control"] = `max-age=${t.cacheControl}`),
              (n["content-type"] = t.contentType));
        const a = yield this.fetch(o.toString(), {
            method: "PUT",
            body: e,
            headers: n,
          }),
          l = yield a.json();
        if (a.ok) return { data: { path: i, fullPath: l.Key }, error: null };
        return { data: null, error: l };
      } catch (a) {
        if (wt(a)) return { data: null, error: a };
        throw a;
      }
    });
  }
  createSignedUploadUrl(e, t) {
    return It(this, void 0, void 0, function* () {
      try {
        const r = this._getFinalPath(e);
        const s = Object.assign({}, this.headers);
        (null == t ? void 0 : t.upsert) && (s["x-upsert"] = "true");
        const i = yield At(
            this.fetch,
            `${this.url}/object/upload/sign/${r}`,
            {},
            { headers: s },
          ),
          n = new URL(this.url + i.url),
          o = n.searchParams.get("token");
        if (!o) throw new mt("No token returned by API");
        return {
          data: { signedUrl: n.toString(), path: e, token: o },
          error: null,
        };
      } catch (r) {
        if (wt(r)) return { data: null, error: r };
        throw r;
      }
    });
  }
  update(e, t, r) {
    return It(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("PUT", e, t, r);
    });
  }
  move(e, t, r) {
    return It(this, void 0, void 0, function* () {
      try {
        return {
          data: yield At(
            this.fetch,
            `${this.url}/object/move`,
            {
              bucketId: this.bucketId,
              sourceKey: e,
              destinationKey: t,
              destinationBucket: null == r ? void 0 : r.destinationBucket,
            },
            { headers: this.headers },
          ),
          error: null,
        };
      } catch (s) {
        if (wt(s)) return { data: null, error: s };
        throw s;
      }
    });
  }
  copy(e, t, r) {
    return It(this, void 0, void 0, function* () {
      try {
        return {
          data: {
            path: (yield At(
              this.fetch,
              `${this.url}/object/copy`,
              {
                bucketId: this.bucketId,
                sourceKey: e,
                destinationKey: t,
                destinationBucket: null == r ? void 0 : r.destinationBucket,
              },
              { headers: this.headers },
            )).Key,
          },
          error: null,
        };
      } catch (s) {
        if (wt(s)) return { data: null, error: s };
        throw s;
      }
    });
  }
  createSignedUrl(e, t, r) {
    return It(this, void 0, void 0, function* () {
      try {
        let s = this._getFinalPath(e),
          i = yield At(
            this.fetch,
            `${this.url}/object/sign/${s}`,
            Object.assign(
              { expiresIn: t },
              (null == r ? void 0 : r.transform)
                ? { transform: r.transform }
                : {},
            ),
            { headers: this.headers },
          );
        const n = (null == r ? void 0 : r.download)
          ? `&download=${!0 === r.download ? "" : r.download}`
          : "";
        return (
          (i = { signedUrl: encodeURI(`${this.url}${i.signedURL}${n}`) }),
          { data: i, error: null }
        );
      } catch (s) {
        if (wt(s)) return { data: null, error: s };
        throw s;
      }
    });
  }
  createSignedUrls(e, t, r) {
    return It(this, void 0, void 0, function* () {
      try {
        const s = yield At(
            this.fetch,
            `${this.url}/object/sign/${this.bucketId}`,
            { expiresIn: t, paths: e },
            { headers: this.headers },
          ),
          i = (null == r ? void 0 : r.download)
            ? `&download=${!0 === r.download ? "" : r.download}`
            : "";
        return {
          data: s.map((e) =>
            Object.assign(Object.assign({}, e), {
              signedUrl: e.signedURL
                ? encodeURI(`${this.url}${e.signedURL}${i}`)
                : null,
            }),
          ),
          error: null,
        };
      } catch (s) {
        if (wt(s)) return { data: null, error: s };
        throw s;
      }
    });
  }
  download(e, t) {
    return It(this, void 0, void 0, function* () {
      const r =
          void 0 !== (null == t ? void 0 : t.transform)
            ? "render/image/authenticated"
            : "object",
        s = this.transformOptsToQueryString(
          (null == t ? void 0 : t.transform) || {},
        ),
        i = s ? `?${s}` : "";
      try {
        const t = this._getFinalPath(e),
          s = yield Ct(this.fetch, `${this.url}/${r}/${t}${i}`, {
            headers: this.headers,
            noResolveJson: !0,
          });
        return { data: yield s.blob(), error: null };
      } catch (n) {
        if (wt(n)) return { data: null, error: n };
        throw n;
      }
    });
  }
  info(e) {
    return It(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        const e = yield Ct(this.fetch, `${this.url}/object/info/${t}`, {
          headers: this.headers,
        });
        return { data: St(e), error: null };
      } catch (r) {
        if (wt(r)) return { data: null, error: r };
        throw r;
      }
    });
  }
  exists(e) {
    return It(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        return (
          yield (function (e, t, r, s) {
            return Et(this, void 0, void 0, function* () {
              return Pt(
                e,
                "HEAD",
                t,
                Object.assign(Object.assign({}, r), { noResolveJson: !0 }),
                s,
              );
            });
          })(this.fetch, `${this.url}/object/${t}`, { headers: this.headers }),
          { data: !0, error: null }
        );
      } catch (r) {
        if (wt(r) && r instanceof bt) {
          const e = r.originalError;
          if ([400, 404].includes(null == e ? void 0 : e.status))
            return { data: !1, error: r };
        }
        throw r;
      }
    });
  }
  getPublicUrl(e, t) {
    const r = this._getFinalPath(e),
      s = [],
      i = (null == t ? void 0 : t.download)
        ? `download=${!0 === t.download ? "" : t.download}`
        : "";
    "" !== i && s.push(i);
    const n =
        void 0 !== (null == t ? void 0 : t.transform)
          ? "render/image"
          : "object",
      o = this.transformOptsToQueryString(
        (null == t ? void 0 : t.transform) || {},
      );
    "" !== o && s.push(o);
    let a = s.join("&");
    return (
      "" !== a && (a = `?${a}`),
      { data: { publicUrl: encodeURI(`${this.url}/${n}/public/${r}${a}`) } }
    );
  }
  remove(e) {
    return It(this, void 0, void 0, function* () {
      try {
        return {
          data: yield $t(
            this.fetch,
            `${this.url}/object/${this.bucketId}`,
            { prefixes: e },
            { headers: this.headers },
          ),
          error: null,
        };
      } catch (t) {
        if (wt(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
  list(e, t, r) {
    return It(this, void 0, void 0, function* () {
      try {
        const s = Object.assign(Object.assign(Object.assign({}, Rt), t), {
          prefix: e || "",
        });
        return {
          data: yield At(
            this.fetch,
            `${this.url}/object/list/${this.bucketId}`,
            s,
            { headers: this.headers },
            r,
          ),
          error: null,
        };
      } catch (s) {
        if (wt(s)) return { data: null, error: s };
        throw s;
      }
    });
  }
  encodeMetadata(e) {
    return JSON.stringify(e);
  }
  toBase64(e) {
    return "undefined" != typeof Buffer
      ? Buffer.from(e).toString("base64")
      : btoa(e);
  }
  _getFinalPath(e) {
    return `${this.bucketId}/${e}`;
  }
  _removeEmptyFolders(e) {
    return e.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
  }
  transformOptsToQueryString(e) {
    const t = [];
    return (
      e.width && t.push(`width=${e.width}`),
      e.height && t.push(`height=${e.height}`),
      e.resize && t.push(`resize=${e.resize}`),
      e.format && t.push(`format=${e.format}`),
      e.quality && t.push(`quality=${e.quality}`),
      t.join("&")
    );
  }
}
const Ut = { "X-Client-Info": "storage-js/2.7.1" };
const Dt = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
class qt {
  constructor(e, t = {}, r) {
    ((this.url = e),
      (this.headers = Object.assign(Object.assign({}, Ut), t)),
      (this.fetch = Tt(r)));
  }
  listBuckets() {
    return Dt(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Ct(this.fetch, `${this.url}/bucket`, {
            headers: this.headers,
          }),
          error: null,
        };
      } catch (e) {
        if (wt(e)) return { data: null, error: e };
        throw e;
      }
    });
  }
  getBucket(e) {
    return Dt(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Ct(this.fetch, `${this.url}/bucket/${e}`, {
            headers: this.headers,
          }),
          error: null,
        };
      } catch (t) {
        if (wt(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
  createBucket(e, t = { public: !1 }) {
    return Dt(this, void 0, void 0, function* () {
      try {
        return {
          data: yield At(
            this.fetch,
            `${this.url}/bucket`,
            {
              id: e,
              name: e,
              public: t.public,
              file_size_limit: t.fileSizeLimit,
              allowed_mime_types: t.allowedMimeTypes,
            },
            { headers: this.headers },
          ),
          error: null,
        };
      } catch (r) {
        if (wt(r)) return { data: null, error: r };
        throw r;
      }
    });
  }
  updateBucket(e, t) {
    return Dt(this, void 0, void 0, function* () {
      try {
        const r = yield (function (e, t, r, s, i) {
          return Et(this, void 0, void 0, function* () {
            return Pt(e, "PUT", t, s, i, r);
          });
        })(
          this.fetch,
          `${this.url}/bucket/${e}`,
          {
            id: e,
            name: e,
            public: t.public,
            file_size_limit: t.fileSizeLimit,
            allowed_mime_types: t.allowedMimeTypes,
          },
          { headers: this.headers },
        );
        return { data: r, error: null };
      } catch (r) {
        if (wt(r)) return { data: null, error: r };
        throw r;
      }
    });
  }
  emptyBucket(e) {
    return Dt(this, void 0, void 0, function* () {
      try {
        return {
          data: yield At(
            this.fetch,
            `${this.url}/bucket/${e}/empty`,
            {},
            { headers: this.headers },
          ),
          error: null,
        };
      } catch (t) {
        if (wt(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
  deleteBucket(e) {
    return Dt(this, void 0, void 0, function* () {
      try {
        return {
          data: yield $t(
            this.fetch,
            `${this.url}/bucket/${e}`,
            {},
            { headers: this.headers },
          ),
          error: null,
        };
      } catch (t) {
        if (wt(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
}
class Nt extends qt {
  constructor(e, t = {}, r) {
    super(e, t, r);
  }
  from(e) {
    return new Lt(this.url, this.headers, e, this.fetch);
  }
}
let Bt = "";
Bt =
  "undefined" != typeof Deno
    ? "deno"
    : "undefined" != typeof document
      ? "web"
      : "undefined" != typeof navigator && "ReactNative" === navigator.product
        ? "react-native"
        : "node";
const Mt = { headers: { "X-Client-Info": `supabase-js-${Bt}/2.50.1` } },
  Ft = { schema: "public" },
  zt = {
    autoRefreshToken: !0,
    persistSession: !0,
    detectSessionInUrl: !0,
    flowType: "implicit",
  },
  Jt = {};
const Wt = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
const Kt = (e, t, r) => {
  const s = ((e) => {
      let t;
      return (
        (t = e || ("undefined" == typeof fetch ? G : fetch)),
        (...e) => t(...e)
      );
    })(r),
    i = "undefined" == typeof Headers ? V : Headers;
  return (r, n) =>
    Wt(void 0, void 0, void 0, function* () {
      let o;
      const a = null !== (o = yield t()) && void 0 !== o ? o : e;
      const l = new i(null == n ? void 0 : n.headers);
      return (
        l.has("apikey") || l.set("apikey", e),
        l.has("Authorization") || l.set("Authorization", `Bearer ${a}`),
        s(r, Object.assign(Object.assign({}, n), { headers: l }))
      );
    });
};
const Ht = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
const Gt = "2.70.0",
  Vt = 3e4,
  Qt = 9e4,
  Yt = { "X-Client-Info": `gotrue-js/${Gt}` },
  Xt = "X-Supabase-Api-Version",
  Zt = { timestamp: Date.parse("2024-01-01T00:00:00.0Z"), name: "2024-01-01" },
  er = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
class tr extends Error {
  constructor(e, t, r) {
    (super(e),
      (this.__isAuthError = !0),
      (this.name = "AuthError"),
      (this.status = t),
      (this.code = r));
  }
}
function rr(e) {
  return "object" == typeof e && null !== e && "__isAuthError" in e;
}
class sr extends tr {
  constructor(e, t, r) {
    (super(e, t, r),
      (this.name = "AuthApiError"),
      (this.status = t),
      (this.code = r));
  }
}
class ir extends tr {
  constructor(e, t) {
    (super(e), (this.name = "AuthUnknownError"), (this.originalError = t));
  }
}
class nr extends tr {
  constructor(e, t, r, s) {
    (super(e, r, s), (this.name = t), (this.status = r));
  }
}
class or extends nr {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
  }
}
class ar extends nr {
  constructor() {
    super(
      "Auth session or user missing",
      "AuthInvalidTokenResponseError",
      500,
      void 0,
    );
  }
}
class lr extends nr {
  constructor(e) {
    super(e, "AuthInvalidCredentialsError", 400, void 0);
  }
}
class cr extends nr {
  constructor(e, t = null) {
    (super(e, "AuthImplicitGrantRedirectError", 500, void 0),
      (this.details = null),
      (this.details = t));
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}
class hr extends nr {
  constructor(e, t = null) {
    (super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0),
      (this.details = null),
      (this.details = t));
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}
class ur extends nr {
  constructor(e, t) {
    super(e, "AuthRetryableFetchError", t, void 0);
  }
}
function dr(e) {
  return rr(e) && "AuthRetryableFetchError" === e.name;
}
class fr extends nr {
  constructor(e, t, r) {
    (super(e, "AuthWeakPasswordError", t, "weak_password"), (this.reasons = r));
  }
}
class pr extends nr {
  constructor(e) {
    super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
  }
}
const gr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(
      "",
    ),
  vr = " \t\n\r=".split(""),
  yr = (() => {
    const e = new Array(128);
    for (let t = 0; t < e.length; t += 1) e[t] = -1;
    for (let t = 0; t < vr.length; t += 1) e[vr[t].charCodeAt(0)] = -2;
    for (let t = 0; t < gr.length; t += 1) e[gr[t].charCodeAt(0)] = t;
    return e;
  })();
function mr(e, t, r) {
  if (null !== e)
    for (t.queue = (t.queue << 8) | e, t.queuedBits += 8; t.queuedBits >= 6; ) {
      const e = (t.queue >> (t.queuedBits - 6)) & 63;
      (r(gr[e]), (t.queuedBits -= 6));
    }
  else if (t.queuedBits > 0)
    for (
      t.queue = t.queue << (6 - t.queuedBits), t.queuedBits = 6;
      t.queuedBits >= 6;

    ) {
      const e = (t.queue >> (t.queuedBits - 6)) & 63;
      (r(gr[e]), (t.queuedBits -= 6));
    }
}
function wr(e, t, r) {
  const s = yr[e];
  if (!(s > -1)) {
    if (-2 === s) return;
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(e)}"`);
  }
  for (t.queue = (t.queue << 6) | s, t.queuedBits += 6; t.queuedBits >= 8; )
    (r((t.queue >> (t.queuedBits - 8)) & 255), (t.queuedBits -= 8));
}
function _r(e) {
  const t = [],
    r = (e) => {
      t.push(String.fromCodePoint(e));
    },
    s = { utf8seq: 0, codepoint: 0 },
    i = { queue: 0, queuedBits: 0 },
    n = (e) => {
      !(function (e, t, r) {
        if (0 === t.utf8seq) {
          if (e <= 127) return void r(e);
          for (let r = 1; r < 6; r += 1)
            if (!((e >> (7 - r)) & 1)) {
              t.utf8seq = r;
              break;
            }
          if (2 === t.utf8seq) t.codepoint = 31 & e;
          else if (3 === t.utf8seq) t.codepoint = 15 & e;
          else {
            if (4 !== t.utf8seq) throw new Error("Invalid UTF-8 sequence");
            t.codepoint = 7 & e;
          }
          t.utf8seq -= 1;
        } else if (t.utf8seq > 0) {
          if (e <= 127) throw new Error("Invalid UTF-8 sequence");
          ((t.codepoint = (t.codepoint << 6) | (63 & e)),
            (t.utf8seq -= 1),
            0 === t.utf8seq && r(t.codepoint));
        }
      })(e, s, r);
    };
  for (let o = 0; o < e.length; o += 1) wr(e.charCodeAt(o), i, n);
  return t.join("");
}
function br(e, t) {
  if (!(e <= 127)) {
    if (e <= 2047) return (t(192 | (e >> 6)), void t(128 | (63 & e)));
    if (e <= 65535)
      return (
        t(224 | (e >> 12)),
        t(128 | ((e >> 6) & 63)),
        void t(128 | (63 & e))
      );
    if (e <= 1114111)
      return (
        t(240 | (e >> 18)),
        t(128 | ((e >> 12) & 63)),
        t(128 | ((e >> 6) & 63)),
        void t(128 | (63 & e))
      );
    throw new Error(`Unrecognized Unicode codepoint: ${e.toString(16)}`);
  }
  t(e);
}
function kr(e) {
  const t = [],
    r = { queue: 0, queuedBits: 0 },
    s = (e) => {
      t.push(e);
    };
  for (let i = 0; i < e.length; i += 1) wr(e.charCodeAt(i), r, s);
  return new Uint8Array(t);
}
function Tr(e) {
  const t = [];
  return (
    (function (e, t) {
      for (let r = 0; r < e.length; r += 1) {
        let s = e.charCodeAt(r);
        if (s > 55295 && s <= 56319) {
          const t = (1024 * (s - 55296)) & 65535;
          ((s = 65536 + (((e.charCodeAt(r + 1) - 56320) & 65535) | t)),
            (r += 1));
        }
        br(s, t);
      }
    })(e, (e) => t.push(e)),
    new Uint8Array(t)
  );
}
function Sr(e) {
  const t = [],
    r = { queue: 0, queuedBits: 0 },
    s = (e) => {
      t.push(e);
    };
  return (e.forEach((e) => mr(e, r, s)), mr(null, r, s), t.join(""));
}
const Er = () => "undefined" != typeof window && "undefined" != typeof document,
  jr = { tested: !1, writable: !1 },
  Or = () => {
    if (!Er()) return !1;
    try {
      if ("object" != typeof globalThis.localStorage) return !1;
    } catch (t) {
      return !1;
    }
    if (jr.tested) return jr.writable;
    const e = `lswt-${Math.random()}${Math.random()}`;
    try {
      (globalThis.localStorage.setItem(e, e),
        globalThis.localStorage.removeItem(e),
        (jr.tested = !0),
        (jr.writable = !0));
    } catch (t) {
      ((jr.tested = !0), (jr.writable = !1));
    }
    return jr.writable;
  };
const Pr = (e) => {
    let t;
    return (
      (t =
        e ||
        ("undefined" == typeof fetch
          ? (...e) =>
              C(
                async () => {
                  const { default: e } = await Promise.resolve().then(() => X);
                  return { default: e };
                },
                void 0,
                import.meta.url,
              ).then(({ default: t }) => t(...e))
          : fetch)),
      (...e) => t(...e)
    );
  },
  Cr = async (e, t, r) => {
    await e.setItem(t, JSON.stringify(r));
  },
  Ar = async (e, t) => {
    const r = await e.getItem(t);
    if (!r) return null;
    try {
      return JSON.parse(r);
    } catch (s) {
      return r;
    }
  },
  $r = async (e, t) => {
    await e.removeItem(t);
  };
class Ir {
  constructor() {
    this.promise = new Ir.promiseConstructor((e, t) => {
      ((this.resolve = e), (this.reject = t));
    });
  }
}
function Rr(e) {
  const t = e.split(".");
  if (3 !== t.length) throw new pr("Invalid JWT structure");
  for (let r = 0; r < t.length; r++)
    if (!er.test(t[r])) throw new pr("JWT not in base64url format");
  return {
    header: JSON.parse(_r(t[0])),
    payload: JSON.parse(_r(t[1])),
    signature: kr(t[2]),
    raw: { header: t[0], payload: t[1] },
  };
}
function xr(e) {
  return ("0" + e.toString(16)).substr(-2);
}
async function Lr(e) {
  if (
    !(
      "undefined" != typeof crypto &&
      void 0 !== crypto.subtle &&
      "undefined" != typeof TextEncoder
    )
  )
    return (
      console.warn(
        "WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.",
      ),
      e
    );
  const t = await (async function (e) {
    const t = new TextEncoder().encode(e),
      r = await crypto.subtle.digest("SHA-256", t),
      s = new Uint8Array(r);
    return Array.from(s)
      .map((e) => String.fromCharCode(e))
      .join("");
  })(e);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function Ur(e, t, r = !1) {
  const s = (function () {
    const e = new Uint32Array(56);
    if ("undefined" == typeof crypto) {
      const e =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",
        t = e.length;
      let r = "";
      for (let s = 0; s < 56; s++) r += e.charAt(Math.floor(Math.random() * t));
      return r;
    }
    return (crypto.getRandomValues(e), Array.from(e, xr).join(""));
  })();
  let i = s;
  (r && (i += "/PASSWORD_RECOVERY"), await Cr(e, `${t}-code-verifier`, i));
  const n = await Lr(s);
  return [n, s === n ? "plain" : "s256"];
}
Ir.promiseConstructor = Promise;
const Dr = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
const qr = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function Nr(e) {
  if (!qr.test(e))
    throw new Error(
      "@supabase/auth-js: Expected parameter to be UUID but is not",
    );
}
const Br = (e) =>
    e.msg || e.message || e.error_description || e.error || JSON.stringify(e),
  Mr = [502, 503, 504];
async function Fr(e) {
  let t, r;
  if (
    !(
      "object" == typeof (r = e) &&
      null !== r &&
      "status" in r &&
      "ok" in r &&
      "json" in r &&
      "function" == typeof r.json
    )
  )
    throw new ur(Br(e), 0);
  if (Mr.includes(e.status)) throw new ur(Br(e), e.status);
  let s, i;
  try {
    s = await e.json();
  } catch (o) {
    throw new ir(Br(o), o);
  }
  const n = (function (e) {
    const t = e.headers.get(Xt);
    if (!t) return null;
    if (!t.match(Dr)) return null;
    try {
      return new Date(`${t}T00:00:00.0Z`);
    } catch (o) {
      return null;
    }
  })(e);
  if (
    (n &&
    n.getTime() >= Zt.timestamp &&
    "object" == typeof s &&
    s &&
    "string" == typeof s.code
      ? (i = s.code)
      : "object" == typeof s &&
        s &&
        "string" == typeof s.error_code &&
        (i = s.error_code),
    i)
  ) {
    if ("weak_password" === i)
      throw new fr(
        Br(s),
        e.status,
        (null === (t = s.weak_password) || void 0 === t ? void 0 : t.reasons) ||
          [],
      );
    if ("session_not_found" === i) throw new or();
  } else if (
    "object" == typeof s &&
    s &&
    "object" == typeof s.weak_password &&
    s.weak_password &&
    Array.isArray(s.weak_password.reasons) &&
    s.weak_password.reasons.length &&
    s.weak_password.reasons.reduce((e, t) => e && "string" == typeof t, !0)
  )
    throw new fr(Br(s), e.status, s.weak_password.reasons);
  throw new sr(Br(s), e.status || 500, i);
}
async function zr(e, t, r, s) {
  let i;
  const n = Object.assign({}, null == s ? void 0 : s.headers);
  (n[Xt] || (n[Xt] = Zt.name),
    (null == s ? void 0 : s.jwt) && (n.Authorization = `Bearer ${s.jwt}`));
  const o =
    null !== (i = null == s ? void 0 : s.query) && void 0 !== i ? i : {};
  (null == s ? void 0 : s.redirectTo) && (o.redirect_to = s.redirectTo);
  const a = Object.keys(o).length
      ? "?" + new URLSearchParams(o).toString()
      : "",
    l = await (async function (e, t, r, s, i, n) {
      const o = ((e, t, r, s) => {
        const i = {
          method: e,
          headers: (null == t ? void 0 : t.headers) || {},
        };
        return "GET" === e
          ? i
          : ((i.headers = Object.assign(
              { "Content-Type": "application/json;charset=UTF-8" },
              null == t ? void 0 : t.headers,
            )),
            (i.body = JSON.stringify(s)),
            Object.assign(Object.assign({}, i), r));
      })(t, s, i, n);
      let a;
      try {
        a = await e(r, Object.assign({}, o));
      } catch (l) {
        throw (console.error(l), new ur(Br(l), 0));
      }
      a.ok || (await Fr(a));
      if (null == s ? void 0 : s.noResolveJson) return a;
      try {
        return await a.json();
      } catch (l) {
        await Fr(l);
      }
    })(
      e,
      t,
      r + a,
      { headers: n, noResolveJson: null == s ? void 0 : s.noResolveJson },
      {},
      null == s ? void 0 : s.body,
    );
  return (null == s ? void 0 : s.xform)
    ? null == s
      ? void 0
      : s.xform(l)
    : { data: Object.assign({}, l), error: null };
}
function Jr(e) {
  let t;
  let r = null;
  let s;
  (function (e) {
    return e.access_token && e.refresh_token && e.expires_in;
  })(e) &&
    ((r = Object.assign({}, e)),
    e.expires_at ||
      (r.expires_at = ((s = e.expires_in), Math.round(Date.now() / 1e3) + s)));
  return {
    data: { session: r, user: null !== (t = e.user) && void 0 !== t ? t : e },
    error: null,
  };
}
function Wr(e) {
  const t = Jr(e);
  return (
    !t.error &&
      e.weak_password &&
      "object" == typeof e.weak_password &&
      Array.isArray(e.weak_password.reasons) &&
      e.weak_password.reasons.length &&
      e.weak_password.message &&
      "string" == typeof e.weak_password.message &&
      e.weak_password.reasons.reduce((e, t) => e && "string" == typeof t, !0) &&
      (t.data.weak_password = e.weak_password),
    t
  );
}
function Kr(e) {
  let t;
  return {
    data: { user: null !== (t = e.user) && void 0 !== t ? t : e },
    error: null,
  };
}
function Hr(e) {
  return { data: e, error: null };
}
function Gr(e) {
  const {
      action_link: t,
      email_otp: r,
      hashed_token: s,
      redirect_to: i,
      verification_type: n,
    } = e,
    o = (function (e, t) {
      const r = {};
      for (var s in e)
        Object.prototype.hasOwnProperty.call(e, s) &&
          t.indexOf(s) < 0 &&
          (r[s] = e[s]);
      if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
        let i = 0;
        for (s = Object.getOwnPropertySymbols(e); i < s.length; i++)
          t.indexOf(s[i]) < 0 &&
            Object.prototype.propertyIsEnumerable.call(e, s[i]) &&
            (r[s[i]] = e[s[i]]);
      }
      return r;
    })(e, [
      "action_link",
      "email_otp",
      "hashed_token",
      "redirect_to",
      "verification_type",
    ]);
  return {
    data: {
      properties: {
        action_link: t,
        email_otp: r,
        hashed_token: s,
        redirect_to: i,
        verification_type: n,
      },
      user: Object.assign({}, o),
    },
    error: null,
  };
}
function Vr(e) {
  return e;
}
const Qr = ["global", "local", "others"];
class Yr {
  constructor({ url: e = "", headers: t = {}, fetch: r }) {
    ((this.url = e),
      (this.headers = t),
      (this.fetch = Pr(r)),
      (this.mfa = {
        listFactors: this._listFactors.bind(this),
        deleteFactor: this._deleteFactor.bind(this),
      }));
  }
  async signOut(e, t = Qr[0]) {
    if (Qr.indexOf(t) < 0)
      throw new Error(
        `@supabase/auth-js: Parameter scope must be one of ${Qr.join(", ")}`,
      );
    try {
      return (
        await zr(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
          headers: this.headers,
          jwt: e,
          noResolveJson: !0,
        }),
        { data: null, error: null }
      );
    } catch (r) {
      if (rr(r)) return { data: null, error: r };
      throw r;
    }
  }
  async inviteUserByEmail(e, t = {}) {
    try {
      return await zr(this.fetch, "POST", `${this.url}/invite`, {
        body: { email: e, data: t.data },
        headers: this.headers,
        redirectTo: t.redirectTo,
        xform: Kr,
      });
    } catch (r) {
      if (rr(r)) return { data: { user: null }, error: r };
      throw r;
    }
  }
  async generateLink(e) {
    try {
      const { options: t } = e,
        r = (function (e, t) {
          const r = {};
          for (var s in e)
            Object.prototype.hasOwnProperty.call(e, s) &&
              t.indexOf(s) < 0 &&
              (r[s] = e[s]);
          if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
            let i = 0;
            for (s = Object.getOwnPropertySymbols(e); i < s.length; i++)
              t.indexOf(s[i]) < 0 &&
                Object.prototype.propertyIsEnumerable.call(e, s[i]) &&
                (r[s[i]] = e[s[i]]);
          }
          return r;
        })(e, ["options"]),
        s = Object.assign(Object.assign({}, r), t);
      return (
        "newEmail" in r &&
          ((s.new_email = null == r ? void 0 : r.newEmail), delete s.newEmail),
        await zr(this.fetch, "POST", `${this.url}/admin/generate_link`, {
          body: s,
          headers: this.headers,
          xform: Gr,
          redirectTo: null == t ? void 0 : t.redirectTo,
        })
      );
    } catch (t) {
      if (rr(t)) return { data: { properties: null, user: null }, error: t };
      throw t;
    }
  }
  async createUser(e) {
    try {
      return await zr(this.fetch, "POST", `${this.url}/admin/users`, {
        body: e,
        headers: this.headers,
        xform: Kr,
      });
    } catch (t) {
      if (rr(t)) return { data: { user: null }, error: t };
      throw t;
    }
  }
  async listUsers(e) {
    let t, r, s, i, n, o, a;
    try {
      const l = { nextPage: null, lastPage: 0, total: 0 },
        c = await zr(this.fetch, "GET", `${this.url}/admin/users`, {
          headers: this.headers,
          noResolveJson: !0,
          query: {
            page:
              null !==
                (r =
                  null === (t = null == e ? void 0 : e.page) || void 0 === t
                    ? void 0
                    : t.toString()) && void 0 !== r
                ? r
                : "",
            per_page:
              null !==
                (i =
                  null === (s = null == e ? void 0 : e.perPage) || void 0 === s
                    ? void 0
                    : s.toString()) && void 0 !== i
                ? i
                : "",
          },
          xform: Vr,
        });
      if (c.error) throw c.error;
      const h = await c.json(),
        u =
          null !== (n = c.headers.get("x-total-count")) && void 0 !== n ? n : 0,
        d =
          null !==
            (a =
              null === (o = c.headers.get("link")) || void 0 === o
                ? void 0
                : o.split(",")) && void 0 !== a
            ? a
            : [];
      return (
        d.length > 0 &&
          (d.forEach((e) => {
            const t = parseInt(e.split(";")[0].split("=")[1].substring(0, 1)),
              r = JSON.parse(e.split(";")[1].split("=")[1]);
            l[`${r}Page`] = t;
          }),
          (l.total = parseInt(u))),
        { data: Object.assign(Object.assign({}, h), l), error: null }
      );
    } catch (l) {
      if (rr(l)) return { data: { users: [] }, error: l };
      throw l;
    }
  }
  async getUserById(e) {
    Nr(e);
    try {
      return await zr(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        xform: Kr,
      });
    } catch (t) {
      if (rr(t)) return { data: { user: null }, error: t };
      throw t;
    }
  }
  async updateUserById(e, t) {
    Nr(e);
    try {
      return await zr(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
        body: t,
        headers: this.headers,
        xform: Kr,
      });
    } catch (r) {
      if (rr(r)) return { data: { user: null }, error: r };
      throw r;
    }
  }
  async deleteUser(e, t = !1) {
    Nr(e);
    try {
      return await zr(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        body: { should_soft_delete: t },
        xform: Kr,
      });
    } catch (r) {
      if (rr(r)) return { data: { user: null }, error: r };
      throw r;
    }
  }
  async _listFactors(e) {
    Nr(e.userId);
    try {
      const { data: t, error: r } = await zr(
        this.fetch,
        "GET",
        `${this.url}/admin/users/${e.userId}/factors`,
        {
          headers: this.headers,
          xform: (e) => ({ data: { factors: e }, error: null }),
        },
      );
      return { data: t, error: r };
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
  async _deleteFactor(e) {
    (Nr(e.userId), Nr(e.id));
    try {
      return {
        data: await zr(
          this.fetch,
          "DELETE",
          `${this.url}/admin/users/${e.userId}/factors/${e.id}`,
          { headers: this.headers },
        ),
        error: null,
      };
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
}
const Xr = {
  getItem: (e) => (Or() ? globalThis.localStorage.getItem(e) : null),
  setItem: (e, t) => {
    Or() && globalThis.localStorage.setItem(e, t);
  },
  removeItem: (e) => {
    Or() && globalThis.localStorage.removeItem(e);
  },
};
function Zr(e = {}) {
  return {
    getItem: (t) => e[t] || null,
    setItem: (t, r) => {
      e[t] = r;
    },
    removeItem: (t) => {
      delete e[t];
    },
  };
}
const es = !!(
  globalThis &&
  Or() &&
  globalThis.localStorage &&
  "true" === globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug")
);
class ts extends Error {
  constructor(e) {
    (super(e), (this.isAcquireTimeout = !0));
  }
}
class rs extends ts {}
async function ss(e, t, r) {
  es && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", e, t);
  const s = new globalThis.AbortController();
  return (
    t > 0 &&
      setTimeout(() => {
        (s.abort(),
          es &&
            console.log(
              "@supabase/gotrue-js: navigatorLock acquire timed out",
              e,
            ));
      }, t),
    await Promise.resolve().then(() =>
      globalThis.navigator.locks.request(
        e,
        0 === t
          ? { mode: "exclusive", ifAvailable: !0 }
          : { mode: "exclusive", signal: s.signal },
        async (s) => {
          if (!s) {
            if (0 === t)
              throw (
                es &&
                  console.log(
                    "@supabase/gotrue-js: navigatorLock: not immediately available",
                    e,
                  ),
                new rs(
                  `Acquiring an exclusive Navigator LockManager lock "${e}" immediately failed`,
                )
              );
            if (es)
              try {
                const e = await globalThis.navigator.locks.query();
                console.log(
                  "@supabase/gotrue-js: Navigator LockManager state",
                  JSON.stringify(e, null, "  "),
                );
              } catch (i) {
                console.warn(
                  "@supabase/gotrue-js: Error when querying Navigator LockManager state",
                  i,
                );
              }
            return (
              console.warn(
                "@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request",
              ),
              await r()
            );
          }
          es &&
            console.log(
              "@supabase/gotrue-js: navigatorLock: acquired",
              e,
              s.name,
            );
          try {
            return await r();
          } finally {
            es &&
              console.log(
                "@supabase/gotrue-js: navigatorLock: released",
                e,
                s.name,
              );
          }
        },
      ),
    )
  );
}
!(function () {
  if ("object" != typeof globalThis)
    try {
      (Object.defineProperty(Object.prototype, "__magic__", {
        get: function () {
          return this;
        },
        configurable: !0,
      }),
        (__magic__.globalThis = __magic__),
        delete Object.prototype.__magic__);
    } catch (e) {
      "undefined" != typeof self && (self.globalThis = self);
    }
})();
const is = {
  url: "http://localhost:9999",
  storageKey: "supabase.auth.token",
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  headers: Yt,
  flowType: "implicit",
  debug: !1,
  hasCustomAuthorizationHeader: !1,
};
async function ns(e, t, r) {
  return await r();
}
class os {
  constructor(e) {
    let t, r;
    ((this.memoryStorage = null),
      (this.stateChangeEmitters = new Map()),
      (this.autoRefreshTicker = null),
      (this.visibilityChangedCallback = null),
      (this.refreshingDeferred = null),
      (this.initializePromise = null),
      (this.detectSessionInUrl = !0),
      (this.hasCustomAuthorizationHeader = !1),
      (this.suppressGetSessionWarning = !1),
      (this.lockAcquired = !1),
      (this.pendingInLock = []),
      (this.broadcastChannel = null),
      (this.logger = console.log),
      (this.instanceID = os.nextInstanceID),
      (os.nextInstanceID += 1),
      this.instanceID > 0 &&
        Er() &&
        console.warn(
          "Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.",
        ));
    const s = Object.assign(Object.assign({}, is), e);
    if (
      ((this.logDebugMessages = !!s.debug),
      "function" == typeof s.debug && (this.logger = s.debug),
      (this.persistSession = s.persistSession),
      (this.storageKey = s.storageKey),
      (this.autoRefreshToken = s.autoRefreshToken),
      (this.admin = new Yr({ url: s.url, headers: s.headers, fetch: s.fetch })),
      (this.url = s.url),
      (this.headers = s.headers),
      (this.fetch = Pr(s.fetch)),
      (this.lock = s.lock || ns),
      (this.detectSessionInUrl = s.detectSessionInUrl),
      (this.flowType = s.flowType),
      (this.hasCustomAuthorizationHeader = s.hasCustomAuthorizationHeader),
      s.lock
        ? (this.lock = s.lock)
        : Er() &&
            (null ===
              (t =
                null === globalThis || void 0 === globalThis
                  ? void 0
                  : globalThis.navigator) || void 0 === t
              ? void 0
              : t.locks)
          ? (this.lock = ss)
          : (this.lock = ns),
      (this.jwks = { keys: [] }),
      (this.jwks_cached_at = Number.MIN_SAFE_INTEGER),
      (this.mfa = {
        verify: this._verify.bind(this),
        enroll: this._enroll.bind(this),
        unenroll: this._unenroll.bind(this),
        challenge: this._challenge.bind(this),
        listFactors: this._listFactors.bind(this),
        challengeAndVerify: this._challengeAndVerify.bind(this),
        getAuthenticatorAssuranceLevel:
          this._getAuthenticatorAssuranceLevel.bind(this),
      }),
      this.persistSession
        ? s.storage
          ? (this.storage = s.storage)
          : Or()
            ? (this.storage = Xr)
            : ((this.memoryStorage = {}),
              (this.storage = Zr(this.memoryStorage)))
        : ((this.memoryStorage = {}), (this.storage = Zr(this.memoryStorage))),
      Er() &&
        globalThis.BroadcastChannel &&
        this.persistSession &&
        this.storageKey)
    ) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(
          this.storageKey,
        );
      } catch (i) {
        console.error(
          "Failed to create a new BroadcastChannel, multi-tab state changes will not be available",
          i,
        );
      }
      null === (r = this.broadcastChannel) ||
        void 0 === r ||
        r.addEventListener("message", async (e) => {
          (this._debug(
            "received broadcast notification from other tab or client",
            e,
          ),
            await this._notifyAllSubscribers(e.data.event, e.data.session, !1));
        });
    }
    this.initialize();
  }
  _debug(...e) {
    return (
      this.logDebugMessages &&
        this.logger(
          `GoTrueClient@${this.instanceID} (${Gt}) ${new Date().toISOString()}`,
          ...e,
        ),
      this
    );
  }
  async initialize() {
    return (
      this.initializePromise ||
        (this.initializePromise = (async () =>
          await this._acquireLock(-1, async () => await this._initialize()))()),
      await this.initializePromise
    );
  }
  async _initialize() {
    let e;
    try {
      const t = (function (e) {
        const t = {},
          r = new URL(e);
        if (r.hash && "#" === r.hash[0])
          try {
            new URLSearchParams(r.hash.substring(1)).forEach((e, r) => {
              t[r] = e;
            });
          } catch (s) {}
        return (
          r.searchParams.forEach((e, r) => {
            t[r] = e;
          }),
          t
        );
      })(window.location.href);
      let r = "none";
      if (
        (this._isImplicitGrantCallback(t)
          ? (r = "implicit")
          : (await this._isPKCECallback(t)) && (r = "pkce"),
        Er() && this.detectSessionInUrl && "none" !== r)
      ) {
        const { data: s, error: i } = await this._getSessionFromURL(t, r);
        if (i) {
          if (
            (this._debug(
              "#_initialize()",
              "error detecting session from URL",
              i,
            ),
            (function (e) {
              return rr(e) && "AuthImplicitGrantRedirectError" === e.name;
            })(i))
          ) {
            const t =
              null === (e = i.details) || void 0 === e ? void 0 : e.code;
            if (
              "identity_already_exists" === t ||
              "identity_not_found" === t ||
              "single_identity_not_deletable" === t
            )
              return { error: i };
          }
          return (await this._removeSession(), { error: i });
        }
        const { session: n, redirectType: o } = s;
        return (
          this._debug(
            "#_initialize()",
            "detected session in URL",
            n,
            "redirect type",
            o,
          ),
          await this._saveSession(n),
          setTimeout(async () => {
            "recovery" === o
              ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", n)
              : await this._notifyAllSubscribers("SIGNED_IN", n);
          }, 0),
          { error: null }
        );
      }
      return (await this._recoverAndRefresh(), { error: null });
    } catch (t) {
      return rr(t)
        ? { error: t }
        : { error: new ir("Unexpected error during initialization", t) };
    } finally {
      (await this._handleVisibilityChange(),
        this._debug("#_initialize()", "end"));
    }
  }
  async signInAnonymously(e) {
    let t, r, s;
    try {
      const i = await zr(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            data:
              null !==
                (r =
                  null === (t = null == e ? void 0 : e.options) || void 0 === t
                    ? void 0
                    : t.data) && void 0 !== r
                ? r
                : {},
            gotrue_meta_security: {
              captcha_token:
                null === (s = null == e ? void 0 : e.options) || void 0 === s
                  ? void 0
                  : s.captchaToken,
            },
          },
          xform: Jr,
        }),
        { data: n, error: o } = i;
      if (o || !n) return { data: { user: null, session: null }, error: o };
      const a = n.session,
        l = n.user;
      return (
        n.session &&
          (await this._saveSession(n.session),
          await this._notifyAllSubscribers("SIGNED_IN", a)),
        { data: { user: l, session: a }, error: null }
      );
    } catch (i) {
      if (rr(i)) return { data: { user: null, session: null }, error: i };
      throw i;
    }
  }
  async signUp(e) {
    let t, r, s;
    try {
      let i;
      if ("email" in e) {
        const { email: r, password: s, options: n } = e;
        let o = null,
          a = null;
        ("pkce" === this.flowType &&
          ([o, a] = await Ur(this.storage, this.storageKey)),
          (i = await zr(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: null == n ? void 0 : n.emailRedirectTo,
            body: {
              email: r,
              password: s,
              data:
                null !== (t = null == n ? void 0 : n.data) && void 0 !== t
                  ? t
                  : {},
              gotrue_meta_security: {
                captcha_token: null == n ? void 0 : n.captchaToken,
              },
              code_challenge: o,
              code_challenge_method: a,
            },
            xform: Jr,
          })));
      } else {
        if (!("phone" in e))
          throw new lr(
            "You must provide either an email or phone number and a password",
          );
        {
          const { phone: t, password: n, options: o } = e;
          i = await zr(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              phone: t,
              password: n,
              data:
                null !== (r = null == o ? void 0 : o.data) && void 0 !== r
                  ? r
                  : {},
              channel:
                null !== (s = null == o ? void 0 : o.channel) && void 0 !== s
                  ? s
                  : "sms",
              gotrue_meta_security: {
                captcha_token: null == o ? void 0 : o.captchaToken,
              },
            },
            xform: Jr,
          });
        }
      }
      const { data: n, error: o } = i;
      if (o || !n) return { data: { user: null, session: null }, error: o };
      const a = n.session,
        l = n.user;
      return (
        n.session &&
          (await this._saveSession(n.session),
          await this._notifyAllSubscribers("SIGNED_IN", a)),
        { data: { user: l, session: a }, error: null }
      );
    } catch (i) {
      if (rr(i)) return { data: { user: null, session: null }, error: i };
      throw i;
    }
  }
  async signInWithPassword(e) {
    try {
      let t;
      if ("email" in e) {
        const { email: r, password: s, options: i } = e;
        t = await zr(
          this.fetch,
          "POST",
          `${this.url}/token?grant_type=password`,
          {
            headers: this.headers,
            body: {
              email: r,
              password: s,
              gotrue_meta_security: {
                captcha_token: null == i ? void 0 : i.captchaToken,
              },
            },
            xform: Wr,
          },
        );
      } else {
        if (!("phone" in e))
          throw new lr(
            "You must provide either an email or phone number and a password",
          );
        {
          const { phone: r, password: s, options: i } = e;
          t = await zr(
            this.fetch,
            "POST",
            `${this.url}/token?grant_type=password`,
            {
              headers: this.headers,
              body: {
                phone: r,
                password: s,
                gotrue_meta_security: {
                  captcha_token: null == i ? void 0 : i.captchaToken,
                },
              },
              xform: Wr,
            },
          );
        }
      }
      const { data: r, error: s } = t;
      return s
        ? { data: { user: null, session: null }, error: s }
        : r && r.session && r.user
          ? (r.session &&
              (await this._saveSession(r.session),
              await this._notifyAllSubscribers("SIGNED_IN", r.session)),
            {
              data: Object.assign(
                { user: r.user, session: r.session },
                r.weak_password ? { weakPassword: r.weak_password } : null,
              ),
              error: s,
            })
          : { data: { user: null, session: null }, error: new ar() };
    } catch (t) {
      if (rr(t)) return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  async signInWithOAuth(e) {
    let t, r, s, i;
    return await this._handleProviderSignIn(e.provider, {
      redirectTo:
        null === (t = e.options) || void 0 === t ? void 0 : t.redirectTo,
      scopes: null === (r = e.options) || void 0 === r ? void 0 : r.scopes,
      queryParams:
        null === (s = e.options) || void 0 === s ? void 0 : s.queryParams,
      skipBrowserRedirect:
        null === (i = e.options) || void 0 === i
          ? void 0
          : i.skipBrowserRedirect,
    });
  }
  async exchangeCodeForSession(e) {
    return (
      await this.initializePromise,
      this._acquireLock(-1, async () => this._exchangeCodeForSession(e))
    );
  }
  async signInWithWeb3(e) {
    const { chain: t } = e;
    if ("solana" === t) return await this.signInWithSolana(e);
    throw new Error(`@supabase/auth-js: Unsupported chain "${t}"`);
  }
  async signInWithSolana(e) {
    let t, r, s, i, n, o, a, l, c, h, u, d;
    let f, p;
    if ("message" in e) ((f = e.message), (p = e.signature));
    else {
      const { chain: u, wallet: d, statement: g, options: v } = e;
      let y;
      if (Er())
        if ("object" == typeof d) y = d;
        else {
          const e = window;
          if (
            !("solana" in e) ||
            "object" != typeof e.solana ||
            !(
              ("signIn" in e.solana && "function" == typeof e.solana.signIn) ||
              ("signMessage" in e.solana &&
                "function" == typeof e.solana.signMessage)
            )
          )
            throw new Error(
              "@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.",
            );
          y = e.solana;
        }
      else {
        if ("object" != typeof d || !(null == v ? void 0 : v.url))
          throw new Error(
            "@supabase/auth-js: Both wallet and url must be specified in non-browser environments.",
          );
        y = d;
      }
      const m = new URL(
        null !== (t = null == v ? void 0 : v.url) && void 0 !== t
          ? t
          : window.location.href,
      );
      if ("signIn" in y && y.signIn) {
        const e = await y.signIn(
          Object.assign(
            Object.assign(
              Object.assign(
                { issuedAt: new Date().toISOString() },
                null == v ? void 0 : v.signInWithSolana,
              ),
              { version: "1", domain: m.host, uri: m.href },
            ),
            g ? { statement: g } : null,
          ),
        );
        let t;
        if (Array.isArray(e) && e[0] && "object" == typeof e[0]) t = e[0];
        else {
          if (
            !(
              e &&
              "object" == typeof e &&
              "signedMessage" in e &&
              "signature" in e
            )
          )
            throw new Error(
              "@supabase/auth-js: Wallet method signIn() returned unrecognized value",
            );
          t = e;
        }
        if (
          !(
            "signedMessage" in t &&
            "signature" in t &&
            ("string" == typeof t.signedMessage ||
              t.signedMessage instanceof Uint8Array) &&
            t.signature instanceof Uint8Array
          )
        )
          throw new Error(
            "@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields",
          );
        ((f =
          "string" == typeof t.signedMessage
            ? t.signedMessage
            : new TextDecoder().decode(t.signedMessage)),
          (p = t.signature));
      } else {
        if (
          !(
            "signMessage" in y &&
            "function" == typeof y.signMessage &&
            "publicKey" in y &&
            "object" == typeof y &&
            y.publicKey &&
            "toBase58" in y.publicKey &&
            "function" == typeof y.publicKey.toBase58
          )
        )
          throw new Error(
            "@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API",
          );
        f = [
          `${m.host} wants you to sign in with your Solana account:`,
          y.publicKey.toBase58(),
          ...(g ? ["", g, ""] : [""]),
          "Version: 1",
          `URI: ${m.href}`,
          `Issued At: ${null !== (s = null === (r = null == v ? void 0 : v.signInWithSolana) || void 0 === r ? void 0 : r.issuedAt) && void 0 !== s ? s : new Date().toISOString()}`,
          ...((
            null === (i = null == v ? void 0 : v.signInWithSolana) ||
            void 0 === i
              ? void 0
              : i.notBefore
          )
            ? [`Not Before: ${v.signInWithSolana.notBefore}`]
            : []),
          ...((
            null === (n = null == v ? void 0 : v.signInWithSolana) ||
            void 0 === n
              ? void 0
              : n.expirationTime
          )
            ? [`Expiration Time: ${v.signInWithSolana.expirationTime}`]
            : []),
          ...((
            null === (o = null == v ? void 0 : v.signInWithSolana) ||
            void 0 === o
              ? void 0
              : o.chainId
          )
            ? [`Chain ID: ${v.signInWithSolana.chainId}`]
            : []),
          ...((
            null === (a = null == v ? void 0 : v.signInWithSolana) ||
            void 0 === a
              ? void 0
              : a.nonce
          )
            ? [`Nonce: ${v.signInWithSolana.nonce}`]
            : []),
          ...((
            null === (l = null == v ? void 0 : v.signInWithSolana) ||
            void 0 === l
              ? void 0
              : l.requestId
          )
            ? [`Request ID: ${v.signInWithSolana.requestId}`]
            : []),
          ...((
            null ===
              (h =
                null === (c = null == v ? void 0 : v.signInWithSolana) ||
                void 0 === c
                  ? void 0
                  : c.resources) || void 0 === h
              ? void 0
              : h.length
          )
            ? [
                "Resources",
                ...v.signInWithSolana.resources.map((e) => `- ${e}`),
              ]
            : []),
        ].join("\n");
        const e = await y.signMessage(new TextEncoder().encode(f), "utf8");
        if (!(e && e instanceof Uint8Array))
          throw new Error(
            "@supabase/auth-js: Wallet signMessage() API returned an recognized value",
          );
        p = e;
      }
    }
    try {
      const { data: t, error: r } = await zr(
        this.fetch,
        "POST",
        `${this.url}/token?grant_type=web3`,
        {
          headers: this.headers,
          body: Object.assign(
            { chain: "solana", message: f, signature: Sr(p) },
            (null === (u = e.options) || void 0 === u ? void 0 : u.captchaToken)
              ? {
                  gotrue_meta_security: {
                    captcha_token:
                      null === (d = e.options) || void 0 === d
                        ? void 0
                        : d.captchaToken,
                  },
                }
              : null,
          ),
          xform: Jr,
        },
      );
      if (r) throw r;
      return t && t.session && t.user
        ? (t.session &&
            (await this._saveSession(t.session),
            await this._notifyAllSubscribers("SIGNED_IN", t.session)),
          { data: Object.assign({}, t), error: r })
        : { data: { user: null, session: null }, error: new ar() };
    } catch (g) {
      if (rr(g)) return { data: { user: null, session: null }, error: g };
      throw g;
    }
  }
  async _exchangeCodeForSession(e) {
    const t = await Ar(this.storage, `${this.storageKey}-code-verifier`),
      [r, s] = (null != t ? t : "").split("/");
    try {
      const { data: t, error: i } = await zr(
        this.fetch,
        "POST",
        `${this.url}/token?grant_type=pkce`,
        {
          headers: this.headers,
          body: { auth_code: e, code_verifier: r },
          xform: Jr,
        },
      );
      if ((await $r(this.storage, `${this.storageKey}-code-verifier`), i))
        throw i;
      return t && t.session && t.user
        ? (t.session &&
            (await this._saveSession(t.session),
            await this._notifyAllSubscribers("SIGNED_IN", t.session)),
          {
            data: Object.assign(Object.assign({}, t), {
              redirectType: null != s ? s : null,
            }),
            error: i,
          })
        : {
            data: { user: null, session: null, redirectType: null },
            error: new ar(),
          };
    } catch (i) {
      if (rr(i))
        return {
          data: { user: null, session: null, redirectType: null },
          error: i,
        };
      throw i;
    }
  }
  async signInWithIdToken(e) {
    try {
      const {
          options: t,
          provider: r,
          token: s,
          access_token: i,
          nonce: n,
        } = e,
        o = await zr(
          this.fetch,
          "POST",
          `${this.url}/token?grant_type=id_token`,
          {
            headers: this.headers,
            body: {
              provider: r,
              id_token: s,
              access_token: i,
              nonce: n,
              gotrue_meta_security: {
                captcha_token: null == t ? void 0 : t.captchaToken,
              },
            },
            xform: Jr,
          },
        ),
        { data: a, error: l } = o;
      return l
        ? { data: { user: null, session: null }, error: l }
        : a && a.session && a.user
          ? (a.session &&
              (await this._saveSession(a.session),
              await this._notifyAllSubscribers("SIGNED_IN", a.session)),
            { data: a, error: l })
          : { data: { user: null, session: null }, error: new ar() };
    } catch (t) {
      if (rr(t)) return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  async signInWithOtp(e) {
    let t, r, s, i, n;
    try {
      if ("email" in e) {
        const { email: s, options: i } = e;
        let n = null,
          o = null;
        "pkce" === this.flowType &&
          ([n, o] = await Ur(this.storage, this.storageKey));
        const { error: a } = await zr(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email: s,
            data:
              null !== (t = null == i ? void 0 : i.data) && void 0 !== t
                ? t
                : {},
            create_user:
              null === (r = null == i ? void 0 : i.shouldCreateUser) ||
              void 0 === r ||
              r,
            gotrue_meta_security: {
              captcha_token: null == i ? void 0 : i.captchaToken,
            },
            code_challenge: n,
            code_challenge_method: o,
          },
          redirectTo: null == i ? void 0 : i.emailRedirectTo,
        });
        return { data: { user: null, session: null }, error: a };
      }
      if ("phone" in e) {
        const { phone: t, options: r } = e,
          { data: o, error: a } = await zr(
            this.fetch,
            "POST",
            `${this.url}/otp`,
            {
              headers: this.headers,
              body: {
                phone: t,
                data:
                  null !== (s = null == r ? void 0 : r.data) && void 0 !== s
                    ? s
                    : {},
                create_user:
                  null === (i = null == r ? void 0 : r.shouldCreateUser) ||
                  void 0 === i ||
                  i,
                gotrue_meta_security: {
                  captcha_token: null == r ? void 0 : r.captchaToken,
                },
                channel:
                  null !== (n = null == r ? void 0 : r.channel) && void 0 !== n
                    ? n
                    : "sms",
              },
            },
          );
        return {
          data: {
            user: null,
            session: null,
            messageId: null == o ? void 0 : o.message_id,
          },
          error: a,
        };
      }
      throw new lr("You must provide either an email or phone number.");
    } catch (o) {
      if (rr(o)) return { data: { user: null, session: null }, error: o };
      throw o;
    }
  }
  async verifyOtp(e) {
    let t, r;
    try {
      let s, i;
      "options" in e &&
        ((s = null === (t = e.options) || void 0 === t ? void 0 : t.redirectTo),
        (i =
          null === (r = e.options) || void 0 === r ? void 0 : r.captchaToken));
      const { data: n, error: o } = await zr(
        this.fetch,
        "POST",
        `${this.url}/verify`,
        {
          headers: this.headers,
          body: Object.assign(Object.assign({}, e), {
            gotrue_meta_security: { captcha_token: i },
          }),
          redirectTo: s,
          xform: Jr,
        },
      );
      if (o) throw o;
      if (!n) throw new Error("An error occurred on token verification.");
      const a = n.session,
        l = n.user;
      return (
        (null == a ? void 0 : a.access_token) &&
          (await this._saveSession(a),
          await this._notifyAllSubscribers(
            "recovery" == e.type ? "PASSWORD_RECOVERY" : "SIGNED_IN",
            a,
          )),
        { data: { user: l, session: a }, error: null }
      );
    } catch (s) {
      if (rr(s)) return { data: { user: null, session: null }, error: s };
      throw s;
    }
  }
  async signInWithSSO(e) {
    let t, r, s;
    try {
      let i = null,
        n = null;
      return (
        "pkce" === this.flowType &&
          ([i, n] = await Ur(this.storage, this.storageKey)),
        await zr(this.fetch, "POST", `${this.url}/sso`, {
          body: Object.assign(
            Object.assign(
              Object.assign(
                Object.assign(
                  Object.assign(
                    {},
                    "providerId" in e ? { provider_id: e.providerId } : null,
                  ),
                  "domain" in e ? { domain: e.domain } : null,
                ),
                {
                  redirect_to:
                    null !==
                      (r =
                        null === (t = e.options) || void 0 === t
                          ? void 0
                          : t.redirectTo) && void 0 !== r
                      ? r
                      : void 0,
                },
              ),
              (
                null === (s = null == e ? void 0 : e.options) || void 0 === s
                  ? void 0
                  : s.captchaToken
              )
                ? {
                    gotrue_meta_security: {
                      captcha_token: e.options.captchaToken,
                    },
                  }
                : null,
            ),
            {
              skip_http_redirect: !0,
              code_challenge: i,
              code_challenge_method: n,
            },
          ),
          headers: this.headers,
          xform: Hr,
        })
      );
    } catch (i) {
      if (rr(i)) return { data: null, error: i };
      throw i;
    }
  }
  async reauthenticate() {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._reauthenticate())
    );
  }
  async _reauthenticate() {
    try {
      return await this._useSession(async (e) => {
        const {
          data: { session: t },
          error: r,
        } = e;
        if (r) throw r;
        if (!t) throw new or();
        const { error: s } = await zr(
          this.fetch,
          "GET",
          `${this.url}/reauthenticate`,
          { headers: this.headers, jwt: t.access_token },
        );
        return { data: { user: null, session: null }, error: s };
      });
    } catch (e) {
      if (rr(e)) return { data: { user: null, session: null }, error: e };
      throw e;
    }
  }
  async resend(e) {
    try {
      const t = `${this.url}/resend`;
      if ("email" in e) {
        const { email: r, type: s, options: i } = e,
          { error: n } = await zr(this.fetch, "POST", t, {
            headers: this.headers,
            body: {
              email: r,
              type: s,
              gotrue_meta_security: {
                captcha_token: null == i ? void 0 : i.captchaToken,
              },
            },
            redirectTo: null == i ? void 0 : i.emailRedirectTo,
          });
        return { data: { user: null, session: null }, error: n };
      }
      if ("phone" in e) {
        const { phone: r, type: s, options: i } = e,
          { data: n, error: o } = await zr(this.fetch, "POST", t, {
            headers: this.headers,
            body: {
              phone: r,
              type: s,
              gotrue_meta_security: {
                captcha_token: null == i ? void 0 : i.captchaToken,
              },
            },
          });
        return {
          data: {
            user: null,
            session: null,
            messageId: null == n ? void 0 : n.message_id,
          },
          error: o,
        };
      }
      throw new lr(
        "You must provide either an email or phone number and a type",
      );
    } catch (t) {
      if (rr(t)) return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  async getSession() {
    await this.initializePromise;
    return await this._acquireLock(-1, async () =>
      this._useSession(async (e) => e),
    );
  }
  async _acquireLock(e, t) {
    this._debug("#_acquireLock", "begin", e);
    try {
      if (this.lockAcquired) {
        const e = this.pendingInLock.length
            ? this.pendingInLock[this.pendingInLock.length - 1]
            : Promise.resolve(),
          r = (async () => (await e, await t()))();
        return (
          this.pendingInLock.push(
            (async () => {
              try {
                await r;
              } catch (e) {}
            })(),
          ),
          r
        );
      }
      return await this.lock(`lock:${this.storageKey}`, e, async () => {
        this._debug(
          "#_acquireLock",
          "lock acquired for storage key",
          this.storageKey,
        );
        try {
          this.lockAcquired = !0;
          const e = t();
          for (
            this.pendingInLock.push(
              (async () => {
                try {
                  await e;
                } catch (t) {}
              })(),
            ),
              await e;
            this.pendingInLock.length;

          ) {
            const e = [...this.pendingInLock];
            (await Promise.all(e), this.pendingInLock.splice(0, e.length));
          }
          return await e;
        } finally {
          (this._debug(
            "#_acquireLock",
            "lock released for storage key",
            this.storageKey,
          ),
            (this.lockAcquired = !1));
        }
      });
    } finally {
      this._debug("#_acquireLock", "end");
    }
  }
  async _useSession(e) {
    this._debug("#_useSession", "begin");
    try {
      const t = await this.__loadSession();
      return await e(t);
    } finally {
      this._debug("#_useSession", "end");
    }
  }
  async __loadSession() {
    (this._debug("#__loadSession()", "begin"),
      this.lockAcquired ||
        this._debug(
          "#__loadSession()",
          "used outside of an acquired lock!",
          new Error().stack,
        ));
    try {
      let e = null;
      const t = await Ar(this.storage, this.storageKey);
      if (
        (this._debug("#getSession()", "session from storage", t),
        null !== t &&
          (this._isValidSession(t)
            ? (e = t)
            : (this._debug(
                "#getSession()",
                "session from storage is not valid",
              ),
              await this._removeSession())),
        !e)
      )
        return { data: { session: null }, error: null };
      const r = !!e.expires_at && 1e3 * e.expires_at - Date.now() < Qt;
      if (
        (this._debug(
          "#__loadSession()",
          `session has${r ? "" : " not"} expired`,
          "expires_at",
          e.expires_at,
        ),
        !r)
      ) {
        if (this.storage.isServer) {
          let t = this.suppressGetSessionWarning;
          e = new Proxy(e, {
            get: (e, r, s) => (
              t ||
                "user" !== r ||
                (console.warn(
                  "Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.",
                ),
                (t = !0),
                (this.suppressGetSessionWarning = !0)),
              Reflect.get(e, r, s)
            ),
          });
        }
        return { data: { session: e }, error: null };
      }
      const { session: s, error: i } = await this._callRefreshToken(
        e.refresh_token,
      );
      return i
        ? { data: { session: null }, error: i }
        : { data: { session: s }, error: null };
    } finally {
      this._debug("#__loadSession()", "end");
    }
  }
  async getUser(e) {
    if (e) return await this._getUser(e);
    await this.initializePromise;
    return await this._acquireLock(-1, async () => await this._getUser());
  }
  async _getUser(e) {
    try {
      return e
        ? await zr(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt: e,
            xform: Kr,
          })
        : await this._useSession(async (e) => {
            let t, r, s;
            const { data: i, error: n } = e;
            if (n) throw n;
            return (null === (t = i.session) || void 0 === t
              ? void 0
              : t.access_token) || this.hasCustomAuthorizationHeader
              ? await zr(this.fetch, "GET", `${this.url}/user`, {
                  headers: this.headers,
                  jwt:
                    null !==
                      (s =
                        null === (r = i.session) || void 0 === r
                          ? void 0
                          : r.access_token) && void 0 !== s
                      ? s
                      : void 0,
                  xform: Kr,
                })
              : { data: { user: null }, error: new or() };
          });
    } catch (t) {
      if (rr(t))
        return (
          (function (e) {
            return rr(e) && "AuthSessionMissingError" === e.name;
          })(t) &&
            (await this._removeSession(),
            await $r(this.storage, `${this.storageKey}-code-verifier`)),
          { data: { user: null }, error: t }
        );
      throw t;
    }
  }
  async updateUser(e, t = {}) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._updateUser(e, t))
    );
  }
  async _updateUser(e, t = {}) {
    try {
      return await this._useSession(async (r) => {
        const { data: s, error: i } = r;
        if (i) throw i;
        if (!s.session) throw new or();
        const n = s.session;
        let o = null,
          a = null;
        "pkce" === this.flowType &&
          null != e.email &&
          ([o, a] = await Ur(this.storage, this.storageKey));
        const { data: l, error: c } = await zr(
          this.fetch,
          "PUT",
          `${this.url}/user`,
          {
            headers: this.headers,
            redirectTo: null == t ? void 0 : t.emailRedirectTo,
            body: Object.assign(Object.assign({}, e), {
              code_challenge: o,
              code_challenge_method: a,
            }),
            jwt: n.access_token,
            xform: Kr,
          },
        );
        if (c) throw c;
        return (
          (n.user = l.user),
          await this._saveSession(n),
          await this._notifyAllSubscribers("USER_UPDATED", n),
          { data: { user: n.user }, error: null }
        );
      });
    } catch (r) {
      if (rr(r)) return { data: { user: null }, error: r };
      throw r;
    }
  }
  async setSession(e) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._setSession(e))
    );
  }
  async _setSession(e) {
    try {
      if (!e.access_token || !e.refresh_token) throw new or();
      const t = Date.now() / 1e3;
      let r = t,
        s = !0,
        i = null;
      const { payload: n } = Rr(e.access_token);
      if ((n.exp && ((r = n.exp), (s = r <= t)), s)) {
        const { session: t, error: r } = await this._callRefreshToken(
          e.refresh_token,
        );
        if (r) return { data: { user: null, session: null }, error: r };
        if (!t) return { data: { user: null, session: null }, error: null };
        i = t;
      } else {
        const { data: s, error: n } = await this._getUser(e.access_token);
        if (n) throw n;
        ((i = {
          access_token: e.access_token,
          refresh_token: e.refresh_token,
          user: s.user,
          token_type: "bearer",
          expires_in: r - t,
          expires_at: r,
        }),
          await this._saveSession(i),
          await this._notifyAllSubscribers("SIGNED_IN", i));
      }
      return { data: { user: i.user, session: i }, error: null };
    } catch (t) {
      if (rr(t)) return { data: { session: null, user: null }, error: t };
      throw t;
    }
  }
  async refreshSession(e) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._refreshSession(e))
    );
  }
  async _refreshSession(e) {
    try {
      return await this._useSession(async (t) => {
        let r;
        if (!e) {
          const { data: s, error: i } = t;
          if (i) throw i;
          e = null !== (r = s.session) && void 0 !== r ? r : void 0;
        }
        if (!(null == e ? void 0 : e.refresh_token)) throw new or();
        const { session: s, error: i } = await this._callRefreshToken(
          e.refresh_token,
        );
        return i
          ? { data: { user: null, session: null }, error: i }
          : s
            ? { data: { user: s.user, session: s }, error: null }
            : { data: { user: null, session: null }, error: null };
      });
    } catch (t) {
      if (rr(t)) return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  async _getSessionFromURL(e, t) {
    try {
      if (!Er()) throw new cr("No browser detected.");
      if (e.error || e.error_description || e.error_code)
        throw new cr(
          e.error_description ||
            "Error in URL with unspecified error_description",
          {
            error: e.error || "unspecified_error",
            code: e.error_code || "unspecified_code",
          },
        );
      switch (t) {
        case "implicit":
          if ("pkce" === this.flowType)
            throw new hr("Not a valid PKCE flow url.");
          break;
        case "pkce":
          if ("implicit" === this.flowType)
            throw new cr("Not a valid implicit grant flow url.");
      }
      if ("pkce" === t) {
        if (
          (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code)
        )
          throw new hr("No code detected.");
        const { data: t, error: r } = await this._exchangeCodeForSession(
          e.code,
        );
        if (r) throw r;
        const s = new URL(window.location.href);
        return (
          s.searchParams.delete("code"),
          window.history.replaceState(window.history.state, "", s.toString()),
          { data: { session: t.session, redirectType: null }, error: null }
        );
      }
      const {
        provider_token: r,
        provider_refresh_token: s,
        access_token: i,
        refresh_token: n,
        expires_in: o,
        expires_at: a,
        token_type: l,
      } = e;
      if (!(i && o && n && l)) throw new cr("No session defined in URL");
      const c = Math.round(Date.now() / 1e3),
        h = parseInt(o);
      let u = c + h;
      a && (u = parseInt(a));
      const d = u - c;
      1e3 * d <= Vt &&
        console.warn(
          `@supabase/gotrue-js: Session as retrieved from URL expires in ${d}s, should have been closer to ${h}s`,
        );
      const f = u - h;
      c - f >= 120
        ? console.warn(
            "@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale",
            f,
            u,
            c,
          )
        : c - f < 0 &&
          console.warn(
            "@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew",
            f,
            u,
            c,
          );
      const { data: p, error: g } = await this._getUser(i);
      if (g) throw g;
      const v = {
        provider_token: r,
        provider_refresh_token: s,
        access_token: i,
        expires_in: h,
        expires_at: u,
        refresh_token: n,
        token_type: l,
        user: p.user,
      };
      return (
        (window.location.hash = ""),
        this._debug("#_getSessionFromURL()", "clearing window.location.hash"),
        { data: { session: v, redirectType: e.type }, error: null }
      );
    } catch (r) {
      if (rr(r))
        return { data: { session: null, redirectType: null }, error: r };
      throw r;
    }
  }
  _isImplicitGrantCallback(e) {
    return Boolean(e.access_token || e.error_description);
  }
  async _isPKCECallback(e) {
    const t = await Ar(this.storage, `${this.storageKey}-code-verifier`);
    return !(!e.code || !t);
  }
  async signOut(e = { scope: "global" }) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._signOut(e))
    );
  }
  async _signOut({ scope: e } = { scope: "global" }) {
    return await this._useSession(async (t) => {
      let r;
      const { data: s, error: i } = t;
      if (i) return { error: i };
      const n =
        null === (r = s.session) || void 0 === r ? void 0 : r.access_token;
      if (n) {
        const { error: t } = await this.admin.signOut(n, e);
        if (
          t &&
          (!(function (e) {
            return rr(e) && "AuthApiError" === e.name;
          })(t) ||
            (404 !== t.status && 401 !== t.status && 403 !== t.status))
        )
          return { error: t };
      }
      return (
        "others" !== e &&
          (await this._removeSession(),
          await $r(this.storage, `${this.storageKey}-code-verifier`)),
        { error: null }
      );
    });
  }
  onAuthStateChange(e) {
    const t = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (e) {
          const t = (16 * Math.random()) | 0;
          return ("x" == e ? t : (3 & t) | 8).toString(16);
        },
      ),
      r = {
        id: t,
        callback: e,
        unsubscribe: () => {
          (this._debug(
            "#unsubscribe()",
            "state change callback with id removed",
            t,
          ),
            this.stateChangeEmitters.delete(t));
        },
      };
    return (
      this._debug("#onAuthStateChange()", "registered callback with id", t),
      this.stateChangeEmitters.set(t, r),
      (async () => {
        (await this.initializePromise,
          await this._acquireLock(-1, async () => {
            this._emitInitialSession(t);
          }));
      })(),
      { data: { subscription: r } }
    );
  }
  async _emitInitialSession(e) {
    return await this._useSession(async (t) => {
      let r, s;
      try {
        const {
          data: { session: s },
          error: i,
        } = t;
        if (i) throw i;
        (await (null === (r = this.stateChangeEmitters.get(e)) || void 0 === r
          ? void 0
          : r.callback("INITIAL_SESSION", s)),
          this._debug("INITIAL_SESSION", "callback id", e, "session", s));
      } catch (i) {
        (await (null === (s = this.stateChangeEmitters.get(e)) || void 0 === s
          ? void 0
          : s.callback("INITIAL_SESSION", null)),
          this._debug("INITIAL_SESSION", "callback id", e, "error", i),
          console.error(i));
      }
    });
  }
  async resetPasswordForEmail(e, t = {}) {
    let r = null,
      s = null;
    "pkce" === this.flowType &&
      ([r, s] = await Ur(this.storage, this.storageKey, !0));
    try {
      return await zr(this.fetch, "POST", `${this.url}/recover`, {
        body: {
          email: e,
          code_challenge: r,
          code_challenge_method: s,
          gotrue_meta_security: { captcha_token: t.captchaToken },
        },
        headers: this.headers,
        redirectTo: t.redirectTo,
      });
    } catch (i) {
      if (rr(i)) return { data: null, error: i };
      throw i;
    }
  }
  async getUserIdentities() {
    let e;
    try {
      const { data: t, error: r } = await this.getUser();
      if (r) throw r;
      return {
        data: {
          identities: null !== (e = t.user.identities) && void 0 !== e ? e : [],
        },
        error: null,
      };
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
  async linkIdentity(e) {
    let t;
    try {
      const { data: r, error: s } = await this._useSession(async (t) => {
        let r, s, i, n, o;
        const { data: a, error: l } = t;
        if (l) throw l;
        const c = await this._getUrlForProvider(
          `${this.url}/user/identities/authorize`,
          e.provider,
          {
            redirectTo:
              null === (r = e.options) || void 0 === r ? void 0 : r.redirectTo,
            scopes:
              null === (s = e.options) || void 0 === s ? void 0 : s.scopes,
            queryParams:
              null === (i = e.options) || void 0 === i ? void 0 : i.queryParams,
            skipBrowserRedirect: !0,
          },
        );
        return await zr(this.fetch, "GET", c, {
          headers: this.headers,
          jwt:
            null !==
              (o =
                null === (n = a.session) || void 0 === n
                  ? void 0
                  : n.access_token) && void 0 !== o
              ? o
              : void 0,
        });
      });
      if (s) throw s;
      return (
        Er() &&
          !(null === (t = e.options) || void 0 === t
            ? void 0
            : t.skipBrowserRedirect) &&
          window.location.assign(null == r ? void 0 : r.url),
        {
          data: { provider: e.provider, url: null == r ? void 0 : r.url },
          error: null,
        }
      );
    } catch (r) {
      if (rr(r)) return { data: { provider: e.provider, url: null }, error: r };
      throw r;
    }
  }
  async unlinkIdentity(e) {
    try {
      return await this._useSession(async (t) => {
        let r, s;
        const { data: i, error: n } = t;
        if (n) throw n;
        return await zr(
          this.fetch,
          "DELETE",
          `${this.url}/user/identities/${e.identity_id}`,
          {
            headers: this.headers,
            jwt:
              null !==
                (s =
                  null === (r = i.session) || void 0 === r
                    ? void 0
                    : r.access_token) && void 0 !== s
                ? s
                : void 0,
          },
        );
      });
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
  async _refreshAccessToken(e) {
    const t = `#_refreshAccessToken(${e.substring(0, 5)}...)`;
    this._debug(t, "begin");
    try {
      const i = Date.now();
      return await ((r = async (r) => (
        r > 0 &&
          (await (async function (e) {
            return await new Promise((t) => {
              setTimeout(() => t(null), e);
            });
          })(200 * Math.pow(2, r - 1))),
        this._debug(t, "refreshing attempt", r),
        await zr(
          this.fetch,
          "POST",
          `${this.url}/token?grant_type=refresh_token`,
          { body: { refresh_token: e }, headers: this.headers, xform: Jr },
        )
      )),
      (s = (e, t) => {
        const r = 200 * Math.pow(2, e);
        return t && dr(t) && Date.now() + r - i < Vt;
      }),
      new Promise((e, t) => {
        (async () => {
          for (let n = 0; n < 1 / 0; n++)
            try {
              const t = await r(n);
              if (!s(n, null, t)) return void e(t);
            } catch (i) {
              if (!s(n, i)) return void t(i);
            }
        })();
      }));
    } catch (i) {
      if ((this._debug(t, "error", i), rr(i)))
        return { data: { session: null, user: null }, error: i };
      throw i;
    } finally {
      this._debug(t, "end");
    }
    let r, s;
  }
  _isValidSession(e) {
    return (
      "object" == typeof e &&
      null !== e &&
      "access_token" in e &&
      "refresh_token" in e &&
      "expires_at" in e
    );
  }
  async _handleProviderSignIn(e, t) {
    const r = await this._getUrlForProvider(`${this.url}/authorize`, e, {
      redirectTo: t.redirectTo,
      scopes: t.scopes,
      queryParams: t.queryParams,
    });
    return (
      this._debug(
        "#_handleProviderSignIn()",
        "provider",
        e,
        "options",
        t,
        "url",
        r,
      ),
      Er() && !t.skipBrowserRedirect && window.location.assign(r),
      { data: { provider: e, url: r }, error: null }
    );
  }
  async _recoverAndRefresh() {
    let e;
    const t = "#_recoverAndRefresh()";
    this._debug(t, "begin");
    try {
      const r = await Ar(this.storage, this.storageKey);
      if ((this._debug(t, "session from storage", r), !this._isValidSession(r)))
        return (
          this._debug(t, "session is not valid"),
          void (null !== r && (await this._removeSession()))
        );
      const s =
        1e3 * (null !== (e = r.expires_at) && void 0 !== e ? e : 1 / 0) -
          Date.now() <
        Qt;
      if (
        (this._debug(
          t,
          `session has${s ? "" : " not"} expired with margin of 90000s`,
        ),
        s)
      ) {
        if (this.autoRefreshToken && r.refresh_token) {
          const { error: e } = await this._callRefreshToken(r.refresh_token);
          e &&
            (console.error(e),
            dr(e) ||
              (this._debug(
                t,
                "refresh failed with a non-retryable error, removing the session",
                e,
              ),
              await this._removeSession()));
        }
      } else await this._notifyAllSubscribers("SIGNED_IN", r);
    } catch (r) {
      return (this._debug(t, "error", r), void console.error(r));
    } finally {
      this._debug(t, "end");
    }
  }
  async _callRefreshToken(e) {
    let t, r;
    if (!e) throw new or();
    if (this.refreshingDeferred) return this.refreshingDeferred.promise;
    const s = `#_callRefreshToken(${e.substring(0, 5)}...)`;
    this._debug(s, "begin");
    try {
      this.refreshingDeferred = new Ir();
      const { data: t, error: r } = await this._refreshAccessToken(e);
      if (r) throw r;
      if (!t.session) throw new or();
      (await this._saveSession(t.session),
        await this._notifyAllSubscribers("TOKEN_REFRESHED", t.session));
      const s = { session: t.session, error: null };
      return (this.refreshingDeferred.resolve(s), s);
    } catch (i) {
      if ((this._debug(s, "error", i), rr(i))) {
        const e = { session: null, error: i };
        return (
          dr(i) || (await this._removeSession()),
          null === (t = this.refreshingDeferred) ||
            void 0 === t ||
            t.resolve(e),
          e
        );
      }
      throw (
        null === (r = this.refreshingDeferred) || void 0 === r || r.reject(i),
        i
      );
    } finally {
      ((this.refreshingDeferred = null), this._debug(s, "end"));
    }
  }
  async _notifyAllSubscribers(e, t, r = !0) {
    const s = `#_notifyAllSubscribers(${e})`;
    this._debug(s, "begin", t, `broadcast = ${r}`);
    try {
      this.broadcastChannel &&
        r &&
        this.broadcastChannel.postMessage({ event: e, session: t });
      const s = [],
        i = Array.from(this.stateChangeEmitters.values()).map(async (r) => {
          try {
            await r.callback(e, t);
          } catch (i) {
            s.push(i);
          }
        });
      if ((await Promise.all(i), s.length > 0)) {
        for (let e = 0; e < s.length; e += 1) console.error(s[e]);
        throw s[0];
      }
    } finally {
      this._debug(s, "end");
    }
  }
  async _saveSession(e) {
    (this._debug("#_saveSession()", e),
      (this.suppressGetSessionWarning = !0),
      await Cr(this.storage, this.storageKey, e));
  }
  async _removeSession() {
    (this._debug("#_removeSession()"),
      await $r(this.storage, this.storageKey),
      await this._notifyAllSubscribers("SIGNED_OUT", null));
  }
  _removeVisibilityChangedCallback() {
    this._debug("#_removeVisibilityChangedCallback()");
    const e = this.visibilityChangedCallback;
    this.visibilityChangedCallback = null;
    try {
      e &&
        Er() &&
        (null === window || void 0 === window
          ? void 0
          : window.removeEventListener) &&
        window.removeEventListener("visibilitychange", e);
    } catch (t) {
      console.error("removing visibilitychange callback failed", t);
    }
  }
  async _startAutoRefresh() {
    (await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()"));
    const e = setInterval(() => this._autoRefreshTokenTick(), Vt);
    ((this.autoRefreshTicker = e),
      e && "object" == typeof e && "function" == typeof e.unref
        ? e.unref()
        : "undefined" != typeof Deno &&
          "function" == typeof Deno.unrefTimer &&
          Deno.unrefTimer(e),
      setTimeout(async () => {
        (await this.initializePromise, await this._autoRefreshTokenTick());
      }, 0));
  }
  async _stopAutoRefresh() {
    this._debug("#_stopAutoRefresh()");
    const e = this.autoRefreshTicker;
    ((this.autoRefreshTicker = null), e && clearInterval(e));
  }
  async startAutoRefresh() {
    (this._removeVisibilityChangedCallback(), await this._startAutoRefresh());
  }
  async stopAutoRefresh() {
    (this._removeVisibilityChangedCallback(), await this._stopAutoRefresh());
  }
  async _autoRefreshTokenTick() {
    this._debug("#_autoRefreshTokenTick()", "begin");
    try {
      await this._acquireLock(0, async () => {
        try {
          const t = Date.now();
          try {
            return await this._useSession(async (e) => {
              const {
                data: { session: r },
              } = e;
              if (!r || !r.refresh_token || !r.expires_at)
                return void this._debug(
                  "#_autoRefreshTokenTick()",
                  "no session",
                );
              const s = Math.floor((1e3 * r.expires_at - t) / Vt);
              (this._debug(
                "#_autoRefreshTokenTick()",
                `access token expires in ${s} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`,
              ),
                s <= 3 && (await this._callRefreshToken(r.refresh_token)));
            });
          } catch (e) {
            console.error(
              "Auto refresh tick failed with error. This is likely a transient error.",
              e,
            );
          }
        } finally {
          this._debug("#_autoRefreshTokenTick()", "end");
        }
      });
    } catch (e) {
      if (!(e.isAcquireTimeout || e instanceof ts)) throw e;
      this._debug("auto refresh token tick lock not available");
    }
  }
  async _handleVisibilityChange() {
    if (
      (this._debug("#_handleVisibilityChange()"),
      !Er() ||
        !(null === window || void 0 === window
          ? void 0
          : window.addEventListener))
    )
      return (this.autoRefreshToken && this.startAutoRefresh(), !1);
    try {
      ((this.visibilityChangedCallback = async () =>
        await this._onVisibilityChanged(!1)),
        null === window ||
          void 0 === window ||
          window.addEventListener(
            "visibilitychange",
            this.visibilityChangedCallback,
          ),
        await this._onVisibilityChanged(!0));
    } catch (e) {
      console.error("_handleVisibilityChange", e);
    }
  }
  async _onVisibilityChanged(e) {
    const t = `#_onVisibilityChanged(${e})`;
    (this._debug(t, "visibilityState", document.visibilityState),
      "visible" === document.visibilityState
        ? (this.autoRefreshToken && this._startAutoRefresh(),
          e ||
            (await this.initializePromise,
            await this._acquireLock(-1, async () => {
              "visible" === document.visibilityState
                ? await this._recoverAndRefresh()
                : this._debug(
                    t,
                    "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting",
                  );
            })))
        : "hidden" === document.visibilityState &&
          this.autoRefreshToken &&
          this._stopAutoRefresh());
  }
  async _getUrlForProvider(e, t, r) {
    const s = [`provider=${encodeURIComponent(t)}`];
    if (
      ((null == r ? void 0 : r.redirectTo) &&
        s.push(`redirect_to=${encodeURIComponent(r.redirectTo)}`),
      (null == r ? void 0 : r.scopes) &&
        s.push(`scopes=${encodeURIComponent(r.scopes)}`),
      "pkce" === this.flowType)
    ) {
      const [e, t] = await Ur(this.storage, this.storageKey),
        r = new URLSearchParams({
          code_challenge: `${encodeURIComponent(e)}`,
          code_challenge_method: `${encodeURIComponent(t)}`,
        });
      s.push(r.toString());
    }
    if (null == r ? void 0 : r.queryParams) {
      const e = new URLSearchParams(r.queryParams);
      s.push(e.toString());
    }
    return (
      (null == r ? void 0 : r.skipBrowserRedirect) &&
        s.push(`skip_http_redirect=${r.skipBrowserRedirect}`),
      `${e}?${s.join("&")}`
    );
  }
  async _unenroll(e) {
    try {
      return await this._useSession(async (t) => {
        let r;
        const { data: s, error: i } = t;
        return i
          ? { data: null, error: i }
          : await zr(
              this.fetch,
              "DELETE",
              `${this.url}/factors/${e.factorId}`,
              {
                headers: this.headers,
                jwt:
                  null === (r = null == s ? void 0 : s.session) || void 0 === r
                    ? void 0
                    : r.access_token,
              },
            );
      });
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
  async _enroll(e) {
    try {
      return await this._useSession(async (t) => {
        let r, s;
        const { data: i, error: n } = t;
        if (n) return { data: null, error: n };
        const o = Object.assign(
            { friendly_name: e.friendlyName, factor_type: e.factorType },
            "phone" === e.factorType
              ? { phone: e.phone }
              : { issuer: e.issuer },
          ),
          { data: a, error: l } = await zr(
            this.fetch,
            "POST",
            `${this.url}/factors`,
            {
              body: o,
              headers: this.headers,
              jwt:
                null === (r = null == i ? void 0 : i.session) || void 0 === r
                  ? void 0
                  : r.access_token,
            },
          );
        return l
          ? { data: null, error: l }
          : ("totp" === e.factorType &&
              (null === (s = null == a ? void 0 : a.totp) || void 0 === s
                ? void 0
                : s.qr_code) &&
              (a.totp.qr_code = `data:image/svg+xml;utf-8,${a.totp.qr_code}`),
            { data: a, error: null });
      });
    } catch (t) {
      if (rr(t)) return { data: null, error: t };
      throw t;
    }
  }
  async _verify(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async (t) => {
          let r;
          const { data: s, error: i } = t;
          if (i) return { data: null, error: i };
          const { data: n, error: o } = await zr(
            this.fetch,
            "POST",
            `${this.url}/factors/${e.factorId}/verify`,
            {
              body: { code: e.code, challenge_id: e.challengeId },
              headers: this.headers,
              jwt:
                null === (r = null == s ? void 0 : s.session) || void 0 === r
                  ? void 0
                  : r.access_token,
            },
          );
          return o
            ? { data: null, error: o }
            : (await this._saveSession(
                Object.assign(
                  { expires_at: Math.round(Date.now() / 1e3) + n.expires_in },
                  n,
                ),
              ),
              await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", n),
              { data: n, error: o });
        });
      } catch (t) {
        if (rr(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
  async _challenge(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async (t) => {
          let r;
          const { data: s, error: i } = t;
          return i
            ? { data: null, error: i }
            : await zr(
                this.fetch,
                "POST",
                `${this.url}/factors/${e.factorId}/challenge`,
                {
                  body: { channel: e.channel },
                  headers: this.headers,
                  jwt:
                    null === (r = null == s ? void 0 : s.session) ||
                    void 0 === r
                      ? void 0
                      : r.access_token,
                },
              );
        });
      } catch (t) {
        if (rr(t)) return { data: null, error: t };
        throw t;
      }
    });
  }
  async _challengeAndVerify(e) {
    const { data: t, error: r } = await this._challenge({
      factorId: e.factorId,
    });
    return r
      ? { data: null, error: r }
      : await this._verify({
          factorId: e.factorId,
          challengeId: t.id,
          code: e.code,
        });
  }
  async _listFactors() {
    const {
      data: { user: e },
      error: t,
    } = await this.getUser();
    if (t) return { data: null, error: t };
    const r = (null == e ? void 0 : e.factors) || [],
      s = r.filter((e) => "totp" === e.factor_type && "verified" === e.status),
      i = r.filter((e) => "phone" === e.factor_type && "verified" === e.status);
    return { data: { all: r, totp: s, phone: i }, error: null };
  }
  async _getAuthenticatorAssuranceLevel() {
    return this._acquireLock(
      -1,
      async () =>
        await this._useSession(async (e) => {
          let t, r;
          const {
            data: { session: s },
            error: i,
          } = e;
          if (i) return { data: null, error: i };
          if (!s)
            return {
              data: {
                currentLevel: null,
                nextLevel: null,
                currentAuthenticationMethods: [],
              },
              error: null,
            };
          const { payload: n } = Rr(s.access_token);
          let o = null;
          n.aal && (o = n.aal);
          let a = o;
          (null !==
            (r =
              null === (t = s.user.factors) || void 0 === t
                ? void 0
                : t.filter((e) => "verified" === e.status)) && void 0 !== r
            ? r
            : []
          ).length > 0 && (a = "aal2");
          return {
            data: {
              currentLevel: o,
              nextLevel: a,
              currentAuthenticationMethods: n.amr || [],
            },
            error: null,
          };
        }),
    );
  }
  async fetchJwk(e, t = { keys: [] }) {
    let r = t.keys.find((t) => t.kid === e);
    if (r) return r;
    if (
      ((r = this.jwks.keys.find((t) => t.kid === e)),
      r && this.jwks_cached_at + 6e5 > Date.now())
    )
      return r;
    const { data: s, error: i } = await zr(
      this.fetch,
      "GET",
      `${this.url}/.well-known/jwks.json`,
      { headers: this.headers },
    );
    if (i) throw i;
    if (!s.keys || 0 === s.keys.length) throw new pr("JWKS is empty");
    if (
      ((this.jwks = s),
      (this.jwks_cached_at = Date.now()),
      (r = s.keys.find((t) => t.kid === e)),
      !r)
    )
      throw new pr("No matching signing key found in JWKS");
    return r;
  }
  async getClaims(e, t = { keys: [] }) {
    try {
      let r = e;
      if (!r) {
        const { data: e, error: t } = await this.getSession();
        if (t || !e.session) return { data: null, error: t };
        r = e.session.access_token;
      }
      const {
        header: s,
        payload: i,
        signature: n,
        raw: { header: o, payload: a },
      } = Rr(r);
      if (
        ((function (e) {
          if (!e) throw new Error("Missing exp claim");
          if (e <= Math.floor(Date.now() / 1e3))
            throw new Error("JWT has expired");
        })(i.exp),
        !s.kid ||
          "HS256" === s.alg ||
          !("crypto" in globalThis) ||
          !("subtle" in globalThis.crypto))
      ) {
        const { error: e } = await this.getUser(r);
        if (e) throw e;
        return { data: { claims: i, header: s, signature: n }, error: null };
      }
      const l = (function (e) {
          switch (e) {
            case "RS256":
              return { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } };
            case "ES256":
              return {
                name: "ECDSA",
                namedCurve: "P-256",
                hash: { name: "SHA-256" },
              };
            default:
              throw new Error("Invalid alg claim");
          }
        })(s.alg),
        c = await this.fetchJwk(s.kid, t),
        h = await crypto.subtle.importKey("jwk", c, l, !0, ["verify"]);
      if (!(await crypto.subtle.verify(l, h, n, Tr(`${o}.${a}`))))
        throw new pr("Invalid JWT signature");
      return { data: { claims: i, header: s, signature: n }, error: null };
    } catch (r) {
      if (rr(r)) return { data: null, error: r };
      throw r;
    }
  }
}
os.nextInstanceID = 0;
const as = os;
class ls extends as {
  constructor(e) {
    super(e);
  }
}
const cs = function (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o(e) {
      try {
        l(s.next(e));
      } catch (t) {
        n(t);
      }
    }
    function a(e) {
      try {
        l(s.throw(e));
      } catch (t) {
        n(t);
      }
    }
    function l(e) {
      let t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(o, a);
    }
    l((s = s.apply(e, t || [])).next());
  });
};
class hs {
  constructor(e, t, r) {
    let s, i, n;
    if (((this.supabaseUrl = e), (this.supabaseKey = t), !e))
      throw new Error("supabaseUrl is required.");
    if (!t) throw new Error("supabaseKey is required.");
    const o = (a = e).endsWith("/") ? a : a + "/";
    let a;
    const l = new URL(o);
    ((this.realtimeUrl = new URL("realtime/v1", l)),
      (this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace(
        "http",
        "ws",
      )),
      (this.authUrl = new URL("auth/v1", l)),
      (this.storageUrl = new URL("storage/v1", l)),
      (this.functionsUrl = new URL("functions/v1", l)));
    const c = `sb-${l.hostname.split(".")[0]}-auth-token`,
      h = (function (e, t) {
        let r, s;
        const { db: i, auth: n, realtime: o, global: a } = e,
          { db: l, auth: c, realtime: h, global: u } = t,
          d = {
            db: Object.assign(Object.assign({}, l), i),
            auth: Object.assign(Object.assign({}, c), n),
            realtime: Object.assign(Object.assign({}, h), o),
            global: Object.assign(Object.assign(Object.assign({}, u), a), {
              headers: Object.assign(
                Object.assign(
                  {},
                  null !== (r = null == u ? void 0 : u.headers) && void 0 !== r
                    ? r
                    : {},
                ),
                null !== (s = null == a ? void 0 : a.headers) && void 0 !== s
                  ? s
                  : {},
              ),
            }),
            accessToken: () =>
              Ht(this, void 0, void 0, function* () {
                return "";
              }),
          };
        return (
          e.accessToken
            ? (d.accessToken = e.accessToken)
            : delete d.accessToken,
          d
        );
      })(null != r ? r : {}, {
        db: Ft,
        realtime: Jt,
        auth: Object.assign(Object.assign({}, zt), { storageKey: c }),
        global: Mt,
      });
    ((this.storageKey =
      null !== (s = h.auth.storageKey) && void 0 !== s ? s : ""),
      (this.headers = null !== (i = h.global.headers) && void 0 !== i ? i : {}),
      h.accessToken
        ? ((this.accessToken = h.accessToken),
          (this.auth = new Proxy(
            {},
            {
              get: (e, t) => {
                throw new Error(
                  `@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t)} is not possible`,
                );
              },
            },
          )))
        : (this.auth = this._initSupabaseAuthClient(
            null !== (n = h.auth) && void 0 !== n ? n : {},
            this.headers,
            h.global.fetch,
          )),
      (this.fetch = Kt(t, this._getAccessToken.bind(this), h.global.fetch)),
      (this.realtime = this._initRealtimeClient(
        Object.assign(
          {
            headers: this.headers,
            accessToken: this._getAccessToken.bind(this),
          },
          h.realtime,
        ),
      )),
      (this.rest = new Pe(new URL("rest/v1", l).href, {
        headers: this.headers,
        schema: h.db.schema,
        fetch: this.fetch,
      })),
      h.accessToken || this._listenForAuthEvents());
  }
  get functions() {
    return new D(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch,
    });
  }
  get storage() {
    return new Nt(this.storageUrl.href, this.headers, this.fetch);
  }
  from(e) {
    return this.rest.from(e);
  }
  schema(e) {
    return this.rest.schema(e);
  }
  rpc(e, t = {}, r = {}) {
    return this.rest.rpc(e, t, r);
  }
  channel(e, t = { config: {} }) {
    return this.realtime.channel(e, t);
  }
  getChannels() {
    return this.realtime.getChannels();
  }
  removeChannel(e) {
    return this.realtime.removeChannel(e);
  }
  removeAllChannels() {
    return this.realtime.removeAllChannels();
  }
  _getAccessToken() {
    let e, t;
    return cs(this, void 0, void 0, function* () {
      if (this.accessToken) return yield this.accessToken();
      const { data: r } = yield this.auth.getSession();
      return null !==
        (t =
          null === (e = r.session) || void 0 === e ? void 0 : e.access_token) &&
        void 0 !== t
        ? t
        : null;
    });
  }
  _initSupabaseAuthClient(
    {
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: r,
      storage: s,
      storageKey: i,
      flowType: n,
      lock: o,
      debug: a,
    },
    l,
    c,
  ) {
    const h = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`,
    };
    return new ls({
      url: this.authUrl.href,
      headers: Object.assign(Object.assign({}, h), l),
      storageKey: i,
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: r,
      storage: s,
      flowType: n,
      lock: o,
      debug: a,
      fetch: c,
      hasCustomAuthorizationHeader: "Authorization" in this.headers,
    });
  }
  _initRealtimeClient(e) {
    return new yt(
      this.realtimeUrl.href,
      Object.assign(Object.assign({}, e), {
        params: Object.assign(
          { apikey: this.supabaseKey },
          null == e ? void 0 : e.params,
        ),
      }),
    );
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((e, t) => {
      this._handleTokenChanged(
        e,
        "CLIENT",
        null == t ? void 0 : t.access_token,
      );
    });
  }
  _handleTokenChanged(e, t, r) {
    ("TOKEN_REFRESHED" !== e && "SIGNED_IN" !== e) ||
    this.changedAccessToken === r
      ? "SIGNED_OUT" === e &&
        (this.realtime.setAuth(),
        "STORAGE" == t && this.auth.signOut(),
        (this.changedAccessToken = void 0))
      : (this.changedAccessToken = r);
  }
}
const us = new hs(
  "https://fytiwsutzgmygfxnqoft.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA",
  {
    auth: { autoRefreshToken: !0, persistSession: !0, detectSessionInUrl: !0 },
  },
);
const ds = "tools",
  fs = "categories",
  ps = (e) => (
    console.error("Supabase Error:", e),
    (null == e ? void 0 : e.message)
      ? e.message
      : (null == e ? void 0 : e.error_description)
        ? e.error_description
        : "操作失败，请稍后重试"
  );
function gs(e) {
  let t;
  return (null == (t = e.category) ? void 0 : t.id)
    ? e.category.id
    : e.categoryId
      ? e.categoryId
      : e.category_id
        ? e.category_id
        : null;
}
class vs {
  static async getCategories() {
    try {
      const { data: e, error: t } = await us
        .from(fs)
        .select("*")
        .eq("is_active", !0)
        .order("sort_order", { ascending: !0 });
      if (t) throw new Error(ps(t));
      const r = (e || []).map(this.transformCategoryRow);
      return this.buildCategoryTree(r);
    } catch (e) {
      throw (console.error("Error fetching categories:", e), e);
    }
  }
  static async getCategory(e) {
    try {
      const { data: t, error: r } = await us
        .from(fs)
        .select("*")
        .eq("id", e)
        .single();
      if (r) throw new Error(ps(r));
      return this.transformCategoryRow(t);
    } catch (t) {
      throw (console.error("Error fetching category:", t), t);
    }
  }
  static async createCategory(e) {
    try {
      const { data: t, error: r } = await us
        .from(fs)
        .insert({
          name: e.name,
          description: e.description,
          icon: e.icon,
          color: e.color,
          parent_id: e.parentId,
          sort_order: e.sortOrder || 0,
          is_active: !0,
        })
        .select()
        .single();
      if (r) throw new Error(ps(r));
      return this.transformCategoryRow(t);
    } catch (t) {
      throw (console.error("Error creating category:", t), t);
    }
  }
  static async updateCategory(e, t) {
    try {
      const r = {};
      (t.name && (r.name = t.name),
        void 0 !== t.description && (r.description = t.description),
        t.icon && (r.icon = t.icon),
        t.color && (r.color = t.color),
        void 0 !== t.parentId && (r.parent_id = t.parentId),
        void 0 !== t.sortOrder && (r.sort_order = t.sortOrder),
        void 0 !== t.isActive && (r.is_active = t.isActive),
        (r.updated_at = new Date().toISOString()));
      const { data: s, error: i } = await us
        .from(fs)
        .update(r)
        .eq("id", e)
        .select()
        .single();
      if (i) throw new Error(ps(i));
      return this.transformCategoryRow(s);
    } catch (r) {
      throw (console.error("Error updating category:", r), r);
    }
  }
  static async deleteCategory(e) {
    try {
      const { data: t, error: r } = await us
        .from(fs)
        .select("id")
        .eq("parent_id", e);
      if (r) throw new Error(ps(r));
      if (t && t.length > 0)
        throw new Error("无法删除包含子分类的分类，请先删除或移动子分类");
      const { data: s, error: i } = await us
        .from(ds)
        .select("id")
        .eq("category_id", e);
      if (i) throw new Error(ps(i));
      if (s && s.length > 0)
        throw new Error("无法删除包含工具的分类，请先删除或移动工具");
      const { error: n } = await us.from(fs).delete().eq("id", e);
      if (n) throw new Error(ps(n));
    } catch (t) {
      throw (console.error("Error deleting category:", t), t);
    }
  }
  static async getCategoryStats() {
    try {
      const { data: e, error: t } = await us
        .from(ds)
        .select("category_id")
        .eq("status", "active");
      if (t) throw new Error(ps(t));
      const r = new Map();
      return (
        null == e ||
          e.forEach((e) => {
            const t = r.get(e.category_id) || 0;
            r.set(e.category_id, t + 1);
          }),
        Array.from(r.entries()).map(([e, t]) => ({ categoryId: e, count: t }))
      );
    } catch (e) {
      throw (console.error("Error fetching category stats:", e), e);
    }
  }
  static async getCategoriesWithStats() {
    try {
      const [e, t] = await Promise.all([
          this.getCategories(),
          this.getCategoryStats(),
        ]),
        r = new Map(t.map((e) => [e.categoryId, e.count])),
        s = (e) => {
          let t;
          const i = r.get(e.id) || 0,
            n = (null == (t = e.children) ? void 0 : t.map(s)) || [],
            o = n.reduce((e, t) => e + t.count, 0);
          return { ...e, count: i + o, children: n };
        };
      return e.map(s);
    } catch (e) {
      throw (console.error("Error fetching categories with stats:", e), e);
    }
  }
  static buildCategoryTree(e) {
    const t = new Map(),
      r = [];
    return (
      e.forEach((e) => {
        t.set(e.id, { ...e, children: [] });
      }),
      e.forEach((e) => {
        const s = t.get(e.id);
        if (e.parentId) {
          const i = t.get(e.parentId);
          i ? ((i.children = i.children || []), i.children.push(s)) : r.push(s);
        } else r.push(s);
      }),
      r
    );
  }
  static transformCategoryRow(e) {
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      icon: e.icon,
      color: e.color,
      parentId: e.parent_id,
      count: 0,
      sortOrder: e.sort_order,
      isActive: e.is_active,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    };
  }
}
class ys {
  static async getTools(e) {
    try {
      let t = us
        .from(ds)
        .select("\n          *,\n          category:categories(*)\n        ")
        .eq("status", "active");
      ((null == e ? void 0 : e.query) &&
        (t = t.or(`name.ilike.%${e.query}%,description.ilike.%${e.query}%`)),
        (null == e ? void 0 : e.category) &&
          "all" !== e.category &&
          (t = t.eq("category_id", e.category)));
      const r = (null == e ? void 0 : e.sortBy) || "sort_order",
        s = (null == e ? void 0 : e.sortOrder) || "asc";
      t = t.order(r, { ascending: "asc" === s });
      const i = (null == e ? void 0 : e.page) || 1,
        n = (null == e ? void 0 : e.limit) || 20,
        o = (i - 1) * n;
      t = t.range(o, o + n - 1);
      const { data: a, error: l, count: c } = await t;
      if (l) throw new Error(ps(l));
      return {
        items: (a || []).map(this.transformToolRow),
        total: c || 0,
        page: i,
        limit: n,
        hasMore: (c || 0) > o + n,
      };
    } catch (t) {
      throw (console.error("Error fetching tools:", t), t);
    }
  }
  static async getTool(e) {
    try {
      const { data: t, error: r } = await us
        .from(ds)
        .select("\n          *,\n          category:categories(*)\n        ")
        .eq("id", e)
        .single();
      if (r) throw new Error(ps(r));
      return this.transformToolRow(t);
    } catch (t) {
      throw (console.error("Error fetching tool:", t), t);
    }
  }
  static async createTool(e) {
    try {
      !(function (e, t, r = "Entity") {
        const s = [];
        for (const i of t) e[i] || s.push(i);
        if (s.length > 0)
          throw new Error(
            `${r} validation failed: missing required fields: ${s.join(", ")}`,
          );
      })(e, ["name", "description", "url"], "Tool");
      const t = (function (e, t = "Category") {
          const r = gs(e);
          if (!r) throw new Error(`${t} is required`);
          return r;
        })(e),
        { data: r, error: s } = await us
          .from(ds)
          .insert({
            name: e.name,
            description: e.description,
            url: e.url,
            category_id: t,
            icon: e.icon,
            is_featured: e.isFeatured || !1,
            status: "active",
            meta_title: e.metaTitle,
            meta_description: e.metaDescription,
            sort_order: e.sortOrder || 0,
          })
          .select("\n          *,\n          category:categories(*)\n        ")
          .single();
      if (s) throw new Error(ps(s));
      return this.transformToolRow(r);
    } catch (t) {
      throw (console.error("Error creating tool:", t), t);
    }
  }
  static async updateTool(e, t) {
    try {
      const r = {};
      (t.name && (r.name = t.name),
        t.description && (r.description = t.description),
        t.url && (r.url = t.url));
      const s = gs(t);
      (s && (r.category_id = s),
        void 0 !== t.icon && (r.icon = t.icon),
        void 0 !== t.isFeatured && (r.is_featured = t.isFeatured),
        t.status && (r.status = t.status),
        void 0 !== t.metaTitle && (r.meta_title = t.metaTitle),
        void 0 !== t.metaDescription &&
          (r.meta_description = t.metaDescription),
        void 0 !== t.sortOrder && (r.sort_order = t.sortOrder),
        (r.updated_at = new Date().toISOString()));
      const { data: i, error: n } = await us
        .from(ds)
        .update(r)
        .eq("id", e)
        .select("\n          *,\n          category:categories(*)\n        ")
        .single();
      if (n) throw new Error(ps(n));
      return this.transformToolRow(i);
    } catch (r) {
      throw (console.error("Error updating tool:", r), r);
    }
  }
  static async deleteTool(e) {
    try {
      const { error: t } = await us.from(ds).delete().eq("id", e);
      if (t) throw new Error(ps(t));
    } catch (t) {
      throw (console.error("Error deleting tool:", t), t);
    }
  }
  static async incrementClickCount(e) {
    try {
      const { data: t, error: r } = await us
        .from(ds)
        .select("click_count")
        .eq("id", e)
        .single();
      if (r) throw new Error(ps(r));
      const { error: s } = await us
        .from(ds)
        .update({
          click_count: ((null == t ? void 0 : t.click_count) || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", e);
      if (s) throw new Error(ps(s));
    } catch (t) {
      throw (console.error("Error incrementing click count:", t), t);
    }
  }
  static async getPopularTools(e = 10) {
    try {
      const { data: t, error: r } = await us
        .from(ds)
        .select("\n          *,\n          category:categories(*)\n        ")
        .eq("status", "active")
        .order("click_count", { ascending: !1 })
        .limit(e);
      if (r) throw new Error(ps(r));
      return (t || []).map(this.transformToolRow);
    } catch (t) {
      throw (console.error("Error fetching popular tools:", t), t);
    }
  }
  static async getFeaturedTools(e = 6) {
    try {
      const { data: t, error: r } = await us
        .from(ds)
        .select("\n          *,\n          category:categories(*)\n        ")
        .eq("status", "active")
        .eq("is_featured", !0)
        .order("sort_order", { ascending: !0 })
        .limit(e);
      if (r) throw new Error(ps(r));
      return (t || []).map(this.transformToolRow);
    } catch (t) {
      throw (console.error("Error fetching featured tools:", t), t);
    }
  }
  static async searchTools(e, t = 20) {
    try {
      const { data: r, error: s } = await us
        .from(ds)
        .select("\n          *,\n          category:categories(*)\n        ")
        .eq("status", "active")
        .or(`name.ilike.%${e}%,description.ilike.%${e}%`)
        .order("click_count", { ascending: !1 })
        .limit(t);
      if (s) throw new Error(ps(s));
      return (r || []).map(this.transformToolRow);
    } catch (r) {
      throw (console.error("Error searching tools:", r), r);
    }
  }
  static transformToolRow(e) {
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      url: e.url,
      icon: e.icon,
      category: e.category
        ? vs.transformCategoryRow(e.category)
        : {
            id: e.category_id,
            name: "未分类",
            icon: "📁",
            color: "#666666",
            count: 0,
            sortOrder: 0,
            isActive: !0,
            createdAt: "",
            updatedAt: "",
          },
      tags: [],
      isFavorite: !1,
      clickCount: e.click_count,
      isFeature: e.is_featured,
      status: e.status,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      createdBy: e.created_by,
      metaTitle: e.meta_title,
      metaDescription: e.meta_description,
      sortOrder: e.sort_order,
    };
  }
  static transformCategoryRow(e) {
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      icon: e.icon,
      color: e.color,
      parentId: e.parent_id,
      count: 0,
      sortOrder: e.sort_order,
      isActive: e.is_active,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    };
  }
}
const ms = e("tools", () => {
    const e = t(""),
      s = t("all"),
      i = t(!1),
      n = t(!1),
      o = t(!1),
      a = t(null),
      l = t([]),
      c = t([]),
      h = t(null),
      u = t([]),
      d = t([]),
      f = t(!1),
      p = async () => {
        try {
          ((o.value = !0), (a.value = null));
          const e = await vs.getCategoriesWithStats();
          c.value = e;
        } catch (e) {
          ((a.value = e instanceof Error ? e.message : "加载分类失败"),
            console.error("Error loading categories:", e));
        } finally {
          o.value = !1;
        }
      },
      g = async (e) => {
        try {
          ((o.value = !0), (a.value = null));
          const t = await ys.getTools(e);
          e ? (h.value = t) : ((l.value = t.items), (h.value = null));
        } catch (t) {
          ((a.value = t instanceof Error ? t.message : "加载工具失败"),
            console.error("Error loading tools:", t));
        } finally {
          o.value = !1;
        }
      },
      v = async () => {
        try {
          const e = await ys.getPopularTools(6);
          u.value = e;
        } catch (e) {
          console.error("Error loading popular tools:", e);
        }
      },
      y = async () => {
        try {
          const e = await ys.getFeaturedTools(6);
          d.value = e;
        } catch (e) {
          console.error("Error loading featured tools:", e);
        }
      },
      m = async (e) => {
        if (e.trim())
          try {
            ((o.value = !0), (a.value = null));
            const t = {
              query: e.trim(),
              category: "all" !== s.value ? s.value : void 0,
              limit: 20,
            };
            await g(t);
          } catch (t) {
            ((a.value = t instanceof Error ? t.message : "搜索失败"),
              console.error("Error searching tools:", t));
          } finally {
            o.value = !1;
          }
        else h.value = null;
      },
      w = r(() => {
        if (h.value) return h.value.items;
        let t = l.value;
        if (
          ("favorites" === s.value
            ? (t = t.filter((e) => e.isFavorite))
            : "all" !== s.value &&
              (t = t.filter((e) => e.category.id === s.value)),
          e.value.trim())
        ) {
          const r = e.value.toLowerCase();
          t = t.filter(
            (e) =>
              e.name.toLowerCase().includes(r) ||
              e.description.toLowerCase().includes(r) ||
              e.tags.some((e) => e.name.toLowerCase().includes(r)),
          );
        }
        return (
          i.value &&
            "favorites" !== s.value &&
            (t = t.filter((e) => e.isFavorite)),
          t
        );
      }),
      _ = r(() => l.value.filter((e) => e.isFavorite)),
      b = r(() =>
        [...l.value]
          .sort(
            (e, t) =>
              new Date(t.createdAt).getTime() - new Date(e.createdAt).getTime(),
          )
          .slice(0, 6),
      ),
      k = r(() => {
        const e = new Map();
        return (
          l.value.forEach((t) => {
            const r = t.category.id;
            (e.has(r) || e.set(r, []), e.get(r).push(t));
          }),
          e
        );
      }),
      T = r(() => (h.value ? h.value.total : l.value.length));
    return {
      searchQuery: e,
      selectedCategory: s,
      showFavoritesOnly: i,
      sidebarCollapsed: n,
      loading: o,
      error: a,
      initialized: f,
      tools: l,
      categories: c,
      searchResult: h,
      popularTools: u,
      featuredTools: d,
      filteredTools: w,
      favoriteTools: _,
      recentTools: b,
      toolsByCategory: k,
      totalTools: T,
      initialize: async () => {
        if (!f.value)
          try {
            (await Promise.all([p(), g(), v(), y()]), (f.value = !0));
          } catch (e) {
            console.error("Error initializing tools store:", e);
          }
      },
      loadCategories: p,
      loadTools: g,
      loadPopularTools: v,
      loadFeaturedTools: y,
      searchTools: m,
      createTool: async (e) => {
        try {
          ((o.value = !0), (a.value = null));
          const t = await ys.createTool(e);
          return (l.value.unshift(t), t);
        } catch (t) {
          throw (
            (a.value = t instanceof Error ? t.message : "创建工具失败"),
            console.error("Error creating tool:", t),
            t
          );
        } finally {
          o.value = !1;
        }
      },
      updateTool: async (e, t) => {
        try {
          ((o.value = !0), (a.value = null));
          const r = await ys.updateTool(e, t),
            s = l.value.findIndex((t) => t.id === e);
          return (-1 !== s && (l.value[s] = r), r);
        } catch (r) {
          throw (
            (a.value = r instanceof Error ? r.message : "更新工具失败"),
            console.error("Error updating tool:", r),
            r
          );
        } finally {
          o.value = !1;
        }
      },
      deleteTool: async (e) => {
        try {
          ((o.value = !0),
            (a.value = null),
            await ys.deleteTool(e),
            (l.value = l.value.filter((t) => t.id !== e)));
        } catch (t) {
          throw (
            (a.value = t instanceof Error ? t.message : "删除工具失败"),
            console.error("Error deleting tool:", t),
            t
          );
        } finally {
          o.value = !1;
        }
      },
      incrementClickCount: async (e) => {
        try {
          await ys.incrementClickCount(e);
          const t = l.value.find((t) => t.id === e);
          t && t.clickCount++;
        } catch (t) {
          console.error("Error incrementing click count:", t);
        }
      },
      setSearchQuery: (t) => {
        ((e.value = t), t.trim() ? m(t) : (h.value = null));
      },
      setSelectedCategory: (t) => {
        ((s.value = t), e.value.trim() && m(e.value));
      },
      toggleFavorite: async (e) => {
        const t = l.value.find((t) => t.id === e);
        if (t) {
          const e = !t.isFavorite;
          t.isFavorite = e;
        }
      },
      toggleSidebar: () => {
        n.value = !n.value;
      },
      toggleFavoritesOnly: () => {
        i.value = !i.value;
      },
      clearError: () => {
        a.value = null;
      },
    };
  }),
  ws = { id: "app", class: "fluent-app" },
  _s = { class: "app-header" },
  bs = { class: "header-content" },
  ks = { class: "header-left" },
  Ts = { class: "header-center" },
  Ss = { class: "search-container" },
  Es = { key: 0, class: "search-shortcut" },
  js = { class: "header-right" },
  Os = { class: "user-avatar" },
  Ps = { class: "app-main" },
  Cs = { class: "sidebar-content" },
  As = { class: "category-nav" },
  $s = { class: "nav-section" },
  Is = { class: "nav-list" },
  Rs = { class: "nav-count" },
  xs = { class: "nav-count" },
  Ls = { class: "nav-section" },
  Us = { class: "nav-list" },
  Ds = ["onClick"],
  qs = { class: "nav-icon" },
  Ns = { class: "nav-text" },
  Bs = { class: "nav-count" },
  Ms = { class: "content-header" },
  Fs = { class: "content-title" },
  zs = { class: "content-count" },
  Js = { class: "content-actions" },
  Ws = { class: "view-options" },
  Ks = { class: "view-button active" },
  Hs = { key: 0, class: "tools-grid" },
  Gs = ["onClick"],
  Vs = { class: "card-header" },
  Qs = { class: "tool-icon" },
  Ys = ["onClick"],
  Xs = { class: "card-content" },
  Zs = { class: "tool-name" },
  ei = { class: "tool-description" },
  ti = { class: "tool-tags" },
  ri = { key: 0, class: "tag more" },
  si = { class: "card-footer" },
  ii = { class: "tool-stats" },
  ni = { class: "stat" },
  oi = { key: 1, class: "empty-state" },
  ai = j(
    ((e, t) => {
      const r = e.__vccOpts || e;
      for (const [s, i] of t) r[s] = i;
      return r;
    })(
      {
        __name: "App",
        setup(e) {
          const r = ms(),
            j = t(null),
            O = t(!1),
            P = () => {
              if ("all" === r.selectedCategory) return "全部工具";
              if ("favorites" === r.selectedCategory) return "我的收藏";
              const e = r.categories.find((e) => e.id === r.selectedCategory);
              return e ? e.name : "未知分类";
            },
            C = (e) => {
              let t, s;
              ((e.ctrlKey || e.metaKey) &&
                "k" === e.key &&
                (e.preventDefault(), null == (t = j.value) || t.focus()),
                "Escape" === e.key &&
                  (null == (s = j.value) || s.blur(), r.setSearchQuery("")));
            };
          return (
            s(() => {
              document.addEventListener("keydown", C);
            }),
            i(() => {
              document.removeEventListener("keydown", C);
            }),
            (e, t) => (
              y(),
              n("div", ws, [
                o(
                  "div",
                  { tabindex: "-1", class: "app-container", onKeydown: C },
                  [
                    o("header", _s, [
                      o("div", bs, [
                        o("div", ks, [
                          o(
                            "button",
                            {
                              class: l([
                                "sidebar-toggle",
                                { active: !a(r).sidebarCollapsed },
                              ]),
                              onClick:
                                t[0] || (t[0] = (e) => a(r).toggleSidebar()),
                            },
                            [c(a(m), { class: "icon" })],
                            2,
                          ),
                          t[8] ||
                            (t[8] = o(
                              "div",
                              { class: "app-title" },
                              [
                                o("div", { class: "title-icon" }, "🚀"),
                                o("div", { class: "title-text" }, [
                                  o("h1", null, "工具导航站"),
                                  o("span", null, "让工作更高效"),
                                ]),
                              ],
                              -1,
                            )),
                        ]),
                        o("div", Ts, [
                          o("div", Ss, [
                            c(a(w), { class: "search-icon" }),
                            h(
                              o(
                                "input",
                                {
                                  ref_key: "searchInput",
                                  ref: j,
                                  "onUpdate:modelValue":
                                    t[1] ||
                                    (t[1] = (e) => (a(r).searchQuery = e)),
                                  type: "text",
                                  placeholder: "搜索工具... (Ctrl+K)",
                                  class: "search-input",
                                  onFocus:
                                    t[2] || (t[2] = (e) => (O.value = !0)),
                                  onBlur:
                                    t[3] || (t[3] = (e) => (O.value = !1)),
                                },
                                null,
                                544,
                              ),
                              [[d, a(r).searchQuery]],
                            ),
                            O.value || a(r).searchQuery
                              ? u("", !0)
                              : (y(),
                                n(
                                  "div",
                                  Es,
                                  t[9] ||
                                    (t[9] = [
                                      o("kbd", null, "Ctrl", -1),
                                      f(" + "),
                                      o("kbd", null, "K", -1),
                                    ]),
                                )),
                          ]),
                        ]),
                        o("div", js, [
                          o(
                            "button",
                            {
                              class: l([
                                "header-button",
                                { active: a(r).showFavoritesOnly },
                              ]),
                              onClick:
                                t[4] ||
                                (t[4] = (e) => a(r).toggleFavoritesOnly()),
                            },
                            [
                              c(a(_), { class: "icon" }),
                              t[10] || (t[10] = o("span", null, "收藏", -1)),
                            ],
                            2,
                          ),
                          o("div", Os, [c(a(b), { class: "icon" })]),
                        ]),
                      ]),
                    ]),
                    o("div", Ps, [
                      o(
                        "aside",
                        {
                          class: l([
                            "sidebar",
                            { collapsed: a(r).sidebarCollapsed },
                          ]),
                        },
                        [
                          o("div", Cs, [
                            o("nav", As, [
                              o("div", $s, [
                                t[15] ||
                                  (t[15] = o(
                                    "h3",
                                    { class: "nav-title" },
                                    "导航",
                                    -1,
                                  )),
                                o("ul", Is, [
                                  o("li", null, [
                                    o(
                                      "button",
                                      {
                                        class: l([
                                          "nav-item",
                                          {
                                            active:
                                              "all" === a(r).selectedCategory,
                                          },
                                        ]),
                                        onClick:
                                          t[5] ||
                                          (t[5] = (e) =>
                                            a(r).setSelectedCategory("all")),
                                      },
                                      [
                                        t[11] ||
                                          (t[11] = o(
                                            "div",
                                            { class: "nav-icon" },
                                            "🏠",
                                            -1,
                                          )),
                                        t[12] ||
                                          (t[12] = o(
                                            "span",
                                            { class: "nav-text" },
                                            "全部工具",
                                            -1,
                                          )),
                                        o("span", Rs, p(a(r).tools.length), 1),
                                      ],
                                      2,
                                    ),
                                  ]),
                                  o("li", null, [
                                    o(
                                      "button",
                                      {
                                        class: l([
                                          "nav-item",
                                          {
                                            active:
                                              "favorites" ===
                                              a(r).selectedCategory,
                                          },
                                        ]),
                                        onClick:
                                          t[6] ||
                                          (t[6] = (e) =>
                                            a(r).setSelectedCategory(
                                              "favorites",
                                            )),
                                      },
                                      [
                                        t[13] ||
                                          (t[13] = o(
                                            "div",
                                            { class: "nav-icon" },
                                            "⭐",
                                            -1,
                                          )),
                                        t[14] ||
                                          (t[14] = o(
                                            "span",
                                            { class: "nav-text" },
                                            "我的收藏",
                                            -1,
                                          )),
                                        o(
                                          "span",
                                          xs,
                                          p(a(r).favoriteTools.length),
                                          1,
                                        ),
                                      ],
                                      2,
                                    ),
                                  ]),
                                ]),
                              ]),
                              o("div", Ls, [
                                t[16] ||
                                  (t[16] = o(
                                    "h3",
                                    { class: "nav-title" },
                                    "分类",
                                    -1,
                                  )),
                                o("ul", Us, [
                                  (y(!0),
                                  n(
                                    g,
                                    null,
                                    v(
                                      a(r).categories,
                                      (e) => (
                                        y(),
                                        n("li", { key: e.id }, [
                                          o(
                                            "button",
                                            {
                                              class: l([
                                                "nav-item",
                                                {
                                                  active:
                                                    a(r).selectedCategory ===
                                                    e.id,
                                                },
                                              ]),
                                              onClick: (t) =>
                                                a(r).setSelectedCategory(e.id),
                                            },
                                            [
                                              o("div", qs, p(e.icon), 1),
                                              o("span", Ns, p(e.name), 1),
                                              o("span", Bs, p(e.count), 1),
                                            ],
                                            10,
                                            Ds,
                                          ),
                                        ])
                                      ),
                                    ),
                                    128,
                                  )),
                                ]),
                              ]),
                            ]),
                          ]),
                        ],
                        2,
                      ),
                      o(
                        "main",
                        {
                          class: l([
                            "content",
                            { "sidebar-collapsed": a(r).sidebarCollapsed },
                          ]),
                        },
                        [
                          o("div", Ms, [
                            o("div", Fs, [
                              o("h2", null, p(P()), 1),
                              o(
                                "span",
                                zs,
                                p(a(r).filteredTools.length) + " 个工具",
                                1,
                              ),
                            ]),
                            o("div", Js, [
                              o("div", Ws, [
                                o("button", Ks, [c(a(k), { class: "icon" })]),
                              ]),
                            ]),
                          ]),
                          a(r).filteredTools.length > 0
                            ? (y(),
                              n("div", Hs, [
                                (y(!0),
                                n(
                                  g,
                                  null,
                                  v(
                                    a(r).filteredTools,
                                    (e) => (
                                      y(),
                                      n(
                                        "div",
                                        {
                                          key: e.id,
                                          class: "tool-card",
                                          onClick: (t) =>
                                            ((e) => {
                                              (r.incrementClickCount(e.id),
                                                window.open(
                                                  e.url,
                                                  "_blank",
                                                  "noopener,noreferrer",
                                                ));
                                            })(e),
                                        },
                                        [
                                          o("div", Vs, [
                                            o("div", Qs, p(e.icon), 1),
                                            o(
                                              "button",
                                              {
                                                class: l([
                                                  "favorite-button",
                                                  { active: e.isFavorite },
                                                ]),
                                                onClick: T(
                                                  (t) =>
                                                    a(r).toggleFavorite(e.id),
                                                  ["stop"],
                                                ),
                                              },
                                              [c(a(_), { class: "icon" })],
                                              10,
                                              Ys,
                                            ),
                                          ]),
                                          o("div", Xs, [
                                            o("h3", Zs, p(e.name), 1),
                                            o("p", ei, p(e.description), 1),
                                            o("div", ti, [
                                              (y(!0),
                                              n(
                                                g,
                                                null,
                                                v(
                                                  e.tags.slice(0, 3),
                                                  (e) => (
                                                    y(),
                                                    n(
                                                      "span",
                                                      { key: e, class: "tag" },
                                                      p(e),
                                                      1,
                                                    )
                                                  ),
                                                ),
                                                128,
                                              )),
                                              e.tags.length > 3
                                                ? (y(),
                                                  n(
                                                    "span",
                                                    ri,
                                                    " +" + p(e.tags.length - 3),
                                                    1,
                                                  ))
                                                : u("", !0),
                                            ]),
                                          ]),
                                          o("div", si, [
                                            o("div", ii, [
                                              o("span", ni, [
                                                c(a(S), { class: "stat-icon" }),
                                                f(" " + p(e.clickCount), 1),
                                              ]),
                                            ]),
                                            c(a(E), { class: "external-icon" }),
                                          ]),
                                        ],
                                        8,
                                        Gs,
                                      )
                                    ),
                                  ),
                                  128,
                                )),
                              ]))
                            : (y(),
                              n("div", oi, [
                                t[17] ||
                                  (t[17] = o(
                                    "div",
                                    { class: "empty-icon" },
                                    "🔍",
                                    -1,
                                  )),
                                t[18] ||
                                  (t[18] = o("h3", null, "未找到相关工具", -1)),
                                t[19] ||
                                  (t[19] = o(
                                    "p",
                                    null,
                                    "尝试使用其他关键词搜索，或浏览其他分类",
                                    -1,
                                  )),
                                o(
                                  "button",
                                  {
                                    class: "empty-action",
                                    onClick:
                                      t[7] ||
                                      (t[7] = (e) => a(r).setSearchQuery("")),
                                  },
                                  " 清除搜索条件 ",
                                ),
                              ])),
                        ],
                        2,
                      ),
                    ]),
                  ],
                  32,
                ),
              ])
            )
          );
        },
      },
      [["__scopeId", "data-v-8ff77c73"]],
    ),
  ),
  li = O();
(ai.use(li), ai.mount("#app"));
