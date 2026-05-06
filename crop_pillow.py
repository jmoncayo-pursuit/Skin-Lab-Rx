from PIL import Image
import os

img = Image.open('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/media__1778099338686.png').convert('RGB')
pixels = img.load()
width, height = img.size

black_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b = pixels[x, y]
        if r < 30 and g < 30 and b < 30:
            black_pixels.append((x, y))

cols = 4
rows = 2
box_width = width // cols
box_height = height // rows

names = [
    'radiant_cartoon.png',
    'clear_cartoon.png',
    'youthful_cartoon.png',
    'skip1.png',
    'bright_eyes_cartoon.png',
    'calm_cartoon.png',
    'skip2.png',
    'spotfree_cartoon.png'
]

for r in range(rows):
    for c in range(cols):
        x0 = c * box_width
        y0 = r * box_height
        x1 = x0 + box_width
        y1 = y0 + box_height
        
        min_x = x1; max_x = x0
        min_y = y1; max_y = y0
        
        has_black = False
        for x, y in black_pixels:
            if x0 <= x < x1 and y0 <= y < y1:
                # ignore header and footer (text has black pixels too)
                if y < 80 or y > height - 80: continue
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                has_black = True
                
        if has_black and (max_x - min_x) > 100 and (max_y - min_y) > 100:
            # Crop exactly at the black border
            crop = img.crop((min_x, min_y, max_x+1, max_y+1))
            
            idx = r * cols + c
            if idx < len(names) and 'skip' not in names[idx]:
                crop.save(f'public/glow-ups/{names[idx]}')
                print(f"Saved {names[idx]}")
