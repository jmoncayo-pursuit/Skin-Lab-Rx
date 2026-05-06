import cv2
import numpy as np
import os

img_path = '/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/media__1778099338686.png'
out_dir = 'public/glow-ups'

img = cv2.imread(img_path)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to find the black borders of the boxes
_, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

boxes = []
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    # The boxes are roughly square, maybe 200x200 or 150x150 on a 1024x559 image
    # They should have an aspect ratio close to 1
    if w > 150 and h > 150 and w < 400 and h < 400:
        boxes.append((x, y, w, h))

# Sort boxes top-to-bottom, then left-to-right
# Since it's a 4x2 grid, we can just sort by Y roughly, then X
boxes.sort(key=lambda b: (round(b[1] / 100) * 100, b[0]))

print(f"Found {len(boxes)} boxes")

# Mapping the 8 boxes to our 6 categories
# The user's image has:
# Row 1: Radiant Glow, Clear & Smooth, Youthful & Firm, Youthful & Skin (skip)
# Row 2: Bright Eyes, Calm & Even, Spot-Free Glow (gradient), Spot-Free Glow (split)

# Let's map based on index (0 to 7)
names = [
    'radiant_cartoon.png',
    'clear_cartoon.png',
    'youthful_cartoon.png',
    'skip1.png',
    'bright_eyes_cartoon.png',
    'calm_cartoon.png',
    'skip2.png',
    'spotfree_cartoon.png' # Using the bottom right one for spot-free
]

for i, (x, y, w, h) in enumerate(boxes):
    if i >= len(names): break
    
    # Optional: crop slightly inside the border if desired, or keep the border
    crop = img[y:y+h, x:x+w]
    
    name = names[i]
    if 'skip' not in name:
        cv2.imwrite(os.path.join(out_dir, name), crop)
        print(f"Saved {name}")
