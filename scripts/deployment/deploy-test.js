import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../config/deployment/test.config.json'),
    'utf-8'
  )
);

async function deploy() {
  try {
    console.log('🚀 开始测试环境部署流程');
    
    // 1. 验证构建产物
    const distPath = path.join(__dirname, '../../dist');
    const publicPath = path.join(__dirname, '../../public');
    
    if (!fs.existsSync(distPath)) {
      throw new Error('构建产物不存在，请先执行npm run build');
    }
    if (fs.readdirSync(distPath).length === 0) {
      throw new Error('构建产物目录为空');
    }

    // 处理CNAME文件
    try {
      if (fs.existsSync(path.join(publicPath, 'CNAME'))) {
        fs.copyFileSync(
          path.join(publicPath, 'CNAME'),
          path.join(distPath, 'CNAME')
        );
      }
    } catch (copyError) {
      console.warn('⚠️ CNAME文件处理失败:', copyError.message);
    }

    // 2. 上传文件到测试服务器
    console.log('📤 上传文件到测试服务器...');
    try {
      // 网络诊断
      console.log('执行网络诊断...');
      try {
        console.log('1. 检查本地hosts文件');
        try {
          const hostsContent = fs.readFileSync('C:\\Windows\\System32\\drivers\\etc\\hosts', 'utf8');
          if (hostsContent.includes(config.serverHost)) {
            console.log('⚠️ 发现hosts文件自定义配置');
          }
        } catch (e) {
          console.log('无法读取hosts文件');
        }

        console.log('2. 测试DNS解析');
        try {
          execSync(`nslookup -timeout=5 ${config.serverHost}`, { stdio: 'inherit' });
        } catch (dnsError) {
          console.log('DNS解析失败:', dnsError.message);
          
          // 如果配置了IP地址，尝试直接连接
          if (config.serverIp) {
            console.log('尝试使用IP地址连接测试...');
            try {
              execSync(`ping -n 3 ${config.serverIp}`, { stdio: 'inherit' });
              console.log('✅ IP地址可连通，请修改配置使用IP地址');
            } catch (pingError) {
              console.log('❌ IP地址也无法连通');
            }
          }
          
          throw new Error(`无法解析主机名 ${config.serverHost}，请检查：
1. 网络连接是否正常（ping ${config.serverHost}）
2. DNS服务器配置是否正确（nslookup ${config.serverHost}）
3. 本地hosts文件是否有自定义配置
4. 服务器地址是否正确
5. 尝试使用IP地址代替主机名（如果知道服务器IP）`);
        }
      } catch (networkError) {
        throw new Error(`网络诊断失败: ${networkError.message}`);
      }

      // 尝试SCP连接
      console.log('尝试连接到服务器...');
      
      console.log('正在连接到:', `${config.deployUser}@${config.serverHost}:${config.deployPath}`);
      execSync(`scp -r -P ${config.sshPort} ${distPath}/* ${config.deployUser}@${config.serverHost}:${config.deployPath}`, {
        stdio: 'inherit'
      });
    } catch (scpError) {
      if (scpError.message.includes('Permission denied')) {
        throw new Error('SSH认证失败，请检查密钥配置');
      } else if (scpError.message.includes('No such file or directory')) {
        throw new Error('部署路径不存在，请检查服务器配置');
      } else if (scpError.message.includes('Could not resolve hostname')) {
        throw new Error('服务器地址解析失败，请检查网络连接和host配置');
      } else {
        throw new Error(`文件上传失败: ${scpError.message}`);
      }
    }

    // 3. 验证部署结果
    console.log('🔍 验证部署结果...');
    try {
      console.log('🔍 正在执行健康检查...');
      try {
        const healthCheckBuffer = execSync(
          `curl -I -s ${config.apiEndpoint}${config.healthCheckEndpoint || '/health'}`
        );
        
        const healthCheckResponse = healthCheckBuffer.toString('utf8');
        console.log('健康检查原始响应:', healthCheckResponse);
        
        if (!healthCheckResponse.includes('200 OK')) {
          console.log('健康检查失败响应:', healthCheckResponse);
          throw new Error('健康检查失败: 未收到200 OK响应');
        }
        
        console.log('✅ 健康检查通过');
      } catch (curlError) {
        throw new Error(`健康检查失败: ${curlError.message}`);
      }
    } catch (error) {
      throw new Error(`API验证失败: ${error.message}`);
    }

    console.log('✅ 测试环境部署成功');
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    console.log('建议解决方案:');
    if (error.message.includes('SSH认证失败')) {
      console.log('- 检查SSH密钥配置');
      console.log('- 验证服务器公钥指纹');
    } else if (error.message.includes('部署路径不存在')) {
      console.log('- 联系运维创建部署目录');
      console.log(`- 确保用户 ${config.deployUser} 有写入权限`);
    }
    process.exit(1);
  }
}

deploy();