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
  const { env } = context;
  
  try {
    const { results } = await env.DB.prepare("SELECT * FROM settings").all();
    
    // 转换为对象
    const settings: any = {
      appTitle: 'Clipboard',
      subTitle: 'Cloud Share'
    };

    if (results) {
      results.forEach((row: any) => {
        settings[row.key] = row.value;
      });
    }

    return new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // 首次运行时表可能不存在，返回默认
    return new Response(JSON.stringify({
      appTitle: 'Clipboard',
      subTitle: 'Cloud Share'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  if (!checkAuth(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { appTitle, subTitle } = body;

    if (!appTitle) {
        return new Response('Title required', { status: 400 });
    }

    // 更新或插入设置
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES ('appTitle', ?), ('subTitle', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    ).bind(appTitle, subTitle).run();

    return new Response(JSON.stringify({ success: true, settings: { appTitle, subTitle } }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
     return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};