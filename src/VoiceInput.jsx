// VoiceInput.js
import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import StopCircleIcon from "@mui/icons-material/StopCircle";

function VoiceInput({ onTranscript, setInput, inputVal }) {
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    if (!isListening) {
      resetTranscript();
      setIsListening(true);
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      setIsListening(false);
      onTranscript(transcript);
      setInput(...inputVal, transcript);

      resetTranscript();
    }
  };

  return (
    <div
      onClick={toggleListening}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {isListening ? (
        <StopCircleIcon fontSize="large" />
      ) : (
        <>
          <GraphicEqIcon fontSize="small" />
          <span style={{ fontSize: "12px", marginLeft: "4px" }} id="VoiceText">
            Voice
          </span>
        </>
      )}
    </div>
  );
}

export default VoiceInput;
