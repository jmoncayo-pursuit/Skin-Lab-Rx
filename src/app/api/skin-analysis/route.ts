import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.PERFECT_CORP_API_KEY!;
const API_BASE = 'https://yce-api-01.perfectcorp.com';

// Simple in-memory rate limiter: max 3 requests per 60 seconds per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

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
  const fileRes = await fetch(`${API_BASE}/s2s/v2.0/file/skin-analysis`, {
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
  // Start with 2s interval, back off to avoid hammering the API
  let interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    // Gradually increase poll interval (max 5s) to be rate-friendly
    interval = Math.min(interval + 500, 5000);

    const res = await fetch(
      `${API_BASE}/s2s/v2.0/task/skin-analysis/${encodeURIComponent(taskId)}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
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
    // Rate limit check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'image/jpeg';
    const fileName = file.name || 'selfie.jpg';

    // Upload the file
    const fileId = await uploadFile(buffer, contentType, fileName);

    // Create skin analysis task with SD concerns (conservative set to save units)
    const taskRes = await fetch(`${API_BASE}/s2s/v2.0/task/skin-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src_file_id: fileId,
        dst_actions: [
          'wrinkle', 'pore', 'texture', 'acne',
          'moisture', 'oiliness', 'redness', 'firmness',
          'dark_circle_v2', 'age_spot', 'radiance', 'eye_bag',
        ],
        miniserver_args: {
          enable_mask_overlay: true,
        },
        format: 'json',
      }),
    });

    if (!taskRes.ok) {
      const err = await taskRes.text();
      return NextResponse.json({ error: `Task creation failed: ${err}` }, { status: 500 });
    }

    const taskData = await taskRes.json();
    const taskId = taskData.data.task_id;

    // Poll for results with backoff
    const results = await pollTask(taskId);

    console.log('[SkinLabRx] Raw API response keys:', Object.keys(results));
    console.log('[SkinLabRx] Raw API response:', JSON.stringify(results).slice(0, 500));

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Skin analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
