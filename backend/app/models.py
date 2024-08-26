from sqlalchemy import Column, Integer, String
from .database import Base

class Conversion(Base):
    __tablename__ = "conversions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    language = Column(String)
    audio_file_path = Column(String)