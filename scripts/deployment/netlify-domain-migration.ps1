# Netlify 域名迁移 PowerShell 脚本
# 用于在 Netlify 站点之间迁移自定义域名

param(
    [Parameter(Mandatory=$true)]
    [string]$AccessToken,
    
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$true)]
    [string]$TargetSiteId
)

# 设置 API 基础信息
$BaseUrl = "https://api.netlify.com/api/v1"
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type" = "application/json"
    "User-Agent" = "Netlify-Domain-Migrator-PS/1.0"
}

# 函数：发送 API 请求
function Invoke-NetlifyAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $Uri = "$BaseUrl$Endpoint"
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Error "API 错误 $statusCode : $errorMessage"
        } else {
            Write-Error "请求失败: $errorMessage"
        }
        throw
    }
}

# 函数：获取站点信息
function Get-NetlifySite {
    param([string]$SiteId)
    
    Write-Host "正在获取站点信息: $SiteId" -ForegroundColor Yellow
    return Invoke-NetlifyAPI -Method "GET" -Endpoint "/sites/$SiteId"
}

# 函数：获取所有站点
function Get-AllNetlifySites {
    Write-Host "正在获取所有站点列表..." -ForegroundColor Yellow
    return Invoke-NetlifyAPI -Method "GET" -Endpoint "/sites"
}

# 函数：查找使用特定域名的站点
function Find-SiteByDomain {
    param([string]$Domain)
    
    $sites = Get-AllNetlifySites
    $site = $sites | Where-Object { 
        $_.custom_domain -eq $Domain -or 
        ($_.domain_aliases -and $_.domain_aliases -contains $Domain)
    }
    
    return $site
}

# 函数：更新站点域名
function Update-SiteDomain {
    param(
        [string]$SiteId,
        [string]$CustomDomain,
        [array]$DomainAliases = @()
    )
    
    Write-Host "正在更新站点 $SiteId 的域名设置..." -ForegroundColor Yellow
    
    $updateData = @{
        custom_domain = $CustomDomain
        domain_aliases = $DomainAliases
    }
    
    return Invoke-NetlifyAPI -Method "PATCH" -Endpoint "/sites/$SiteId" -Body $updateData
}

# 函数：从站点移除域名
function Remove-DomainFromSite {
    param([string]$SiteId)
    
    Write-Host "正在从站点 $SiteId 移除自定义域名..." -ForegroundColor Yellow
    
    $updateData = @{
        custom_domain = $null
        domain_aliases = @()
    }
    
    return Invoke-NetlifyAPI -Method "PATCH" -Endpoint "/sites/$SiteId" -Body $updateData
}

# 主要迁移函数
function Start-DomainMigration {
    param(
        [string]$Domain,
        [string]$TargetSiteId
    )
    
    try {
        Write-Host "`n开始迁移域名 $Domain" -ForegroundColor Green
        Write-Host "目标站点: $TargetSiteId" -ForegroundColor Green
        
        # 1. 查找当前使用该域名的站点
        Write-Host "`n步骤 1: 查找使用域名 $Domain 的站点..." -ForegroundColor Cyan
        $fromSite = Find-SiteByDomain -Domain $Domain
        
        if (-not $fromSite) {
            throw "未找到使用域名 $Domain 的站点"
        }
        
        Write-Host "✓ 找到源站点: $($fromSite.name) ($($fromSite.id))" -ForegroundColor Green
        
        # 2. 验证目标站点
        Write-Host "`n步骤 2: 验证目标站点..." -ForegroundColor Cyan
        $toSite = Get-NetlifySite -SiteId $TargetSiteId
        Write-Host "✓ 目标站点确认: $($toSite.name) ($($toSite.url))" -ForegroundColor Green
        
        # 3. 检查域名是否在源站点
        if ($fromSite.custom_domain -ne $Domain -and 
            (-not $fromSite.domain_aliases -or $fromSite.domain_aliases -notcontains $Domain)) {
            throw "域名 $Domain 不在源站点 $($fromSite.id) 中"
        }
        
        # 4. 从源站点移除域名
        Write-Host "`n步骤 3: 从源站点移除域名..." -ForegroundColor Cyan
        Remove-DomainFromSite -SiteId $fromSite.id
        Write-Host "✓ 域名已从源站点移除" -ForegroundColor Green
        
        # 5. 等待确保更改生效
        Write-Host "等待 3 秒确保更改生效..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # 6. 添加域名到目标站点
        Write-Host "`n步骤 4: 添加域名到目标站点..." -ForegroundColor Cyan
        Update-SiteDomain -SiteId $TargetSiteId -CustomDomain $Domain
        Write-Host "✓ 域名已添加到目标站点" -ForegroundColor Green
        
        Write-Host "`n🎉 域名迁移完成！" -ForegroundColor Green
        Write-Host "域名 $Domain 已成功从 $($fromSite.name) 迁移到 $($toSite.name)" -ForegroundColor Green
        
        Write-Host "`n后续步骤:" -ForegroundColor Yellow
        Write-Host "1. 访问 https://$Domain 确认指向新站点" -ForegroundColor White
        Write-Host "2. 检查 SSL 证书状态（可能需要几分钟重新颁发）" -ForegroundColor White
        Write-Host "3. 在 Netlify 控制台确认域名设置正确" -ForegroundColor White
        
        return @{
            success = $true
            domain = $Domain
            fromSite = $fromSite.name
            toSite = $toSite.name
        }
        
    }
    catch {
        Write-Host "`n❌ 迁移失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n故障排除建议:" -ForegroundColor Yellow
        Write-Host "1. 检查访问令牌是否正确且未过期" -ForegroundColor White
        Write-Host "2. 确认站点 ID 拼写正确" -ForegroundColor White
        Write-Host "3. 验证您有权限访问相关站点" -ForegroundColor White
        Write-Host "4. 检查网络连接" -ForegroundColor White
        throw
    }
}

# 主程序入口
try {
    Write-Host "Netlify 域名迁移工具" -ForegroundColor Magenta
    Write-Host "===================" -ForegroundColor Magenta
    
    # 验证参数
    if (-not $AccessToken -or -not $Domain -or -not $TargetSiteId) {
        Write-Host "错误：缺少必需参数" -ForegroundColor Red
        Write-Host "`n使用方法:" -ForegroundColor Yellow
        Write-Host ".\netlify-domain-migration.ps1 -AccessToken <令牌> -Domain <域名> -TargetSiteId <目标站点ID>" -ForegroundColor White
        Write-Host "`n示例:" -ForegroundColor Yellow
        Write-Host ".\netlify-domain-migration.ps1 -AccessToken 'nfp_xxx' -Domain 'ramusi.cn' -TargetSiteId 'spiffy-torrone-5454e1'" -ForegroundColor White
        exit 1
    }
    
    # 执行迁移
    $result = Start-DomainMigration -Domain $Domain -TargetSiteId $TargetSiteId
    
    Write-Host "`n✅ 迁移成功完成！" -ForegroundColor Green
    
}
catch {
    Write-Host "`n❌ 脚本执行失败" -ForegroundColor Red
    exit 1
}
