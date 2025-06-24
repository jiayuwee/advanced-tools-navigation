#!/usr/bin/env node

/**
 * 列出所有 Netlify 站点的脚本
 */

import https from 'https'

class NetlifySiteLister {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'api.netlify.com';
        this.apiVersion = 'v1';
    }

    async makeRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.baseUrl,
                port: 443,
                path: `/api/${this.apiVersion}${path}`,
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Netlify-Site-Lister/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsedData = responseData ? JSON.parse(responseData) : {};
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(parsedData);
                        } else {
                            reject(new Error(`API 错误 ${res.statusCode}: ${parsedData.message || responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`解析响应失败: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`请求失败: ${error.message}`));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async getAllSites() {
        try {
            console.log('正在获取所有站点列表...\n');
            const sites = await this.makeRequest('GET', '/sites');
            return sites;
        } catch (error) {
            throw new Error(`获取站点列表失败: ${error.message}`);
        }
    }

    async listSites() {
        try {
            const sites = await this.getAllSites();
            
            console.log(`找到 ${sites.length} 个站点:\n`);
            console.log('序号 | 站点名称 | 站点ID | 自定义域名 | URL');
            console.log('-----|----------|--------|------------|----');
            
            sites.forEach((site, index) => {
                const name = site.name || '未命名';
                const id = site.id;
                const customDomain = site.custom_domain || '无';
                const url = site.url || site.ssl_url || '无';
                
                console.log(`${(index + 1).toString().padStart(4)} | ${name.padEnd(20)} | ${id} | ${customDomain.padEnd(15)} | ${url}`);
            });

            // 特别标出包含 "spiffy" 或 "torrone" 的站点
            console.log('\n🔍 可能的目标站点:');
            const possibleTargets = sites.filter(site => 
                site.name.includes('spiffy') || 
                site.name.includes('torrone') ||
                site.id.includes('spiffy') ||
                site.id.includes('torrone')
            );

            if (possibleTargets.length > 0) {
                possibleTargets.forEach(site => {
                    console.log(`✓ ${site.name} (${site.id}) - ${site.url || site.ssl_url}`);
                });
            } else {
                console.log('未找到包含 "spiffy" 或 "torrone" 的站点');
                console.log('请检查最新创建的站点或提供正确的站点 ID');
            }

            return sites;

        } catch (error) {
            console.error(`❌ 获取站点列表失败: ${error.message}`);
            throw error;
        }
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log(`
使用方法:
  node list-sites.js <ACCESS_TOKEN>

参数:
  ACCESS_TOKEN  - Netlify 个人访问令牌

示例:
  node list-sites.js nfp_xxx
        `);
        process.exit(1);
    }

    const [accessToken] = args;

    try {
        const lister = new NetlifySiteLister(accessToken);
        await lister.listSites();
        
    } catch (error) {
        console.error(`❌ 脚本执行失败: ${error.message}`);
        process.exit(1);
    }
}

// 直接运行主函数
main()

export default NetlifySiteLister;
