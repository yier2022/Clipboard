-- 云剪切板数据库Schema
-- 用于Cloudflare D1

-- 剪贴板条目表
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  texts TEXT,  -- JSON字符串数组
  createdAt INTEGER NOT NULL,
  expiry TEXT,
  visitLimit TEXT,
  sharePassword TEXT
);

-- 文件存储表
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT,
  type TEXT,  -- 'image' 或 'file'
  remark TEXT,
  content BLOB,  -- 文件二进制内容
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
);

-- 应用设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_items_createdAt ON items(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_files_itemId ON files(itemId);