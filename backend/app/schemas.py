from pydantic import BaseModel

class ConversionBase(BaseModel):
    filename: str
    language: str
    audio_file_path: str

class ConversionCreate(ConversionBase):
    pass

class Conversion(ConversionBase):
    id: int

    # class Config:
    #     orm_mode = True