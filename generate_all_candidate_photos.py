import base64
import json
import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# Candidate metadata
candidates_meta = [
    {
        "id": "cand_pres_1",
        "name": "Shiwani Bhandari",
        "initials": "SB",
        "bg_start": (236, 72, 153),
        "bg_end": (157, 23, 77),
        "post": "President"
    },
    {
        "id": "cand_pres_2",
        "name": "Rohit Raj Ranjan",
        "is_rohit": True,
        "post": "President"
    },
    {
        "id": "cand_vp_1",
        "name": "Karnika Koranga",
        "initials": "KK",
        "bg_start": (37, 99, 235),
        "bg_end": (30, 58, 138),
        "post": "Vice President"
    },
    {
        "id": "cand_vp_2",
        "name": "Kartik Prakash",
        "initials": "KP",
        "bg_start": (14, 165, 233),
        "bg_end": (12, 74, 96),
        "post": "Vice President"
    },
    {
        "id": "cand_vp_3",
        "name": "Sanjana Chauhan",
        "initials": "SC",
        "bg_start": (168, 85, 247),
        "bg_end": (88, 28, 135),
        "post": "Vice President"
    },
    {
        "id": "cand_sec_1",
        "name": "Anshika Sharma",
        "initials": "AS",
        "bg_start": (16, 185, 129),
        "bg_end": (6, 78, 59),
        "post": "Secretary"
    },
    {
        "id": "cand_sec_2",
        "name": "Monika Rawat",
        "initials": "MR",
        "bg_start": (245, 158, 11),
        "bg_end": (120, 53, 15),
        "post": "Secretary"
    },
    {
        "id": "cand_sec_3",
        "name": "Shreya Chuphal",
        "initials": "SC",
        "bg_start": (20, 184, 166),
        "bg_end": (19, 78, 74),
        "post": "Secretary"
    },
    {
        "id": "cand_sec_4",
        "name": "Mahi Danpali",
        "initials": "MD",
        "bg_start": (244, 63, 94),
        "bg_end": (136, 19, 55),
        "post": "Secretary"
    },
    {
        "id": "cand_jsec_1",
        "name": "Harshita Pandey",
        "initials": "HP",
        "bg_start": (139, 92, 246),
        "bg_end": (76, 29, 149),
        "post": "Joint Secretary"
    },
    {
        "id": "cand_jsec_2",
        "name": "Nitin",
        "initials": "NT",
        "bg_start": (2, 132, 199),
        "bg_end": (8, 47, 73),
        "post": "Joint Secretary"
    },
    {
        "id": "cand_jsec_3",
        "name": "Chetna",
        "initials": "CH",
        "bg_start": (217, 70, 239),
        "bg_end": (112, 26, 117),
        "post": "Joint Secretary"
    },
    {
        "id": "cand_treas_1",
        "name": "Rishabh Upreti",
        "initials": "RU",
        "bg_start": (99, 102, 241),
        "bg_end": (49, 46, 129),
        "post": "Treasurer"
    },
    {
        "id": "cand_treas_2",
        "name": "Mohmmed Aalim Khan",
        "initials": "AK",
        "bg_start": (5, 150, 105),
        "bg_end": (2, 44, 34),
        "post": "Treasurer"
    }
]

# Try to load standard TrueType fonts if available
font_large = None
font_title = None
font_sub = None
try:
    font_large = ImageFont.truetype("arialbd.ttf", 68)
    font_title = ImageFont.truetype("arialbd.ttf", 24)
    font_sub = ImageFont.truetype("arial.ttf", 16)
except Exception:
    try:
        font_large = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 68)
        font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
    except Exception:
        font_large = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

def generate_studio_jpeg(meta):
    size = (500, 500)
    img = Image.new('RGB', size, meta["bg_start"])
    draw = ImageDraw.Draw(img)

    # 1. Subtle smooth studio gradient
    for y in range(500):
        ratio = y / 500.0
        r = int(meta["bg_start"][0] * (1.0 - ratio) + meta["bg_end"][0] * ratio)
        g = int(meta["bg_start"][1] * (1.0 - ratio) + meta["bg_end"][1] * ratio)
        b = int(meta["bg_start"][2] * (1.0 - ratio) + meta["bg_end"][2] * ratio)
        draw.line([(0, y), (500, y)], fill=(r, g, b))

    # 2. Studio soft spotlight backdrop
    draw.ellipse([70, 40, 430, 400], fill=(248, 250, 252), outline=(255, 255, 255), width=6)

    # 3. Silhouette torso & medical scrub neck
    draw.chord([95, 220, 405, 470], 0, 180, fill=meta["bg_start"])
    # Scrub V-neck
    draw.polygon([(215, 220), (285, 220), (250, 275)], fill=(248, 250, 252))

    # 4. Portrait Head
    draw.ellipse([180, 85, 320, 225], fill=meta["bg_end"])

    # 5. Medical Stethoscope line
    draw.arc([175, 240, 325, 360], 0, 180, fill=(2, 132, 199), width=8)
    draw.ellipse([240, 350, 260, 370], fill=(3, 105, 161), outline=(255, 255, 255), width=2)

    # 6. Initials Monogram Badge in center
    init_text = meta["initials"]
    bbox = draw.textbbox((0, 0), init_text, font=font_large)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((250 - tw / 2, 155 - th / 2), init_text, fill=(255, 255, 255), font=font_large)

    # 7. Name & Post Banner Card at bottom
    draw.rounded_rectangle([30, 405, 470, 478], radius=16, fill=(15, 23, 42), outline=(255, 255, 255), width=2)
    name_text = meta["name"]
    n_bbox = draw.textbbox((0, 0), name_text, font=font_title)
    nw = n_bbox[2] - n_bbox[0]
    draw.text((250 - nw / 2, 416), name_text, fill=(255, 255, 255), font=font_title)

    post_text = f"Candidate for {meta['post']}"
    p_bbox = draw.textbbox((0, 0), post_text, font=font_sub)
    pw = p_bbox[2] - p_bbox[0]
    draw.text((250 - pw / 2, 448), post_text, fill=(148, 163, 184), font=font_sub)

    buf = BytesIO()
    img.save(buf, format='JPEG', quality=92)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')

# Generate dictionary of candidate photos
photos = {}
for c in candidates_meta:
    if c.get("is_rohit"):
        # Keep Rohit's uploaded photo from Firestore if available
        pass
    else:
        photos[c["id"]] = generate_studio_jpeg(c)

print(f"Generated {len(photos)} high-resolution JPEG candidate portraits.")
with open("candidate_jpeg_photos.json", "w", encoding="utf-8") as f:
    json.dump(photos, f)
print("Saved candidate_jpeg_photos.json successfully!")
