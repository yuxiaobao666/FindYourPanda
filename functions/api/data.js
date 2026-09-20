// functions/api/data.js
// 熊猫档案云端 API - Pages Functions 版
// 前端通过同域路径 /api/data 访问，不需要跨域配置

export async function onRequestGet(context) {
  const data = await context.env.PANDA_KV.get('pandas', 'json');
  return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const token = context.request.headers.get('X-Write-Token') || '';
  if (!context.env.WRITE_TOKEN || token !== context.env.WRITE_TOKEN) {
    return new Response(JSON.stringify({ error: '未授权：编辑密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const body = await context.request.text();
  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) {
      return new Response(JSON.stringify({ error: '数据格式错误：需要 JSON 数组' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'JSON 解析失败: ' + e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  await context.env.PANDA_KV.put('pandas', body);
  return new Response(JSON.stringify({ ok: true, count: JSON.parse(body).length, ts: Date.now() }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Write-Token',
    },
  });
}
