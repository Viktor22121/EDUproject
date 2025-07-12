from PIL import Image, ImageDraw, ImageFont
import os

def add_watermark(image_path: str, text: str):
    """Добавляет водяной знак на изображение"""
    if not os.path.exists(image_path):
        return False
        
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()  # Или укажите свой шрифт (.ttf)
    
    # Серый полупрозрачный текст в углу
    draw.text((10, 10), text, fill=(128, 128, 128, 128), font=font)
    img.save(image_path)
    return True