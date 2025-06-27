#!/usr/bin/env node

/**
 * SSL 状态检查脚本
 */

import https from "https";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class SSLChecker {
  constructor(domain) {
    this.domain = domain;
  }

  async checkHTTPAccess() {
    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: 80,
        path: "/",
        method: "GET",
        timeout: 5000,
      };

      const req = https.request(options, (res) => {
        console.log(`✅ HTTP 访问成功: ${res.statusCode}`);
        resolve(true);
      });

      req.on("error", (error) => {
        console.log(`❌ HTTP 访问失败: ${error.message}`);
        resolve(false);
      });

      req.on("timeout", () => {
        console.log(`❌ HTTP 访问超时`);
        resolve(false);
      });

      req.end();
    });
  }

  async checkSSLCertificate() {
    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: 443,
        path: "/",
        method: "GET",
        timeout: 5000,
        rejectUnauthorized: false, // 允许自签名证书用于检查
      };

      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        if (cert && cert.subject) {
          console.log(`✅ SSL 证书存在`);
          console.log(`   颁发给: ${cert.subject.CN}`);
          console.log(`   颁发者: ${cert.issuer.CN}`);
          console.log(`   有效期: ${cert.valid_from} 到 ${cert.valid_to}`);
          resolve(true);
        } else {
          console.log(`❌ 无法获取 SSL 证书信息`);
          resolve(false);
        }
      });

      req.on("error", (error) => {
        console.log(`❌ SSL 连接失败: ${error.message}`);
        resolve(false);
      });

      req.on("timeout", () => {
        console.log(`❌ SSL 连接超时`);
        resolve(false);
      });

      req.end();
    });
  }

  async checkDNSPropagation() {
    try {
      console.log(`\n🔍 检查 DNS 传播状态...`);
      const { stdout } = await execAsync(`nslookup ${this.domain}`);
      console.log(stdout);

      if (stdout.includes("75.2.60.5")) {
        console.log(`✅ DNS 已正确指向 Netlify`);
        return true;
      } else {
        console.log(`❌ DNS 还未完全传播`);
        return false;
      }
    } catch (error) {
      console.log(`❌ DNS 检查失败: ${error.message}`);
      return false;
    }
  }

  async checkNetlifyStatus() {
    return new Promise((resolve) => {
      const options = {
        hostname: "spiffy-torrone-5454e1.netlify.app",
        port: 443,
        path: "/",
        method: "GET",
        timeout: 5000,
      };

      const req = https.request(options, (res) => {
        console.log(`✅ Netlify 站点访问成功: ${res.statusCode}`);
        resolve(true);
      });

      req.on("error", (error) => {
        console.log(`❌ Netlify 站点访问失败: ${error.message}`);
        resolve(false);
      });

      req.end();
    });
  }

  async performFullCheck() {
    console.log(`🔍 开始检查 ${this.domain} 的 SSL 状态`);
    console.log("=" * 50);

    // 检查 Netlify 原始站点
    console.log("\n1. 检查 Netlify 原始站点...");
    await this.checkNetlifyStatus();

    // 检查 DNS 传播
    console.log("\n2. 检查 DNS 传播...");
    const dnsOK = await this.checkDNSPropagation();

    // 检查 HTTP 访问
    console.log("\n3. 检查 HTTP 访问...");
    const httpOK = await this.checkHTTPAccess();

    // 检查 SSL 证书
    console.log("\n4. 检查 SSL 证书...");
    const sslOK = await this.checkSSLCertificate();

    console.log("\n📋 检查结果:");
    console.log("=" * 20);
    console.log(`DNS 传播: ${dnsOK ? "✅" : "❌"}`);
    console.log(`HTTP 访问: ${httpOK ? "✅" : "❌"}`);
    console.log(`SSL 证书: ${sslOK ? "✅" : "❌"}`);

    if (!sslOK) {
      console.log("\n🔧 SSL 问题解决建议:");
      console.log('1. 在 Netlify 控制台点击 "Retry DNS verification"');
      console.log("2. 等待 10-30 分钟让证书自动颁发");
      console.log("3. 检查是否有 CAA 记录阻止 Let's Encrypt");
      console.log("4. 如果问题持续，可以尝试删除域名后重新添加");
    }

    return { dnsOK, httpOK, sslOK };
  }
}

// 主函数
async function main() {
  const domain = process.argv[2] || "ramusi.cn";

  const checker = new SSLChecker(domain);
  await checker.performFullCheck();
}

// 直接运行
main().catch(console.error);

export default SSLChecker;
