import { vi } from "vitest";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

// Setup Pinia for tests
const pinia = createPinia();
setActivePinia(pinia);

// Mock Pinia stores
vi.mock("@/stores/categories", () => ({
  useCategoriesStore: () => ({
    categories: [],
    initialize: vi.fn().mockResolvedValue([]),
    fetchCategories: vi.fn().mockResolvedValue([]),
    getCategoryById: vi.fn(),
    loading: false,
    error: null,
    initialized: false,
  }),
}));

vi.mock("@/stores/tools", () => ({
  useToolsStore: () => ({
    tools: [],
    initialize: vi.fn().mockResolvedValue([]),
    fetchTools: vi.fn().mockResolvedValue([]),
    getToolById: vi.fn(),
    loading: false,
    error: null,
  }),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    initialize: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    logout: vi.fn(),
    error: null,
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
  root: null,
  rootMargin: "",
  thresholds: [] as number[],
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
})) as any;

// Mock Notification API
global.Notification = vi.fn(() => ({
  close: vi.fn(),
})) as any;

Object.defineProperty(global.Notification, "permission", {
  value: "granted",
  writable: true,
});

Object.defineProperty(global.Notification, "requestPermission", {
  value: vi.fn(() => Promise.resolve("granted")),
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock navigator
Object.defineProperty(global.navigator, "onLine", {
  value: true,
  writable: true,
});

Object.defineProperty(global.navigator, "userAgent", {
  value: "Mozilla/5.0 (Test Environment)",
  writable: true,
});

Object.defineProperty(global.navigator, "clipboard", {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve("")),
  },
  writable: true,
});

// Mock window.matchMedia with proper MediaQueryList interface
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    // Ensure addEventListener exists and is callable
    Object.defineProperty(mql, "addEventListener", {
      value: vi.fn(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return mql;
  }),
});

// Mock performance API
Object.defineProperty(global.performance, "now", {
  value: vi.fn(() => Date.now()),
  writable: true,
});

Object.defineProperty(global.performance, "mark", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(global.performance, "measure", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(global.performance, "getEntriesByType", {
  value: vi.fn(() => []),
  writable: true,
});

Object.defineProperty(global.performance, "getEntriesByName", {
  value: vi.fn(() => []),
  writable: true,
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  }),
) as any;

// Mock URL constructor
global.URL.createObjectURL = vi.fn(() => "mocked-url");
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
})) as any;

// Mock Image constructor
global.Image = vi.fn(() => ({
  onload: null,
  onerror: null,
  src: "",
  width: 0,
  height: 0,
})) as any;

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Only show errors that are not expected test errors
  if (
    !args[0]?.toString().includes("Warning:") &&
    !args[0]?.toString().includes("[Vue warn]")
  ) {
    originalConsoleError(...args);
  }
};

console.warn = (...args: any[]) => {
  // Only show warnings that are not expected test warnings
  if (!args[0]?.toString().includes("[Vue warn]")) {
    originalConsoleWarn(...args);
  }
};

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n
  $route: {
    path: "/",
    query: {},
    params: {},
    name: "Home",
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

// Add Pinia to global plugins
config.global.plugins = [pinia];

// Mock CSS modules
vi.mock("*.module.css", () => ({}));
vi.mock("*.module.scss", () => ({}));

// Mock image imports
vi.mock("*.png", () => "mocked-image.png");
vi.mock("*.jpg", () => "mocked-image.jpg");
vi.mock("*.jpeg", () => "mocked-image.jpeg");
vi.mock("*.gif", () => "mocked-image.gif");
vi.mock("*.svg", () => "mocked-image.svg");

// Setup cleanup
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  full_name: "Test User",
  username: "testuser",
  avatar_url: null,
  role: "user",
  is_active: true,
  email_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockTool = (overrides = {}) => ({
  id: "tool-123",
  name: "Test Tool",
  description: "A test tool for testing",
  url: "https://example.com",
  category_id: "category-123",
  icon: "test-icon.png",
  tags: [],
  is_featured: false,
  click_count: 0,
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: "notification-123",
  user_id: "user-123",
  type: "info",
  title: "Test Notification",
  message: "This is a test notification",
  is_read: false,
  is_important: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
