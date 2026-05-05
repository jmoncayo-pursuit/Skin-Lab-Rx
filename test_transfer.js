const fs = require('fs');
const path = require('path');

async function testMakeupTransfer() {
  try {
    const formData = new FormData();
    // we need to pass a File, but in Node we can use Blob
    const targetBuffer = fs.readFileSync('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/clear_skin_reference_1777935157211.png');
    const refBuffer = fs.readFileSync('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/spotfree_reference_1777935212053.png');
    
    formData.append('target', new Blob([targetBuffer], { type: 'image/jpeg' }), 'target.jpg');
    formData.append('reference', new Blob([refBuffer], { type: 'image/jpeg' }), 'ref.jpg');

    const res = await fetch('http://localhost:3000/api/makeup-transfer', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testMakeupTransfer();
