// functions/api/data.js
// 熊猫档案云端 API

export async function onRequestGet(context) {
  try {
    const kv = context.env.PANDA_KV;
    if (!kv) {
      return new Response(JSON.stringify({ error: 'PANDA_KV 未绑定', keys: Object.keys(context.env) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
    const data = await kv.get('pandas', 'json');
    return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const token = context.request.headers.get('X-Write-Token') || '';
    if (!context.env.WRITE_TOKEN || token !== context.env.WRITE_TOKEN) {
      return new Response(JSON.stringify({ error: '未授权：编辑密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const body = await context.request.text();
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) {
      return new Response(JSON.stringify({ error: '需要 JSON 数组' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const kv = context.env.PANDA_KV;
    if (!kv) {
      return new Response(JSON.stringify({ error: 'PANDA_KV 未绑定', keys: Object.keys(context.env) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
    await kv.put('pandas', body);
    return new Response(JSON.stringify({ ok: true, count: parsed.length, ts: Date.now() }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
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
