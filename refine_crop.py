from PIL import Image

img = Image.open('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/media__1778099338686.png').convert('RGB')
pixels = img.load()
width, height = img.size

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

for name, (x0, y0, x1, y1) in boxes:
    if 'skip' in name: continue
    
    # We know the approximate region. Let's find the exact min/max X and Y of black pixels in a slightly padded region
    pad = 10
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    for y in range(max(0, y0-pad), min(height, y1+pad)):
        for x in range(max(0, x0-pad), min(width, x1+pad)):
            r, g, b = pixels[x, y]
            if r < 40 and g < 40 and b < 40:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    # Max x and y should be exclusive in PIL crop
    max_x += 1
    max_y += 1
    
    print(f"'{name}': ({min_x}, {min_y}, {max_x}, {max_y}),")
    
    crop = img.crop((min_x, min_y, max_x, max_y))
    crop.save(f'public/glow-ups/{name}')
