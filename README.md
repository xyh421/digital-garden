# 老徐的数字花园 🌱

工作、技术、生活，以及值得记录的事情。

- 官网： https://laoxu89.com （需完成 GitHub Pages 与 DNS 设置）
- 备用预览： https://xyh421.github.io/digital-garden/ （仅在 Pages 发布后可访问，且自定义域名启用后可能跳转）
- 技术：原生 HTML/CSS/JavaScript，无服务器、无构建工具
- 特色：响应式、玻璃拟态、深色模式、站内笔记搜索

## 部署

1. 仓库 Settings → Pages → Build and deployment → Source → Deploy from a branch。
2. Branch 选择 main / (root)，保存。
3. Cloudflare 添加根域名 @ 的 CNAME 记录，目标为 xyh421.github.io。代理状态初期设置为 DNS only。
4. GitHub Settings → Pages → Custom domain 填 laoxu89.com，并等待 DNS 检查完成。
5. DNS 验证成功后勾选 Enforce HTTPS。

注意：CNAME 文件已包含 laoxu89.com，但这不等于 DNS 或 Pages 设置已完成。

## 更新内容

文章在 `notes/` 中，首页 `index.html` 的 `notes` 数组负责文章索引。新增文章时，复制现有 HTML 页面并添加索引。现在是轻量版，后续可以增加 Markdown 自动生成。

公开仓库请避免上传内部客户资料、内部 IP、访问令牌或未公开的源码。
