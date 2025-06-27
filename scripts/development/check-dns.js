#!/usr/bin/env node

/**
 * DNS 检查脚本 - 检查域名的 DNS 配置是否正确指向 Netlify
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class DNSChecker {
  constructor(domain) {
    this.domain = domain;
    this.netlifyIP = "75.2.60.5";
  }

  async checkARecord() {
    try {
      console.log(`🔍 检查 A 记录: ${this.domain}`);
      const { stdout } = await execAsync(`nslookup -type=A ${this.domain}`);
      console.log(stdout);

      if (stdout.includes(this.netlifyIP)) {
        console.log(`✅ A 记录正确指向 Netlify IP: ${this.netlifyIP}`);
        return true;
      } else {
        console.log(`❌ A 记录未正确指向 Netlify IP: ${this.netlifyIP}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 检查 A 记录失败: ${error.message}`);
      return false;
    }
  }

  async checkCNAME() {
    try {
      const wwwDomain = `www.${this.domain}`;
      console.log(`\n🔍 检查 CNAME 记录: ${wwwDomain}`);
      const { stdout } = await execAsync(`nslookup -type=CNAME ${wwwDomain}`);
      console.log(stdout);

      if (stdout.includes(".netlify.app")) {
        console.log(`✅ CNAME 记录正确指向 Netlify`);
        return true;
      } else {
        console.log(`❌ CNAME 记录未正确指向 Netlify`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 检查 CNAME 记录失败: ${error.message}`);
      return false;
    }
  }

  async checkNameServers() {
    try {
      console.log(`\n🔍 检查域名服务器: ${this.domain}`);
      const { stdout } = await execAsync(`nslookup -type=NS ${this.domain}`);
      console.log(stdout);

      if (stdout.includes("dns1.p01.nsone.net") || stdout.includes("netlify")) {
        console.log(`✅ 使用 Netlify DNS`);
        return "netlify";
      } else {
        console.log(`ℹ️ 使用外部 DNS 提供商`);
        return "external";
      }
    } catch (error) {
      console.log(`❌ 检查域名服务器失败: ${error.message}`);
      return "unknown";
    }
  }

  async checkCAA() {
    try {
      console.log(`\n🔍 检查 CAA 记录: ${this.domain}`);
      const { stdout } = await execAsync(`nslookup -type=CAA ${this.domain}`);
      console.log(stdout);

      if (stdout.includes("letsencrypt.org")) {
        console.log(`✅ CAA 记录允许 Let's Encrypt`);
        return true;
      } else if (stdout.includes("No answer")) {
        console.log(`✅ 没有 CAA 记录限制`);
        return true;
      } else {
        console.log(`⚠️ 可能存在 CAA 记录限制`);
        return false;
      }
    } catch (error) {
      console.log(`ℹ️ CAA 记录检查: ${error.message}`);
      return true;
    }
  }

  async performFullCheck() {
    console.log(`🌐 开始检查域名: ${this.domain}`);
    console.log("=" * 50);

    // 检查域名服务器类型
    const dnsType = await this.checkNameServers();

    // 检查 A 记录
    const aRecordOK = await this.checkARecord();

    // 检查 CNAME 记录
    const cnameOK = await this.checkCNAME();

    // 检查 CAA 记录
    const caaOK = await this.checkCAA();

    console.log("\n📋 检查结果总结:");
    console.log("=" * 30);
    console.log(`DNS 类型: ${dnsType}`);
    console.log(`A 记录: ${aRecordOK ? "✅ 正确" : "❌ 需要修复"}`);
    console.log(`CNAME 记录: ${cnameOK ? "✅ 正确" : "❌ 需要修复"}`);
    console.log(`CAA 记录: ${caaOK ? "✅ 正确" : "⚠️ 需要检查"}`);

    // 提供修复建议
    this.provideFixes(dnsType, aRecordOK, cnameOK, caaOK);

    return {
      dnsType,
      aRecordOK,
      cnameOK,
      caaOK,
    };
  }

  provideFixes(dnsType, aRecordOK, cnameOK, caaOK) {
    console.log("\n🔧 修复建议:");
    console.log("=" * 20);

    if (dnsType === "netlify") {
      console.log("✅ 您正在使用 Netlify DNS，配置应该是自动的");
      if (!aRecordOK || !cnameOK) {
        console.log("⚠️ 如果记录不正确，请在 Netlify 控制台检查 DNS 设置");
      }
    } else {
      console.log("ℹ️ 您正在使用外部 DNS，需要手动配置:");

      if (!aRecordOK) {
        console.log(`❌ 需要添加 A 记录:`);
        console.log(`   主机名: @ 或 ${this.domain}`);
        console.log(`   值: ${this.netlifyIP}`);
      }

      if (!cnameOK) {
        console.log(`❌ 需要添加 CNAME 记录:`);
        console.log(`   主机名: www`);
        console.log(`   值: spiffy-torrone-5454e1.netlify.app`);
      }
    }

    if (!caaOK) {
      console.log("⚠️ CAA 记录可能阻止 SSL 证书颁发");
      console.log("   请确保 CAA 记录包含 letsencrypt.org 或删除 CAA 记录");
    }

    console.log("\n🌐 在线检查工具:");
    console.log(`- DNS 传播检查: https://dnschecker.org/#A/${this.domain}`);
    console.log(`- Let's Encrypt 调试: https://letsdebug.net/${this.domain}`);
    console.log(`- CAA 记录检查: https://dnschecker.org/#CAA/${this.domain}`);
  }
}

// 主函数
async function main() {
  const domain = process.argv[2] || "ramusi.cn";

  console.log("🔍 Netlify DNS 检查工具");
  console.log("=" * 30);

  const checker = new DNSChecker(domain);
  await checker.performFullCheck();

  console.log("\n💡 提示:");
  console.log("- DNS 更改可能需要 24-48 小时才能完全传播");
  console.log("- SSL 证书通常在 DNS 正确配置后几分钟内颁发");
  console.log("- 如果问题持续，请联系您的域名注册商或 DNS 提供商");
}

// 直接运行主函数
main().catch(console.error);

export default DNSChecker;
