import { useState } from "react";

import TextInput from "@/components/text-input";
import VoicesList from "@/components/voice-list";
import VolumeSelector from "@/components/volume-selector";
import RateSelector from "@/components/rate-selector";
import PitchSelector from "@/components/pitch-selector";
import RottsPlayer from "@/components/rotts-player";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Speech, Loader2 } from "lucide-react";

import { productName } from "./metadata";

export default function App() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(0);
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  const generateSpeech = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    const res = await fetch("/api/generateSpeech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, rate, volume, pitch }),
    });

    setIsGenerating(false);

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setShowPlayer(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;

    const now = new Date();
    const datestamp = `${String(now.getFullYear()).slice(-2)}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    link.download = `RottsAudio_${datestamp}.mp3`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 sm:px-0 py-8 sm:py-0 px-4 sm:justify-center sm:h-screen">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{productName}</h1>
        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-6">
          <TextInput className="col-span-7 h-full" onChange={setText} />
          <div className="col-span-5 flex flex-col justify-between mt-2 sm:mt-0">
            <div className="flex flex-col gap-6">
              <VoicesList onChange={setVoice} />
              <VolumeSelector
                defaultValue={[0]}
                onChange={(newValue) => setVolume(newValue[0])}
              />
              <RateSelector
                defaultValue={[0]}
                onChange={(newValue) => setRate(newValue[0])}
              />
              <PitchSelector
                defaultValue={[0]}
                onChange={(newValue) => setPitch(newValue[0])}
              />
            </div>
            <div className="flex flex-col gap-4 mt-12 sm:mt-0">
              <div
                className={`transition-all duration-300 ease-in-out transform ${
                  showPlayer
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
              >
                {showPlayer && <RottsPlayer audioUrl={audioUrl} />}
              </div>
              <div className="flex flex-row gap-3 sm:mt-0 mt-8">
                <HoverCard>
                  <HoverCardTrigger className="w-full">
                    <Button
                      className="w-full"
                      onClick={generateSpeech}
                      disabled={isGenerating || !text}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          <span className="w-16">Generating...</span>
                        </>
                      ) : (
                        <>
                          <Speech className="mr-1 h-4 w-4" />
                          <span className="w-16">Start converting</span>
                        </>
                      )}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="text-sm text-gray-700 p-3">
                    After adjusting the configuration information you need to click the button again to generate the voice.
                  </HoverCardContent>
                </HoverCard>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={downloadAudio}
                  disabled={isGenerating || !audioUrl}
                >
                  Download Audio
                </Button>
                <Button className="w-full" variant="secondary" disabled>
                  Download subtitles
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
