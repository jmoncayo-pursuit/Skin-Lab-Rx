const fs = require('fs');

async function testVTO() {
  const API_KEY = process.env.PERFECT_CORP_API_KEY || 'sk-hQjBbNZGE7o4byB-SJn7ovJxmA86zj8KSxKDpBuGpsvWG55MyYsFE2C3MLFfB0rO';
  const API_BASE = 'https://yce-api-01.makeupar.com';

  try {
    const targetBuffer = fs.readFileSync('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/clear_skin_reference_1777935157211.png');

    const fileRes = await fetch(`${API_BASE}/s2s/v2.0/file/makeup-vto`, {
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
    const fileInfo = fileData.data.files[0];
    const uploadReq = fileInfo.requests[0];

    const uploadHeaders = {};
    if (uploadReq.headers) {
      Object.entries(uploadReq.headers).forEach(([k, v]) => { uploadHeaders[k] = v; });
    }
    await fetch(uploadReq.url, { method: uploadReq.method, headers: uploadHeaders, body: targetBuffer });

    const taskRes = await fetch(`${API_BASE}/s2s/v2.0/task/makeup-vto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src_file_id: fileInfo.file_id,
        version: "1.0",
        effects: [
          {
            category: "skin_smooth",
            skinSmoothStrength: 100,
            skinSmoothColorIntensity: 0
          }
        ]
      }),
    });
    const taskData = await taskRes.json();
    console.log("Task started:", taskData);
    
    if (taskData.data && taskData.data.task_id) {
        let status = 'processing';
        while (status === 'processing' || status === 'queued') {
            await new Promise(r => setTimeout(r, 2000));
            const pollRes = await fetch(`${API_BASE}/s2s/v2.0/task/makeup-vto/${taskData.data.task_id}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            const pollData = await pollRes.json();
            status = pollData.data.task_status;
            console.log("Status:", status);
            if (status === 'success') {
                console.log("URL:", pollData.data.results.url);
            } else if (status === 'error') {
                console.log("Error:", pollData.data);
            }
        }
    }
  } catch (e) {
    console.error(e);
  }
}

testVTO();
