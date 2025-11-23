interface Env {
  AUTH_PASSWORD?: string;
}

export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { password: string };
    
    // 检查环境变量是否配置
    if (!env.AUTH_PASSWORD) {
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: AUTH_PASSWORD not set' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (body.password === env.AUTH_PASSWORD) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
  }
}