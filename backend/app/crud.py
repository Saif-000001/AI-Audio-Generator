from sqlalchemy.orm import Session
from . import models, schemas


def create_conversion(db: Session, filename: str, language: str, audio_file_path: str):
    db_conversion = models.Conversion(filename=filename, language=language, audio_file_path=audio_file_path)
    db.add(db_conversion)
    db.commit()
    db.refresh(db_conversion)
    return db_conversion

def get_conversions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Conversion).offset(skip).limit(limit).all()

def get_conversion(db: Session, conversion_id: int):
    return db.query(models.Conversion).filter(models.Conversion.id == conversion_id).first()

def delete_conversion(db: Session, conversion_id: int):
    conversion = db.query(models.Conversion).filter(models.Conversion.id == conversion_id).first()
    if conversion:
        db.delete(conversion)
        db.commit()
    return conversion