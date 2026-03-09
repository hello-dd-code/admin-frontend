# 多小程序后台前端（admin-frontend）

## 启动开发

```bash
npm install
npm run dev
```

默认通过 Vite 代理把 `/api/*` 转发到 `http://localhost:8080`，请先启动 `wx_service`。

## 构建

```bash
npm run build
```

## 当前已完成

- 管理员登录（`/api/admin/login`）
- 管理员信息（`/api/admin/profile`）
- 数据看板（总览、小程序统计、用户增长）
- 小程序管理（列表、新增、编辑、删除）

## 待开发

- 用户管理
- 会员管理
- 保质期管理
- 系统设置
