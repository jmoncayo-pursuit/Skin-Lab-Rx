import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.PERFECT_CORP_API_KEY!;
const API_BASE = 'https://yce-api-01.perfectcorp.com';

// Rate limiter: max 2 requests per 60 seconds per IP (makeup transfer uses more units)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 2;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

async function uploadFile(imageBuffer: Buffer, contentType: string, fileName: string) {
  const fileRes = await fetch(`${API_BASE}/s2s/v2.0/file/makeup-vto`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: [{
        content_type: contentType,
        file_name: fileName,
        file_size: imageBuffer.length,
      }],
    }),
  });

  if (!fileRes.ok) {
    const err = await fileRes.text();
    throw new Error(`File API failed: ${fileRes.status} - ${err}`);
  }

  const fileData = await fileRes.json();
  const fileInfo = fileData.data.files[0];
  const uploadReq = fileInfo.requests[0];

  const uploadHeaders: Record<string, string> = {};
  if (uploadReq.headers) {
    Object.entries(uploadReq.headers).forEach(([k, v]) => {
      uploadHeaders[k] = v as string;
    });
  }

  const uploadRes = await fetch(uploadReq.url, {
    method: uploadReq.method,
    headers: uploadHeaders,
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status}`);
  }

  return fileInfo.file_id;
}

async function pollTask(taskId: string): Promise<Record<string, unknown>> {
  const maxAttempts = 30;
  let interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    interval = Math.min(interval + 500, 5000);

    const res = await fetch(
      `${API_BASE}/s2s/v2.0/task/makeup-vto/${encodeURIComponent(taskId)}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!res.ok) continue;

    const data = await res.json();
    if (data.data?.task_status === 'success') {
      return data.data;
    }
    if (data.data?.task_status === 'error') {
      throw new Error(`Task failed: ${JSON.stringify(data.data)}`);
    }
  }

  throw new Error('Task polling timed out');
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const targetFile = formData.get('target') as File;
    const effectsStr = formData.get('effects') as string;

    if (!targetFile || !effectsStr) {
      return NextResponse.json({ error: 'Target image and effects are required' }, { status: 400 });
    }

    const effects = JSON.parse(effectsStr);
    const targetBuffer = Buffer.from(await targetFile.arrayBuffer());

    // Upload the file
    const targetFileId = await uploadFile(targetBuffer, targetFile.type || 'image/jpeg', targetFile.name || 'target.jpg');

    // Create makeup-vto task
    const taskRes = await fetch(`${API_BASE}/s2s/v2.0/task/makeup-vto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src_file_url: null, // we use src_file_id instead
        src_file_id: targetFileId,
        effects: effects,
        version: "1.0"
      }),
    });

    if (!taskRes.ok) {
      const err = await taskRes.text();
      return NextResponse.json({ error: `Task creation failed: ${err}` }, { status: 500 });
    }

    const taskData = await taskRes.json();
    const taskId = taskData.data.task_id;

    const results = await pollTask(taskId);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Makeup transfer error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Try-on failed' },
      { status: 500 }
    );
  }
}
