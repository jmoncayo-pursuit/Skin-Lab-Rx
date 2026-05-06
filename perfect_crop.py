from PIL import Image
import os

img = Image.open('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/media__1778099338686.png').convert('RGB')

# Exact coordinates mapped from grid analysis
boxes = [
    ('radiant_cartoon.png', (54, 81, 272, 289)),
    ('clear_cartoon.png', (290, 81, 508, 289)),
    ('youthful_cartoon.png', (526, 81, 744, 289)),
    ('skip1', (761, 81, 979, 289)),
    ('bright_eyes_cartoon.png', (54, 300, 272, 507)),
    ('calm_cartoon.png', (290, 300, 508, 507)),
    ('skip2', (526, 300, 744, 507)),
    ('spotfree_cartoon.png', (761, 300, 979, 507)),
]

for name, coords in boxes:
    if 'skip' in name: continue
    crop = img.crop(coords)
    crop.save(f'public/glow-ups/{name}')
    print(f'Perfectly cropped {name}')
