from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from edge_tts import Communicate

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SpeechData(BaseModel):
    text: str
    voice: str
    rate: int
    volume: int
    pitch: int


async def generateSpeech(text, voice, rate, volume, pitch, mp3Data):

    rate_str = f"{rate:+d}%"
    volume_str = f"{volume:+d}%"
    # pitch_str = f"{pitch:+d}Hz"

    communicate = Communicate(text, voice, rate=rate_str, volume=volume_str)
    mp3Data = BytesIO()
    async for message in communicate.stream():
        if message["type"] == "audio":
            mp3Data.write(message["data"])

    mp3Data.seek(0)
    return mp3Data


@app.post("/api/generateSpeech")
async def generateSpeechRoute(data: SpeechData):
    mp3Data = BytesIO()
    mp3Data = await generateSpeech(data.text, data.voice, data.rate, data.volume, data.pitch, mp3Data)

    return StreamingResponse(
        mp3Data,
        headers={
            "Content-Type": "audio/mp3",
            "Content-Disposition": "attachment; filename=generated_speech.mp3"
        }
    )


@app.get("/api/listVoices")
async def listVoices():
    return {
        "listVoices": [
            {
                "Name": "en-US-EricNeural",
                "Gender": "Male",
                "Description": "En-US Eric",
                "ShortName": "Eric"
            },
            {
                "Name": "en-US-ChristopherNeural",
                "Gender": "Male",
                "Description": "En-US Christopher",
                "ShortName": "Christopher"
            },
            {
                "Name": "en-US-GuyNeural",
                "Gender": "Male",
                "Description": "En-US Guy",
                "ShortName": "Guy"
            },
            {
                "Name": "en-GB-RyanNeural",
                "Gender": "Male",
                "Description": "En-GB Ryan",
                "ShortName": "Ryan"
            },
            {
                "Name": "en-US-JennyNeural",
                "Gender": "Female",
                "Description": "En-US Jenny",
                "ShortName": "Jenny"
            },
            {
                "Name": "en-US-MichelleNeural",
                "Gender": "Female",
                "Description": "En-US Michelle",
                "ShortName": "Michelle"
            },
            {
                "Name": "en-US-AnaNeural",
                "Gender": "Female",
                "Description": "En-US Ana",
                "ShortName": "Ana"
            },
            {
                "Name": "en-GB-SoniaNeural",
                "Gender": "Female",
                "Description": "En-GB Sonia",
                "ShortName": "Sonia"
            }
        ]
    }


@app.get("/")
def home():
    return {"message": "Welcome to Rotts!"}
