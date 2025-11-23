interface Env {
    DB: any;
    AUTH_PASSWORD?: string;
}

export const onRequestGet = async (context: any) => {
    const { params, env } = context;
    const fileId = params.id;

    if (!fileId) {
        return new Response('File ID is required', { status: 400 });
    }

    try {
        // 查询文件数据
        const { results } = await env.DB.prepare(
            "SELECT content, type, name FROM files WHERE id = ?"
        ).bind(fileId).all();

        if (!results || results.length === 0) {
            return new Response('File not found', { status: 404 });
        }

        const file = results[0];

        // 返回文件内容
        return new Response(file.content, {
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${file.name}"`,
                'Cache-Control': 'public, max-age=31536000' // 缓存1年
            }
        });

    } catch (err: any) {
        console.error('Error fetching file:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
