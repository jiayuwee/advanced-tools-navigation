#!/usr/bin/env node

/**
 * GitHub Secrets 更新工具
 * 用于验证和更新 GitHub Secrets 配置
 */

import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import { execSync } from 'child_process';

class GitHubSecretsUpdater {
  constructor() {
    this.owner = 'jiayuwee';
    this.repo = 'advanced-tools-navigation';
    
    // 从环境变量获取 GitHub token（如果有的话）
    this.githubToken = process.env.GITHUB_TOKEN;
    
    if (!this.githubToken) {
      console.log('⚠️ 未找到 GITHUB_TOKEN 环境变量');
      console.log('📋 请手动更新 GitHub Secrets:');
      this.showManualInstructions();
      return;
    }
    
    this.octokit = new Octokit({
      auth: this.githubToken,
    });
  }

  showManualInstructions() {
    console.log('\n🔧 手动更新 GitHub Secrets 步骤:');
    console.log('=====================================');
    console.log('1. 访问: https://github.com/jiayuwee/advanced-tools-navigation/settings/secrets/actions');
    console.log('2. 找到 VITE_SUPABASE_ANON_KEY');
    console.log('3. 点击 "Update" 按钮');
    console.log('4. 替换为以下值:');
    console.log('   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA');
    console.log('5. 点击 "Update secret"');
    console.log('\n✅ 更新完成后，网站应该可以正常加载');
  }

  async getPublicKey() {
    try {
      const { data } = await this.octokit.rest.actions.getRepoPublicKey({
        owner: this.owner,
        repo: this.repo,
      });
      return data;
    } catch (error) {
      console.error('❌ 获取公钥失败:', error.message);
      throw error;
    }
  }

  encryptSecret(secret, publicKey) {
    // 使用 libsodium 加密（这里简化处理）
    const messageBytes = Buffer.from(secret);
    const keyBytes = Buffer.from(publicKey, 'base64');
    
    // 注意：这里需要使用 libsodium 的 sealed box 加密
    // 由于环境限制，这里只是示例代码
    console.log('⚠️ 需要使用 libsodium 进行加密');
    return null;
  }

  async updateSecret(name, value) {
    try {
      const publicKey = await this.getPublicKey();
      const encryptedValue = this.encryptSecret(value, publicKey.key);
      
      if (!encryptedValue) {
        console.log('❌ 加密失败，请手动更新');
        return false;
      }

      await this.octokit.rest.actions.createOrUpdateRepoSecret({
        owner: this.owner,
        repo: this.repo,
        secret_name: name,
        encrypted_value: encryptedValue,
        key_id: publicKey.key_id,
      });

      console.log(`✅ 成功更新 ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ 更新 ${name} 失败:`, error.message);
      return false;
    }
  }

  async verifySecrets() {
    console.log('🔍 验证当前 GitHub Secrets...\n');
    
    try {
      const { data } = await this.octokit.rest.actions.listRepoSecrets({
        owner: this.owner,
        repo: this.repo,
      });

      console.log('📋 当前配置的 Secrets:');
      data.secrets.forEach(secret => {
        console.log(`   - ${secret.name} (更新时间: ${secret.updated_at})`);
      });

      const requiredSecrets = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'SUPABASE_ACCESS_TOKEN'
      ];

      const missingSecrets = requiredSecrets.filter(
        required => !data.secrets.find(secret => secret.name === required)
      );

      if (missingSecrets.length > 0) {
        console.log('\n❌ 缺少的 Secrets:');
        missingSecrets.forEach(secret => {
          console.log(`   - ${secret}`);
        });
      } else {
        console.log('\n✅ 所有必需的 Secrets 都已配置');
      }

      return data.secrets;
    } catch (error) {
      console.error('❌ 验证 Secrets 失败:', error.message);
      throw error;
    }
  }

  async triggerDeployment() {
    console.log('\n🚀 触发重新部署...');
    
    try {
      // 触发工作流
      await this.octokit.rest.actions.createWorkflowDispatch({
        owner: this.owner,
        repo: this.repo,
        workflow_id: 'deploy.yml',
        ref: 'main',
      });

      console.log('✅ 部署工作流已触发');
      console.log('🔗 查看状态: https://github.com/jiayuwee/advanced-tools-navigation/actions');
    } catch (error) {
      console.error('❌ 触发部署失败:', error.message);
      console.log('💡 请手动推送代码或触发工作流');
    }
  }

  async run() {
    console.log('🔧 GitHub Secrets 更新工具');
    console.log('=====================================\n');

    if (!this.githubToken) {
      return;
    }

    try {
      await this.verifySecrets();
      
      console.log('\n📝 建议的操作:');
      console.log('1. 手动更新 VITE_SUPABASE_ANON_KEY 为最新值');
      console.log('2. 触发重新部署');
      console.log('3. 验证网站功能');

      // 由于加密复杂性，建议手动更新
      this.showManualInstructions();
      
    } catch (error) {
      console.error('❌ 操作失败:', error.message);
      this.showManualInstructions();
    }
  }
}

// 运行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new GitHubSecretsUpdater();
  updater.run().catch(console.error);
}

export default GitHubSecretsUpdater;
