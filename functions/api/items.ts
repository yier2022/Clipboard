interface Env {
  DB: any;
  AUTH_PASSWORD?: string;
}

const checkAuth = (request: Request, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  const serverPass = env.AUTH_PASSWORD || 'admin';
  return authHeader === serverPass;
};

export const onRequestGet = async (context: any) => {
  const { request, env } = context;

  if (!checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 解析分页参数
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  // 1. 获取总数
  const { results: countResult } = await env.DB.prepare(
    "SELECT COUNT(*) as total FROM items"
  ).all();
  const total = countResult[0]?.total || 0;

  // 2. 获取分页条目，按时间倒序
  const { results: items } = await env.DB.prepare(
    "SELECT * FROM items ORDER BY createdAt DESC LIMIT ? OFFSET ?"
  ).bind(limit, offset).all();

  // 3. 获取这些条目的文件元数据 (不含 content BLOB，为了性能)
  const itemIds = items.map((item: any) => item.id);
  let files: any[] = [];

  if (itemIds.length > 0) {
    const placeholders = itemIds.map(() => '?').join(',');
    const { results: fileResults } = await env.DB.prepare(
      `SELECT id, itemId, name, size, type, remark FROM files WHERE itemId IN (${placeholders})`
    ).bind(...itemIds).all();
    files = fileResults;
  }

  // 4. 组装数据
  const combinedItems = items.map((item: any) => {
    const itemFiles = files.filter((f: any) => f.itemId === item.id);
    return {
      ...item,
      texts: JSON.parse(item.texts || '[]'),
      files: itemFiles
    };
  });

  return new Response(JSON.stringify({
    items: combinedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  if (!checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();

    // 提取字段
    const title = formData.get('title') as string;
    const expiry = formData.get('expiry') as string;
    const visitLimit = formData.get('visitLimit') as string;
    const sharePassword = formData.get('sharePassword') as string;
    const textsStr = formData.get('texts') as string || '[]';
    const fileMetadataStr = formData.get('fileMetadata') as string || '[]';

    const itemId = Math.random().toString(36).substring(2, 9);
    const createdAt = Date.now();

    // 1. 插入 Item
    await env.DB.prepare(
      `INSERT INTO items (id, title, texts, createdAt, expiry, visitLimit, sharePassword) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(itemId, title, textsStr, createdAt, expiry, visitLimit, sharePassword).run();

    // 2. 处理并插入文件 (到 D1 BLOB)
    const fileMetadata = JSON.parse(fileMetadataStr);
    const processedFiles: any[] = [];

    for (const meta of fileMetadata) {
      const file = formData.get(`file_${meta.tempId}`) as File;
      if (file) {
        const fileId = Math.random().toString(36).substring(7);
        const arrayBuffer = await file.arrayBuffer(); // 转为二进制
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';

        await env.DB.prepare(
          `INSERT INTO files (id, itemId, name, size, type, remark, content, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(fileId, itemId, file.name, fileSize, fileType, meta.remark, arrayBuffer, Date.now()).run();

        processedFiles.push({
          id: fileId,
          name: file.name,
          size: fileSize,
          type: fileType,
          remark: meta.remark
        });
      }
    }

    const newItem = {
      id: itemId,
      title,
      texts: JSON.parse(textsStr),
      files: processedFiles,
      createdAt,
      expiry,
      visitLimit,
      sharePassword
    };

    return new Response(JSON.stringify({ success: true, item: newItem }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};