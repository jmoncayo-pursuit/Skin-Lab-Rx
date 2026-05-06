from PIL import Image

img = Image.open('/Users/jmoncayopursuit.org/.gemini/antigravity/brain/42d94f3e-aff2-4ef1-9da0-bd7a2fa82c70/media__1778099338686.png').convert('RGB')
pixels = img.load()
width, height = img.size

# Find horizontal lines (rows with many black pixels)
row_black_counts = []
for y in range(height):
    black_count = 0
    for x in range(width):
        r, g, b = pixels[x, y]
        if r < 40 and g < 40 and b < 40:
            black_count += 1
    row_black_counts.append(black_count)

# Print rows that have a significant number of black pixels (likely horizontal borders)
print("Horizontal lines at Y:")
for y, count in enumerate(row_black_counts):
    if count > 300: # at least 300 black pixels means a solid horizontal line across the 4 boxes
        print(f"y={y}: {count} black pixels")

# Find vertical lines
col_black_counts = []
for x in range(width):
    black_count = 0
    for y in range(height):
        r, g, b = pixels[x, y]
        if r < 40 and g < 40 and b < 40:
            black_count += 1
    col_black_counts.append(black_count)

print("Vertical lines at X:")
for x, count in enumerate(col_black_counts):
    if count > 150:
        print(f"x={x}: {count} black pixels")
