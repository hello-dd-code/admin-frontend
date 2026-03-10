# 生产部署（GitHub Actions，前端静态站点）

本文档用于 `admin-frontend` 的自动化构建发布：
- 触发：`main` 分支 push 或手动触发
- 流程：GitHub Actions 构建 `dist` -> 通过 SSH 上传到服务器 -> 远程脚本覆盖发布
- 特点：参考 `wx_service` 部署流程，全部参数由 GitHub Secrets 驱动

## 0. 与 wx_service 对齐

- 使用同一台服务器：`115.159.198.14`
- SSH 用户：`root`
- 可复用 `wx_service` 的 SSH 密钥体系
- 不使用脚本内默认服务器参数，统一由仓库 Secrets 注入

## 1. Nginx 路径约定（当前配置）

```nginx
location ^~ /panel/ {
    root /www/wwwroot/wx_service/web/admin-frontend;
    index index.html;
    try_files $uri $uri/ /panel/index.html;
}
```

对应发布目录：
- `/www/wwwroot/wx_service/web/admin-frontend/panel`

## 2. 必填 GitHub Secrets

在 `admin-frontend` 仓库 `Settings -> Secrets and variables -> Actions` 配置：

- `PROD_SSH_KEY`：私钥内容（`~/.ssh/id_ed25519`）
- `PROD_HOST`：`115.159.198.14`
- `PROD_PORT`：`22`
- `PROD_USER`：`root`
- `ADMIN_WEB_ROOT`：`/www/wwwroot/wx_service/web/admin-frontend/panel`
- `ADMIN_WEB_USER`：`www`
- `ADMIN_WEB_GROUP`：`www`
- `ADMIN_KEEP_BACKUPS`：`5`

可选：
- `ADMIN_HEALTHCHECK_URL`：例如 `http://115.159.198.14/panel/`

## 3. 密钥说明

`~/.ssh/id_ed25519.pub` 是公钥，用于写入服务器 `~/.ssh/authorized_keys`。

GitHub Actions 里的 `PROD_SSH_KEY` 必须填写私钥：
- `~/.ssh/id_ed25519`

## 4. 工作流文件

- `/.github/workflows/deploy-prod.yml`

每次主分支变更会自动：
1. `npm ci`
2. `npm run build`（生产基路径 `/panel/`）
3. 上传构建包到服务器 `/tmp`
4. 调用 `scripts/ops/deploy_static.sh` 覆盖发布

## 5. 回滚

在服务器执行：

```bash
ls -lt /www/wwwroot/wx_service/web/admin-frontend/backups/admin-frontend.*.tar.gz

TARGET_DIR=/www/wwwroot/wx_service/web/admin-frontend/panel
BACKUP_FILE=/www/wwwroot/wx_service/web/admin-frontend/backups/admin-frontend.<backup_id>.tar.gz

find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
tar -xzf "$BACKUP_FILE" -C "$TARGET_DIR"
chown -R www:www "$TARGET_DIR"
```
