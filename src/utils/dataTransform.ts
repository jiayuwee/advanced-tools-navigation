/**
 * 数据转换工具函数
 */

/**
 * 提取分类 ID
 * 支持从不同格式的数据中提取分类 ID
 * @param data 包含分类信息的数据对象
 * @returns 分类 ID 或 null
 */
export function extractCategoryId(data: any): string | null {
  // 优先使用嵌套的 category.id
  if (data.category?.id) {
    return data.category.id;
  }
  
  // 其次使用直接的 categoryId
  if (data.categoryId) {
    return data.categoryId;
  }
  
  // 最后使用 category_id（数据库字段名）
  if (data.category_id) {
    return data.category_id;
  }
  
  return null;
}

/**
 * 验证并提取分类 ID
 * 如果分类 ID 不存在则抛出错误
 * @param data 包含分类信息的数据对象
 * @param fieldName 字段名称，用于错误消息
 * @returns 分类 ID
 */
export function requireCategoryId(data: any, fieldName = 'Category'): string {
  const categoryId = extractCategoryId(data);
  
  if (!categoryId) {
    throw new Error(`${fieldName} is required`);
  }
  
  return categoryId;
}

/**
 * 提取用户 ID
 * 支持从不同格式的数据中提取用户 ID
 * @param data 包含用户信息的数据对象
 * @returns 用户 ID 或 null
 */
export function extractUserId(data: any): string | null {
  // 优先使用嵌套的 user.id
  if (data.user?.id) {
    return data.user.id;
  }
  
  // 其次使用直接的 userId
  if (data.userId) {
    return data.userId;
  }
  
  // 最后使用 user_id（数据库字段名）
  if (data.user_id) {
    return data.user_id;
  }
  
  return null;
}

/**
 * 验证并提取用户 ID
 * 如果用户 ID 不存在则抛出错误
 * @param data 包含用户信息的数据对象
 * @param fieldName 字段名称，用于错误消息
 * @returns 用户 ID
 */
export function requireUserId(data: any, fieldName = 'User'): string {
  const userId = extractUserId(data);
  
  if (!userId) {
    throw new Error(`${fieldName} is required`);
  }
  
  return userId;
}

/**
 * 转换前端表单数据为数据库插入格式
 * @param formData 前端表单数据
 * @param fieldMappings 字段映射配置
 * @returns 数据库插入数据
 */
export function transformFormToDatabase(
  formData: any,
  fieldMappings: Record<string, string | ((value: any) => any)>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [formField, dbField] of Object.entries(fieldMappings)) {
    const value = formData[formField];
    
    if (value !== undefined && value !== null) {
      if (typeof dbField === 'function') {
        // 自定义转换函数
        const transformedValue = dbField(value);
        if (transformedValue !== undefined && transformedValue !== null) {
          Object.assign(result, transformedValue);
        }
      } else {
        // 直接字段映射
        result[dbField] = value;
      }
    }
  }
  
  return result;
}

/**
 * 转换数据库行数据为前端业务对象
 * @param dbRow 数据库行数据
 * @param fieldMappings 字段映射配置
 * @returns 前端业务对象
 */
export function transformDatabaseToModel(
  dbRow: any,
  fieldMappings: Record<string, string | ((value: any) => any)>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [dbField, modelField] of Object.entries(fieldMappings)) {
    const value = dbRow[dbField];
    
    if (value !== undefined && value !== null) {
      if (typeof modelField === 'function') {
        // 自定义转换函数
        const transformedValue = modelField(value);
        if (transformedValue !== undefined && transformedValue !== null) {
          Object.assign(result, transformedValue);
        }
      } else {
        // 直接字段映射
        result[modelField] = value;
      }
    }
  }
  
  return result;
}

/**
 * 验证必需字段
 * @param data 要验证的数据
 * @param requiredFields 必需字段列表
 * @param entityName 实体名称，用于错误消息
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[],
  entityName = 'Entity'
): void {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(
      `${entityName} validation failed: missing required fields: ${missingFields.join(', ')}`
    );
  }
}

/**
 * 清理数据对象，移除 undefined 和 null 值
 * @param data 要清理的数据对象
 * @returns 清理后的数据对象
 */
export function cleanData(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * 格式化错误消息
 * @param error 错误对象
 * @param context 上下文信息
 * @returns 格式化的错误消息
 */
export function formatErrorMessage(error: any, context?: string): string {
  let message = 'An error occurred';
  
  if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  if (context) {
    message = `${context}: ${message}`;
  }
  
  return message;
}

/**
 * 生成排序顺序
 * 为新项目生成合适的排序顺序值
 * @param existingItems 现有项目列表
 * @param sortField 排序字段名
 * @returns 新的排序顺序值
 */
export function generateSortOrder(
  existingItems: any[],
  sortField = 'sortOrder'
): number {
  if (!existingItems || existingItems.length === 0) {
    return 0;
  }
  
  const maxOrder = Math.max(
    ...existingItems.map(item => item[sortField] || 0)
  );
  
  return maxOrder + 1;
}
