
# API参考

<cite>
**本文档中引用的文件**
- [toolsService.ts](file://src/services/toolsService.ts)
- [userService.ts](file://src/services/userService.ts)
- [orderService.ts](file://src/services/orderService.ts)
- [productsService.ts](file://src/services/productsService.ts)
- [reviewService.ts](file://src/services/reviewService.ts)
- [searchService.ts](file://src/services/searchService.ts)
- [favoritesService.ts](file://src/services/favoritesService.ts)
- [notificationService.ts](file://src/services/notificationService.ts)
- [paymentService.ts](file://src/services/paymentService.ts)
- [categoriesService.ts](file://src/services/categoriesService.ts)
- [localStorageService.ts](file://src/services/localStorageService.ts)
- [performanceService.ts](file://src/services/performanceService.ts)
- [supabaseClient.ts](file://src/lib/supabaseClient.ts)
</cite>

## 目录
1. [简介](#简介)
2. [工具服务](#工具服务)
3. [用户服务](#用户服务)
4. [订单服务](#订单服务)
5. [产品服务](#产品服务)
6. [评价服务](#评价服务)
7. [搜索服务](#搜索服务)
8. [收藏服务](#收藏服务)
9. [通知服务](#通知服务)
10. [支付服务](#支付服务)
11. [分类服务](#分类服务)
12. [本地存储服务](#本地存储服务)
13. [性能服务](#性能服务)

## 简介
本文档提供了项目中所有对外暴露接口的详细参考。由于本项目主要依赖Supabase RESTful API并通过自定义services封装，以下将逐一列出各service模块提供的方法，包括所属类、参数类型、返回值格式、可能抛出的异常及使用示例，并明确标注哪些是直接调用Supabase SDK，哪些是本地逻辑处理。

## 工具服务

### getTools
获取所有工具（带缓存）
- **所属类**: `ToolsService`
- **参数类型**: `SearchFilters` (可选)
- **返回值格式**: `Promise<SearchResult<Tool>>`
- **可能抛出的异常**: Supabase查询错误时抛出"操作失败，请稍后重试"
- **使用示例**: `const result = await ToolsService.getTools({ query: "AI", category: "ai-tools" });`
- **调用类型**: 直接调用Supabase SDK

### getTool
获取单个工具（带缓存）
- **所属类**: `ToolsService`
- **参数类型**: `id: string`
- **返回值格式**: `Promise<Tool>`
- **可能抛出的异常**: Supabase查询错误或数据不存在时抛出相应错误
- **使用示例**: `const tool = await ToolsService.getTool("tool-123");`
- **调用类型**: 直接调用Supabase SDK

### createTool
创建新工具
- **所属类**: `ToolsService`
- **参数类型**: `toolData: ToolInput`
- **返回值格式**: `Promise<Tool>`
- **可能抛出的异常**: 字段验证失败或Supabase插入错误时抛出相应错误
- **使用示例**: `const newTool = await ToolsService.createTool({ name: "New Tool", description: "Description", url: "https://example.com", category_id: "cat-123" });`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [toolsService.ts](file://src/services/toolsService.ts#L20-L200)

## 用户服务

### getCurrentUser
获取当前用户信息
- **所属类**: `UserService`
- **参数类型**: 无
- **返回值格式**: `Promise<User | null>`
- **可能抛出的异常**: 获取用户资料失败时不抛出异常，返回null
- **使用示例**: `const user = await UserService.getCurrentUser();`
- **调用类型**: 混合调用（先调用Supabase auth，再查询user_profiles表）

### getUserProfile
获取指定用户资料
- **所属类**: `UserService`
- **参数类型**: `userId: string`
- **返回值格式**: `Promise<User | null>`
- **可能抛出的异常**: 查询失败时抛出错误
- **使用示例**: `const profile = await UserService.getUserProfile("user-123");`
- **调用类型**: 直接调用Supabase SDK

### updateProfile
更新用户资料
- **所属类**: `UserService`
- **参数类型**: `userId: string, profileData: ProfileForm`
- **返回值格式**: `Promise<User>`
- **可能抛出的异常**: 更新失败时抛出"更新用户资料失败"
- **使用示例**: `await UserService.updateProfile("user-123", { full_name: "John Doe", bio: "Developer" });`
- **调用类型**: 混合调用（包含头像上传逻辑和Supabase更新）

### uploadAvatar
上传用户头像
- **所属类**: `UserService`
- **参数类型**: `userId: string, file: File`
- **返回值格式**: `Promise<string>` (返回公共URL)
- **可能抛出的异常**: 上传失败时抛出"上传头像失败"
- **使用示例**: `const url = await UserService.uploadAvatar("user-123", file);`
- **调用类型**: 直接调用Supabase Storage SDK

### createUserProfile
创建用户资料
- **所属类**: `UserService`
- **参数类型**: `userId: string, email: string`
- **返回值格式**: `Promise<User>`
- **可能抛出的异常**: 插入失败时抛出"创建用户资料失败"
- **使用示例**: `await UserService.createUserProfile("user-123", "user@example.com");`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [userService.ts](file://src/services/userService.ts#L15-L200)

## 订单服务

### createOrder
创建订单
- **所属类**: `OrderService`
- **参数类型**: `orderData: CreateOrderData, userId: string`
- **返回值格式**: `Promise<Order>`
- **可能抛出的异常**: 产品不存在或数据库操作失败时抛出相应错误
- **使用示例**: `const order = await OrderService.createOrder({ product_id: "prod-123", quantity: 1, billing_address: {...} }, "user-123");`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [orderService.ts](file://src/services/orderService.ts#L50-L200)

## 产品服务

### getProducts
获取所有产品
- **所属类**: `ProductsService`
- **参数类型**: `filters?: SearchFilters`
- **返回值格式**: `Promise<SearchResult<Product>>`
- **可能抛出的异常**: 查询失败时抛出"获取产品列表失败"
- **使用示例**: `const products = await ProductsService.getProducts({ category: "software" });`
- **调用类型**: 直接调用Supabase SDK

### getProduct
获取单个产品
- **所属类**: `ProductsService`
- **参数类型**: `id: string`
- **返回值格式**: `Promise<Product>`
- **可能抛出的异常**: 查询失败或产品不存在时抛出相应错误
- **使用示例**: `const product = await ProductsService.getProduct("prod-123");`
- **调用类型**: 直接调用Supabase SDK

### getFeaturedProducts
获取特色产品
- **所属类**: `ProductsService`
- **参数类型**: `limit = 6`
- **返回值格式**: `Promise<Product[]>`
- **可能抛出的异常**: 查询失败时抛出"获取特色产品失败"
- **使用示例**: `const featured = await ProductsService.getFeaturedProducts(8);`
- **调用类型**: 直接调用Supabase SDK

### getRelatedProducts
获取相关产品
- **所属类**: `ProductsService`
- **参数类型**: `productId: string, categoryId: string, limit = 4`
- **返回值格式**: `Promise<Product[]>`
- **可能抛出的异常**: 查询失败时不抛出异常，返回空数组
- **使用示例**: `const related = await ProductsService.getRelatedProducts("prod-123", "cat-456");`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [productsService.ts](file://src/services/productsService.ts#L15-L200)

## 评价服务

### getProductReviews
获取产品评价列表
- **所属类**: `ReviewService`
- **参数类型**: `productId: string, options: QueryOptions & ReviewFilters = {}`
- **返回值格式**: `Promise<{ reviews: Review[], total: number, stats: ReviewStats }>`
- **可能抛出的异常**: 查询失败时抛出相应错误
- **使用示例**: `const reviews = await reviewService.getProductReviews("prod-123", { rating: 5 });`
- **调用类型**: 直接调用Supabase SDK

### getProductReviewStats
获取产品评价统计
- **所属类**: `ReviewService`
- **参数类型**: `productId: string`
- **返回值格式**: `Promise<ReviewStats>`
- **可能抛出的异常**: 查询失败时抛出相应错误
- **使用示例**: `const stats = await reviewService.getProductReviewStats("prod-123");`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [reviewService.ts](file://src/services/reviewService.ts#L150-L200)

## 搜索服务

### search
主搜索方法
- **所属类**: `SearchService`
- **参数类型**: `options: SearchOptions`
- **返回值格式**: `Promise<SearchResult<T>>`
- **可能抛出的异常**: 搜索失败时抛出相应错误
- **使用示例**: `const results = await searchService.search({ query: "AI tools", type: "tools" });`
- **调用类型**: 直接调用Supabase SDK

### searchTools
搜索工具
- **所属类**: `SearchService`
- **参数类型**: `options: SearchOptions`
- **返回值格式**: `Promise<{ items: Tool[], total: number, facets: SearchFacets }>`
- **可能抛出的异常**: 查询失败时抛出相应错误
- **使用示例**: `const tools = await searchService.searchTools({ query: "AI" });`
- **调用类型**: 直接调用Supabase SDK

### searchProducts
搜索产品
- **所属类**: `SearchService`
- **参数类型**: `options: SearchOptions`
- **返回值格式**: `Promise<{ items: Product[], total: number, facets: SearchFacets }>`
- **可能抛出的异常**: 查询失败时抛出相应错误
- **使用示例**: `const products = await searchService.searchProducts({ query: "software" });`
- **调用类型**: 直接调用Supabase SDK

**Section sources**
- [searchService.ts](file://src/services/searchService.ts#L50-L200)

## 收藏服务

### getFavoriteTools
获取用户收藏的工具
- **所属类**: `FavoritesService`
- **参数类型**: `userId: string`
- **返回值格式**: `Promise<Tool[]>`
- **可能抛出的异常**: 查询失败时抛出"获取收藏工具失败"
- **使用示例**: `const favorites = await FavoritesService.getFavoriteTools("user-123");`
- **调用类型**: 直接调用Supabase SDK

### getFavoriteProducts
获取用户收藏的产品
- **所属类**: `FavoritesService`
- **参数类型**: `userId: string`
- **返回值格式**: `Promise<Product[]>`
- **可能抛出的异常**: 查询失败时抛出"获取收藏产品失败"
- **使用示例**: `const favorites = await FavoritesService.getFavoriteProducts("user-123");`
- **调用类型**: 直接调用Supabase SDK

