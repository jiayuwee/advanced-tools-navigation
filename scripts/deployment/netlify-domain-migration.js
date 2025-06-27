#!/usr/bin/env node

/**
 * Netlify 域名迁移脚本
 * 用于在 Netlify 站点之间迁移自定义域名
 */

import https from "https";

class NetlifyDomainMigrator {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = "api.netlify.com";
    this.apiVersion = "v1";
  }

  /**
   * 发送 HTTP 请求到 Netlify API
   */
  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/api/${this.apiVersion}${path}`,
        method: method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Netlify-Domain-Migrator/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject(
                new Error(
                  `API 错误 ${res.statusCode}: ${parsedData.message || responseData}`,
                ),
              );
            }
          } catch (error) {
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`请求失败: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * 获取站点信息
   */
  async getSite(siteId) {
    try {
      console.log(`正在获取站点信息: ${siteId}`);
      const site = await this.makeRequest("GET", `/sites/${siteId}`);
      return site;
    } catch (error) {
      throw new Error(`获取站点信息失败: ${error.message}`);
    }
  }

  /**
   * 获取所有站点列表
   */
  async getAllSites() {
    try {
      console.log("正在获取所有站点列表...");
      const sites = await this.makeRequest("GET", "/sites");
      return sites;
    } catch (error) {
      throw new Error(`获取站点列表失败: ${error.message}`);
    }
  }

  /**
   * 查找使用特定域名的站点
   */
  async findSiteByDomain(domain) {
    try {
      const sites = await this.getAllSites();
      const site = sites.find(
        (s) =>
          s.custom_domain === domain ||
          (s.domain_aliases && s.domain_aliases.includes(domain)),
      );
      return site;
    } catch (error) {
      throw new Error(`查找域名站点失败: ${error.message}`);
    }
  }

  /**
   * 更新站点的自定义域名
   */
  async updateSiteDomain(siteId, customDomain, domainAliases = []) {
    try {
      console.log(`正在更新站点 ${siteId} 的域名设置...`);
      const updateData = {
        custom_domain: customDomain,
        domain_aliases: domainAliases,
      };

      const updatedSite = await this.makeRequest(
        "PATCH",
        `/sites/${siteId}`,
        updateData,
      );
      return updatedSite;
    } catch (error) {
      throw new Error(`更新站点域名失败: ${error.message}`);
    }
  }

  /**
   * 从站点移除自定义域名
   */
  async removeDomainFromSite(siteId) {
    try {
      console.log(`正在从站点 ${siteId} 移除自定义域名...`);
      const updateData = {
        custom_domain: null,
        domain_aliases: [],
      };

      const updatedSite = await this.makeRequest(
        "PATCH",
        `/sites/${siteId}`,
        updateData,
      );
      return updatedSite;
    } catch (error) {
      throw new Error(`移除域名失败: ${error.message}`);
    }
  }

  /**
   * 迁移域名从一个站点到另一个站点
   */
  async migrateDomain(domain, fromSiteId, toSiteId) {
    try {
      console.log(`\n开始迁移域名 ${domain}`);
      console.log(`从站点: ${fromSiteId}`);
      console.log(`到站点: ${toSiteId}`);

      // 1. 验证源站点
      const fromSite = await this.getSite(fromSiteId);
      console.log(`✓ 源站点确认: ${fromSite.name} (${fromSite.url})`);

      // 2. 验证目标站点
      const toSite = await this.getSite(toSiteId);
      console.log(`✓ 目标站点确认: ${toSite.name} (${toSite.url})`);

      // 3. 检查域名是否在源站点
      if (
        fromSite.custom_domain !== domain &&
        (!fromSite.domain_aliases || !fromSite.domain_aliases.includes(domain))
      ) {
        throw new Error(`域名 ${domain} 不在源站点 ${fromSiteId} 中`);
      }

      // 4. 从源站点移除域名
      console.log("\n步骤 1: 从源站点移除域名...");
      await this.removeDomainFromSite(fromSiteId);
      console.log("✓ 域名已从源站点移除");

      // 5. 等待一小段时间确保更改生效
      console.log("等待 2 秒确保更改生效...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 6. 添加域名到目标站点
      console.log("\n步骤 2: 添加域名到目标站点...");
      await this.updateSiteDomain(toSiteId, domain);
      console.log("✓ 域名已添加到目标站点");

      console.log(`\n🎉 域名迁移完成！`);
      console.log(
        `域名 ${domain} 已成功从 ${fromSite.name} 迁移到 ${toSite.name}`,
      );

      return {
        success: true,
        domain: domain,
        fromSite: fromSite.name,
        toSite: toSite.name,
      };
    } catch (error) {
      console.error(`\n❌ 迁移失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 自动查找并迁移域名
   */
  async autoMigrateDomain(domain, toSiteId) {
    try {
      console.log(`\n自动查找使用域名 ${domain} 的站点...`);

      // 查找当前使用该域名的站点
      const fromSite = await this.findSiteByDomain(domain);

      if (!fromSite) {
        throw new Error(`未找到使用域名 ${domain} 的站点`);
      }

      console.log(`✓ 找到源站点: ${fromSite.name} (${fromSite.id})`);

      // 执行迁移
      return await this.migrateDomain(domain, fromSite.id, toSiteId);
    } catch (error) {
      console.error(`\n❌ 自动迁移失败: ${error.message}`);
      throw error;
    }
  }
}

// 使用示例和命令行接口
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
使用方法:
  node netlify-domain-migration.js <ACCESS_TOKEN> <DOMAIN> <TARGET_SITE_ID>

参数:
  ACCESS_TOKEN  - Netlify 个人访问令牌
  DOMAIN        - 要迁移的域名 (例如: ramusi.cn)
  TARGET_SITE_ID - 目标站点 ID (例如: spiffy-torrone-5454e1)

示例:
  node netlify-domain-migration.js nfp_xxx ramusi.cn spiffy-torrone-5454e1
        `);
    process.exit(1);
  }

  const [accessToken, domain, targetSiteId] = args;

  try {
    const migrator = new NetlifyDomainMigrator(accessToken);
    await migrator.autoMigrateDomain(domain, targetSiteId);

    console.log("\n✅ 迁移完成！请检查您的站点设置确认域名已正确配置。");
  } catch (error) {
    console.error(`\n❌ 迁移失败: ${error.message}`);
    process.exit(1);
  }
}

// 直接运行主函数
main();

export default NetlifyDomainMigrator;
