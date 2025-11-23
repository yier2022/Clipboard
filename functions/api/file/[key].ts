interface Env {
  DB: any;
  AUTH_PASSWORD?: string;
}

export const onRequestGet = async (context: any) => {
  const { request, env, params } = context;
  // 这里 key 对应的是 files 表里的 id
  const fileId = params.key as string;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  const serverPass = env.AUTH_PASSWORD || 'admin';
  
  // 简单的 Token 验证
  const authHeader = request.headers.get('Authorization');
  
  if (token !== serverPass && authHeader !== serverPass) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 从数据库读取文件内容
  const fileRecord = await env.DB.prepare(
    "SELECT content, name FROM files WHERE id = ?"
  ).bind(fileId).first();

  if (!fileRecord || !fileRecord.content) {
    return new Response('File Not Found', { status: 404 });
  }

  // D1 返回的 blob 是一个数组 (number[]) 或者 ArrayBuffer
  // 需要转换回 Uint8Array
  const data = new Uint8Array(fileRecord.content as ArrayBuffer);

  // 简单的 MIME 推断
  const name = fileRecord.name as string;
  let contentType = 'application/octet-stream';
  if (name.endsWith('.png')) contentType = 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) contentType = 'image/jpeg';
  if (name.endsWith('.txt')) contentType = 'text/plain';
  if (name.endsWith('.pdf')) contentType = 'application/pdf';

  return new Response(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`
    },
  });
};