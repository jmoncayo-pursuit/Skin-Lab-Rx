const fs = require('fs');

async function testSkinBeautify() {
  const API_KEY = process.env.PERFECT_CORP_API_KEY || 'sk-hQjBbNZGE7o4byB-SJn7ovJxmA86zj8KSxKDpBuGpsvWG55MyYsFE2C3MLFfB0rO';
  const API_BASE = 'https://yce-api-01.perfectcorp.com';

  try {
    // We already uploaded the user's target image in test_transfer.js but we don't have its file_id.
    // Let's just upload a file again.
    const targetBuffer = fs.readFileSync('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/clear_skin_reference_1777935157211.png');

    const fileRes = await fetch(`${API_BASE}/s2s/v2.0/file/skin-beautification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [{
          content_type: 'image/jpeg',
          file_name: 'test.jpg',
          file_size: targetBuffer.length,
        }],
      }),
    });

    const fileData = await fileRes.json();
    if (!fileData.data) {
      console.log('skin-beautification not supported', fileData);
      return;
    }
    const fileInfo = fileData.data.files[0];
    const uploadReq = fileInfo.requests[0];

    const uploadHeaders = {};
    if (uploadReq.headers) {
      Object.entries(uploadReq.headers).forEach(([k, v]) => { uploadHeaders[k] = v; });
    }
    await fetch(uploadReq.url, { method: uploadReq.method, headers: uploadHeaders, body: targetBuffer });

    const taskRes = await fetch(`${API_BASE}/s2s/v2.0/task/skin-beautification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src_file_id: fileInfo.file_id,
        dst_actions: ['skin_smoothing', 'dark_circle_removal']
      }),
    });
    const taskData = await taskRes.json();
    console.log(taskData);
  } catch (e) {
    console.error(e);
  }
}

testSkinBeautify();
