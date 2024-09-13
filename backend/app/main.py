import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import SessionLocal, engine
from langdetect import detect
import os
from pathlib import Path
import logging
from typing import List
import easyocr
import fitz  # PyMuPDF
import numpy as np
from TTS.api import TTS
import torch
import uuid
from uuid import uuid4
import requests
from requests.exceptions import RequestException
import io
from PIL import Image

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"

origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = Path("temp/uploads")
AUDIO_DIR = Path("temp/audio")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

supported_languages = ['bn', 'ja', 'zh-cn', 'zh-tw', 'ko', 'ru', 'bg', 'be', 'uk', 'cs', 'pl', 'sk', 'da', 'no', 'sv', 'nl', 'de', 'fr', 'it', 'es', 'pt', 'en']

lang_to_model = {       
    'en': 'tts_models/en/ljspeech/fast_pitch',
    'fr': 'tts_models/fr/mai/tacotron2-DDC',
    'de': 'tts_models/de/thorsten/tacotron2-DDC',
    'es': 'tts_models/es/mai/tacotron2-DDC',
    'it': 'tts_models/it/mai_female/glow-tts',
    'nl': 'tts_models/nl/mai/tacotron2-DDC',
    'pt': 'tts_models/pt/cv/vits',
    'pl': 'tts_models/pl/mai_female/vits',
    'tr': 'tts_models/tr/common-voice/glow-tts',
    'ja': 'tts_models/ja/kokoro/tacotron2-DDC',
    'zh-cn': 'tts_models/zh-CN/baker/tacotron2-DDC-GST',
    'bn': 'tts_models/bn/custom/vits-male',  
    'bg': 'tts_models/bg/cv/vits',
    'cs': 'tts_models/cs/cv/vits',
    'da': 'tts_models/da/cv/vits',
    'et': 'tts_models/et/cv/vits',
    'ga': 'tts_models/ga/cv/vits',
    'el': 'tts_models/el/cv/vits',
    'fi': 'tts_models/fi/css10/vits',
    'hr': 'tts_models/hr/cv/vits',
    'hu': 'tts_models/hu/css10/vits',
    'lt': 'tts_models/lt/cv/vits',
    'lv': 'tts_models/lv/cv/vits',
    'mt': 'tts_models/mt/cv/vits',
    'ro': 'tts_models/ro/cv/vits',
    'sk': 'tts_models/sk/cv/vits',
    'sl': 'tts_models/sl/cv/vits',
    'sv': 'tts_models/sv/cv/vits',
    'uk': 'tts_models/uk/mai/vits',
    'ca': 'tts_models/ca/custom/vits',
    'fa': 'tts_models/fa/custom/glow-tts',
    'be': 'tts_models/be/common-voice/glow-tts'
}

thread_pool = ThreadPoolExecutor()

def run_in_thread_pool(fn, *args, **kwargs):
    return asyncio.get_event_loop().run_in_executor(thread_pool, partial(fn, *args, **kwargs))

async def detect_language(text):
    try:
        return await run_in_thread_pool(detect, text)
    except:
        return 'en'  # Default to English if detection fails

async def get_ocr_reader(lang):
    if lang not in supported_languages:
        logger.warning(f"Language '{lang}' not supported. Defaulting to English.")
        lang = 'en'
    return await run_in_thread_pool(easyocr.Reader, [lang, 'en'] if lang != 'en' else ['en'])

async def process_image(img_data, reader):
    try:
        img = await run_in_thread_pool(Image.open, io.BytesIO(img_data))
        img_np = np.array(img)
        ocr_result = await run_in_thread_pool(reader.readtext, img_np)
        return ' '.join([text for _, text, _ in ocr_result])
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return ""

async def process_page(page, reader):
    try:
        text = await run_in_thread_pool(page.get_text)
        image_texts = []

        for img in page.get_images():
            xref = img[0]
            base_image = await run_in_thread_pool(page.parent.extract_image, xref)
            image_text = await process_image(base_image["image"], reader)
            image_texts.append(image_text)

        return text + ' ' + ' '.join(image_texts)
    except Exception as e:
        logger.error(f"Error processing page: {e}")
        return ""

async def pdf_to_text(pdf_path):
    try:
        doc = await run_in_thread_pool(fitz.open, pdf_path)
        first_page_text = await run_in_thread_pool(doc[0].get_text)
        lang = await detect_language(first_page_text)
        reader = await get_ocr_reader(lang)
        
        tasks = [process_page(page, reader) for page in doc]
        results = await asyncio.gather(*tasks)
        await run_in_thread_pool(doc.close)
        return ' '.join(results), lang
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        return "", "en"

async def text_to_audio(text, lang, speaker=None, max_retries=3, retry_delay=5):
    model_name = lang_to_model.get(lang, 'tts_models/multilingual/multi-dataset/your_tts')
    
    for attempt in range(max_retries):
        try:
            tts = TTS(model_name=model_name).to(device)
            output_file = AUDIO_DIR / f"Audio_{lang}_{uuid.uuid4()}.wav"
            
            await run_in_thread_pool(tts.tts_to_file, text=text, file_path=(output_file), speaker=speaker)
            return output_file
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Failed to generate audio after {max_retries} attempts")
                raise

@app.post("/convert/", response_model=schemas.Conversion, status_code=201)
async def convert_pdf_to_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = UPLOAD_DIR / file.filename
    content = await file.read()
    await run_in_thread_pool(file_path.write_bytes, content)

    try:
        full_text, lang = await pdf_to_text(str(file_path))
        audio_file_path = await text_to_audio(full_text, lang)
    except Exception as e:
        logger.error(f"Error in conversion process: {e}")
        raise HTTPException(status_code=500, detail="Error in conversion process")

    conversion = await run_in_thread_pool(crud.create_conversion, db, file.filename, lang, str(audio_file_path))
    return conversion

@app.get("/conversions/", response_model=List[schemas.Conversion])
async def read_conversions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_thread_pool(crud.get_conversions, db, skip=skip, limit=limit)

@app.get("/download/{conversion_id}")
async def download_file(conversion_id: int, db: Session = Depends(get_db)):
    conversion = await run_in_thread_pool(crud.get_conversion, db, conversion_id)
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    if not hasattr(conversion, 'audio_file_path'):
        raise HTTPException(status_code=500, detail="Conversion record is missing audio file path")
    
    file_path = Path(conversion.audio_file_path)
    if not await run_in_thread_pool(file_path.exists):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(file_path, media_type="audio/wav", filename=file_path.name)

@app.delete("/conversions/{conversion_id}", status_code=204)
async def delete_conversion(conversion_id: int, db: Session = Depends(get_db)):
    conversion = await run_in_thread_pool(crud.get_conversion, db, conversion_id)
    if not conversion:
        raise HTTPException(status_code=404, detail=f"Conversion with id {conversion_id} not found")
    
    file_path = Path(conversion.audio_file_path)
    if await run_in_thread_pool(file_path.exists):
        await run_in_thread_pool(file_path.unlink)
    
    await run_in_thread_pool(crud.delete_conversion, db, conversion_id)
    
    return {"message": "Conversion deleted successfully"}

@app.on_event("shutdown")
async def shutdown_event():
    global thread_pool
    thread_pool.shutdown()