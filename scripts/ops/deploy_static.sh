#!/usr/bin/env bash
set -Eeuo pipefail

# 待发布的构建产物（tar.gz），由 CI 上传到服务器后传入
DEPLOY_TAR="${DEPLOY_TAR:-}"
# 静态站点目录（与 Nginx location /panel/ 对齐）
TARGET_DIR="${TARGET_DIR:-}"
# 发布标识（通常用 commit sha）
RELEASE_ID="${RELEASE_ID:-}"
# 文件归属用户/组
RUN_USER="${RUN_USER:-}"
RUN_GROUP="${RUN_GROUP:-}"
# 备份保留数量
KEEP_BACKUPS="${KEEP_BACKUPS:-}"
# 可选：发布后探活地址，例如 http://example.com/panel/
HEALTHCHECK_URL="${HEALTHCHECK_URL:-}"

BACKUP_ROOT="${BACKUP_ROOT:-$(dirname "$TARGET_DIR")/backups}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

require_env() {
  local name="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo "missing required env: $name" >&2
    exit 1
  fi
}

health_check() {
  if [ -z "$HEALTHCHECK_URL" ]; then
    return 0
  fi

  if ! command -v curl >/dev/null 2>&1; then
    log "curl 不存在，跳过 HEALTHCHECK_URL 检查"
    return 0
  fi

  local tries=15
  while [ "$tries" -gt 0 ]; do
    if curl -fsS --max-time 5 "$HEALTHCHECK_URL" >/dev/null; then
      return 0
    fi
    tries=$((tries - 1))
    sleep 2
  done

  return 1
}

require_env "DEPLOY_TAR" "$DEPLOY_TAR"
require_env "TARGET_DIR" "$TARGET_DIR"
require_env "RELEASE_ID" "$RELEASE_ID"
require_env "RUN_USER" "$RUN_USER"
require_env "RUN_GROUP" "$RUN_GROUP"
require_env "KEEP_BACKUPS" "$KEEP_BACKUPS"

if [ ! -f "$DEPLOY_TAR" ]; then
  echo "deploy tar not found: $DEPLOY_TAR" >&2
  exit 1
fi

tmp_dir="/tmp/admin-frontend-${RELEASE_ID:0:12}-$$"
backup_file=""

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

log "deploy start, release: ${RELEASE_ID}"
mkdir -p "$tmp_dir" "$TARGET_DIR" "$BACKUP_ROOT"

log "extracting artifact"
tar -xzf "$DEPLOY_TAR" -C "$tmp_dir"

if [ ! -f "$tmp_dir/index.html" ]; then
  echo "invalid artifact: index.html not found" >&2
  exit 1
fi

# 发布前备份当前站点，支持快速回滚
if [ -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
  backup_file="$BACKUP_ROOT/admin-frontend.${RELEASE_ID}.tar.gz"
  tar -czf "$backup_file" -C "$TARGET_DIR" .
  log "backup created: $backup_file"
fi

# 覆盖发布：先清空目录再写入新构建
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
tar -cf - -C "$tmp_dir" . | tar -xf - -C "$TARGET_DIR"
chown -R "$RUN_USER:$RUN_GROUP" "$TARGET_DIR" || true

if health_check; then
  if [ -n "$HEALTHCHECK_URL" ]; then
    log "health check success: $HEALTHCHECK_URL"
  fi
else
  log "health check failed, rolling back"
  if [ -n "$backup_file" ] && [ -f "$backup_file" ]; then
    find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    tar -xzf "$backup_file" -C "$TARGET_DIR"
    chown -R "$RUN_USER:$RUN_GROUP" "$TARGET_DIR" || true
    log "rollback done"
  fi
  exit 1
fi

# 清理上传到 /tmp 的临时制品
if [[ "$DEPLOY_TAR" == /tmp/* ]]; then
  rm -f "$DEPLOY_TAR"
fi

# 清理旧备份，仅保留最近 KEEP_BACKUPS 份
ls -1t "$BACKUP_ROOT"/admin-frontend.*.tar.gz 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f

log "deploy done"
