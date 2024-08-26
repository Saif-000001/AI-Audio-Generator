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
import pymupdf
import numpy as np
from TTS.api import TTS
import torch
import uuid
from uuid import uuid4


# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

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
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define directories for uploads and audio files
UPLOAD_DIR = Path("temp/uploads")
AUDIO_DIR = Path("temp/audio")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

def get_ocr_reader(lang):
    if lang in ['bn']:
        return easyocr.Reader(['bn', 'en'])
    elif lang in ['ja']:
        return easyocr.Reader(['ja', 'en'])
    elif lang in ['zh-cn', 'zh-tw', 'ko']:
        return easyocr.Reader(['ch_sim', 'ch_tra', 'ja', 'ko', 'en'])
    elif lang in ['ru', 'bg', 'be', 'uk']:
        return easyocr.Reader(['ru', 'bg', 'be', 'uk', 'en'])
    elif lang in ['cs', 'pl', 'sk']:
        return easyocr.Reader(['cs', 'pl', 'sk', 'en'])
    elif lang in ['da', 'no', 'sv']:
        return easyocr.Reader(['da', 'no', 'sv', 'en'])
    elif lang in ['nl', 'de']:
        return easyocr.Reader(['nl', 'de', 'en'])
    elif lang in ['fr', 'it', 'es', 'pt']:
        return easyocr.Reader(['fr', 'it', 'es', 'pt', 'en'])
    else:
        return easyocr.Reader(['en', 'fr', 'es', 'de', 'it', 'pt', 'nl'])

def text_to_audio(text, lang, speaker=None):
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
    
    model_name = lang_to_model.get(lang, 'tts_models/multilingual/multi-dataset/your_tts')
    

    tts = TTS(model_name=model_name).to(device)
    output_file = AUDIO_DIR / f"Audio_{lang}_{uuid.uuid4()}.wav"
    tts.tts_to_file(text=text, file_path=str(output_file), speaker=speaker)

    # logger.info(f"Audio file created: {output_file}")
    return output_file



@app.post("/convert/", response_model=schemas.Conversion, status_code=201)
async def convert_pdf_to_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        pdf_document = pymupdf.open(str(file_path))
        full_text = ""

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            pix = page.get_pixmap()
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)

            page_text = " ".join([word[4] for word in page.get_text("words")])
            lang = detect(page_text)
            # logger.info(f"Detected language: {lang}")

            reader = get_ocr_reader(lang)
            result = reader.readtext(img)
            page_text = " ".join([text[1] for text in result])
            full_text += page_text + "\n\n"

        lang = detect(full_text)
        try:
            audio_file_path = text_to_audio(full_text, lang)
        except ValueError as ve:
            # If there's a speaker-related error
            if "No speakers available" in str(ve):
                # logger.warning("Retrying with a specific speaker")
                audio_file_path = text_to_audio(full_text, lang, speaker="speaker_0")
            else:
                raise

        conversion = crud.create_conversion(db, file.filename, lang, str(audio_file_path))
        # logger.info(f"Conversion created: {conversion.id}")
        return conversion


@app.get("/conversions/", response_model=List[schemas.Conversion])
def read_conversions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    conversions = crud.get_conversions(db, skip=skip, limit=limit)
    return conversions


@app.get("/download/{conversion_id}")
def download_file(conversion_id: int, db: Session = Depends(get_db)):
    conversion = crud.get_conversion(db, conversion_id)
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    if not hasattr(conversion, 'audio_file_path'):
        raise HTTPException(status_code=500, detail="Conversion record is missing audio file path")
    
    file_path = Path(conversion.audio_file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    # logger.info(f"Downloading file: {file_path.name}")
    return FileResponse(file_path, media_type="audio/wav", filename=file_path.name)


@app.delete("/conversions/{conversion_id}", status_code=204)
def delete_conversion(conversion_id: int, db: Session = Depends(get_db)):
    conversion = crud.get_conversion(db, conversion_id)
    if not conversion:
        raise HTTPException(status_code=404, detail=f"Conversion with id {conversion_id} not found")
    
    # Delete the associated audio file
    file_path = Path(conversion.audio_file_path)
    if file_path.exists():
        file_path.unlink()
        # logger.info(f"Deleted audio file: {file_path}")
    
    # Delete the database entry
    crud.delete_conversion(db, conversion_id)
    
    # logger.info(f"Deleted conversion: {conversion_id}")
    return {"message": "Conversion deleted successfully"}