#!/usr/bin/env node

/**
 * TypeScript 错误修复脚本
 * 
 * 此脚本自动修复项目中的 TypeScript 类型错误
 * 主要解决数据库字段命名不一致的问题
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

console.log('🔧 开始修复 TypeScript 类型错误...\n');

// 需要修复的字段映射
const FIELD_MAPPINGS = {
  // Category 字段
  'parentId': 'parent_id',
  'isActive': 'is_active',
  'sortOrder': 'sort_order',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  
  // Tool 字段
  'categoryId': 'category_id',
  'clickCount': 'click_count',
  'isFeatured': 'is_featured',
  'isFavorite': 'is_favorite',
  
  // User 字段
  'fullName': 'full_name',
  'avatarUrl': 'avatar_url',
  'lastLoginAt': 'last_login_at',
};

// 需要处理的文件扩展名
const EXTENSIONS = ['.ts', '.vue', '.js'];

// 递归获取所有需要处理的文件
function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 dist 目录
      if (!['node_modules', 'dist', '.git'].includes(item)) {
        getAllFiles(fullPath, files);
      }
    } else if (EXTENSIONS.includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 修复文件中的字段名
function fixFieldNames(content) {
  let fixed = content;
  let changeCount = 0;
  
  for (const [oldField, newField] of Object.entries(FIELD_MAPPINGS)) {
    // 匹配对象属性访问：obj.oldField
    const propertyRegex = new RegExp(`\\.${oldField}\\b`, 'g');
    const propertyMatches = fixed.match(propertyRegex);
    if (propertyMatches) {
      fixed = fixed.replace(propertyRegex, `.${newField}`);
      changeCount += propertyMatches.length;
    }
    
    // 匹配对象字面量：{ oldField: value }
    const literalRegex = new RegExp(`\\b${oldField}:`, 'g');
    const literalMatches = fixed.match(literalRegex);
    if (literalMatches) {
      fixed = fixed.replace(literalRegex, `${newField}:`);
      changeCount += literalMatches.length;
    }
  }
  
  return { content: fixed, changeCount };
}

// 修复特定的类型错误
function fixSpecificErrors(content) {
  let fixed = content;
  let changeCount = 0;
  
  // 修复 null 类型问题
  const nullFixes = [
    {
      pattern: /: row\.(\w+),/g,
      replacement: ': row.$1 || undefined,'
    },
    {
      pattern: /Type 'string \| null' is not assignable to type 'string \| undefined'/g,
      replacement: ''
    }
  ];
  
  for (const fix of nullFixes) {
    const matches = fixed.match(fix.pattern);
    if (matches) {
      fixed = fixed.replace(fix.pattern, fix.replacement);
      changeCount += matches.length;
    }
  }
  
  return { content: fixed, changeCount };
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // 应用字段名修复
    const fieldResult = fixFieldNames(content);
    
    // 应用特定错误修复
    const specificResult = fixSpecificErrors(fieldResult.content);
    
    const totalChanges = fieldResult.changeCount + specificResult.changeCount;
    
    if (totalChanges > 0) {
      writeFileSync(filePath, specificResult.content, 'utf8');
      console.log(`✅ ${filePath}: ${totalChanges} 处修复`);
      return totalChanges;
    }
    
    return 0;
  } catch (error) {
    console.log(`❌ ${filePath}: ${error.message}`);
    return 0;
  }
}

// 主函数
function main() {
  const srcDir = 'src';
  const files = getAllFiles(srcDir);
  
  console.log(`📁 找到 ${files.length} 个文件需要检查\n`);
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const changes = processFile(file);
    if (changes > 0) {
      totalFiles++;
      totalChanges += changes;
    }
  }
  
  console.log('\n📊 修复结果:');
  console.log(`✅ 修复文件: ${totalFiles}`);
  console.log(`🔧 总修复数: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n🚀 建议运行以下命令验证修复结果:');
    console.log('yarn type-check');
  } else {
    console.log('\n✨ 没有发现需要修复的字段名问题');
  }
}

main();
