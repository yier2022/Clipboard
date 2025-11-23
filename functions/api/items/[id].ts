interface Env {
  DB: any;
  AUTH_PASSWORD?: string;
}

export const onRequestDelete = async (context: any) => {
  const { request, env, params } = context;
  const id = params.id as string;

  const authHeader = request.headers.get('Authorization');
  const serverPass = env.AUTH_PASSWORD || 'admin';
  if (authHeader !== serverPass) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // D1 不支持外键级联删除的话，需要手动删两张表
    // 先删文件
    await env.DB.prepare("DELETE FROM files WHERE itemId = ?").bind(id).run();
    // 再删条目
    const { success } = await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(id).run();

    if (!success) {
      return new Response('Failed to delete', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};