import React, { useEffect, useRef, useState } from "react";
import "./MsgBox.scss";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import FileOpenOutlinedIcon from "@mui/icons-material/FileOpenOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import VoiceInput from "./VoiceInput"; // keep your voice input component
import loadingGif from "./assets/loading.gif";

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin + "/";

export default function MsgBox({ setMsg, msg, keyboardOpen, setKeyboardOpen }) {
  const [showAttach, setShowAttach] = useState(false);
  const [ImgInfo, setImgInfo] = useState([]);
  const [allImg, setAllImg] = useState([]);
  const [allFile, setAllFile] = useState([]);
  const [fileData, setFileData] = useState("");
  const [WebSearch, SetWebSearch] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachRef = useRef(null);
  const inputBoxRef = useRef(null);

  const initialHeight = useRef(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  // Focus input when clicking container
  function handleInput() {
    inputRef.current?.focus();
  }

  // Check for "create image" keywords
  const check = (userQuestion) => {
    return /\bcreate\b/i.test(userQuestion) || /\bimage\b/i.test(userQuestion);
  };

  // Image generator call (backend)
  async function ImageGen(prompt) {
    try {
      const res = await fetch(`${API_BASE}generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      return data.imageUrl || data.url || "Error generating image";
    } catch (err) {
      console.error("Image API Error:", err);
      return "Error generating image";
    }
  }

  // Optional web text generation — adjust to your backend
  async function SearchResponse(userQuestion) {
    if (!WebSearch) return null;
    try {
      const res = await fetch(`${API_BASE}text-generation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuestion }),
      });
      return await res.json();
    } catch (err) {
      console.error("Text generation problem:", err);
      return null;
    }
  }

  // Puter AI call (keeps your original usage)
  async function AIResponse(userQuestion) {
    try {
      const resSearch = await SearchResponse(userQuestion);

      // eslint-disable-next-line no-undef
      const responseFromPuter = await puter.ai.chat(
        `
You are a friendly and polite AI assistant. Respond conversationally and helpfully.

Context:
- Chat History: ${JSON.stringify(msg)}
- OCR Image Info (if any): ${JSON.stringify(ImgInfo || "No OCR data")}
- File Data Info (if any): ${JSON.stringify(fileData || "No file Included")}
- Web Search Results (if any): ${JSON.stringify(
          resSearch || "No search results"
        )}
- User Question: ${userQuestion}

Instructions:
1. If the user greets you, respond naturally like a human friend.
2. Otherwise, provide a clear, concise answer.
3. Use chat history/OCR/search only when helpful.
4. Keep tone polite and engaging.
`,
        { model: "gpt-5-nano" }
      );

      const reply =
        (await responseFromPuter.message?.content) ||
        JSON.stringify(responseFromPuter);
      return reply;
    } catch (error) {
      console.error("AIResponse error:", error);
      return "Error: " + (error.message || "unknown");
    }
  }

  // Send data (text or image generation)
  async function fetchData() {
    if (!inputValue.trim() && allImg.length === 0) return;

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

    const userQuestion = inputValue.trim();
    setInputValue("");
    document.body.classList.add("chating");

    if (allImg.length > 0) {
      setMsg((prev) => [
        ...prev,
        { ImgUrls: allImg, Req: userQuestion, Res: "..." },
      ]);
      setAllImg([]);
    } else {
      setMsg((prev) => [...prev, { Req: userQuestion, Res: "..." }]);
    }

    let reply;
    if (userQuestion && check(userQuestion)) {
      reply = await ImageGen(userQuestion);
    } else {
      reply = await AIResponse(userQuestion);
    }

    // update last message's Res
    setMsg((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        Res: reply,
      };
      return updated;
    });
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setAllImg((prev) => [...prev, imageUrl]);
      SendImgForOcr(formData);
    } else {
      setAllFile((prev) => [...prev, file]);
      SendForFileHandle(formData);
    }

    e.target.value = null;
    setShowAttach(false);
  };

  async function SendImgForOcr(formData) {
    try {
      const res = await fetch(`${API_BASE}process-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.text) setImgInfo((prev) => [...prev, data.text]);
    } catch (error) {
      console.error("Error sending image for OCR:", error);
    }
  }

  async function SendForFileHandle(formData) {
    try {
      const res = await fetch(`https://api.ocr.space/parse/image`, {
        method: "POST",
        headers: { apikey: "K86168982588957" },
        body: formData,
      });
      const data = await res.json();
      const parsed = data?.ParsedResults?.[0]?.ParsedText || "";
      setFileData(parsed);
    } catch (error) {
      console.error("Error in file handle", error);
    }
  }

  // click outside attach UI to close
  useEffect(() => {
    const handleOutSideAttachUi = (e) => {
      if (attachRef.current && !attachRef.current.contains(e.target)) {
        setShowAttach(false);
      }
    };
    const handleEnterBtn = (e) => {
      if (inputValue != "" && e.key == "Enter") {
        document.getElementById("SendBtn").click();
      }
    };
    document.addEventListener("keydown", handleEnterBtn);
    document.addEventListener("click", handleOutSideAttachUi);
    return () => document.removeEventListener("click", handleOutSideAttachUi);
  }, [inputValue]);

  // visualViewport adjustments to keep input visible above mobile keyboard
  useEffect(() => {
    const viewport = window.visualViewport;
    const inputBox = inputBoxRef.current;

    const adjust = () => {
      if (!viewport || !inputBox) return;
      const bottomOffset = window.innerHeight - viewport.height;
      inputBox.style.bottom = `${Math.max(0, bottomOffset)}px`;
      // scroll messages container to bottom when keyboard opens
      window.requestAnimationFrame(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      );
    };

    if (viewport) {
      viewport.addEventListener("resize", adjust);
      viewport.addEventListener("scroll", adjust);
    }

    return () => {
      if (viewport) {
        viewport.removeEventListener("resize", adjust);
        viewport.removeEventListener("scroll", adjust);
      }
    };
  }, []);

  // fallback keyboard detection using innerHeight
  useEffect(() => {
    const handleResize = () => {
      if (!initialHeight.current) initialHeight.current = window.innerHeight;
      if (window.innerHeight < initialHeight.current - 150) {
        setKeyboardOpen(true);
      } else {
        setKeyboardOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setKeyboardOpen]);

  return (
    <div
      ref={inputBoxRef}
      className={`inputBox ${keyboardOpen ? "keyboard-open" : ""}`}
    >
      <div onClick={handleInput}>
        {allImg && allImg.length > 0 && (
          <div
          // className="img-preview-row"
          // style={{ display: "flex", overflowX: "auto", padding: 6 }}
          >
            {allImg.map((imageUrl, idx) => (
              <div
                key={idx}
                style={{
                  margin: 5,
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  height: 80,
                }}
              >
                <img
                  src={imageUrl}
                  alt={`preview-${idx}`}
                  height="80px"
                  width="80px"
                  style={{ objectFit: "cover" }}
                />
                <button
                  className="imgfile_Btn"
                  onClick={() =>
                    setAllImg((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <ClearIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="text"
            name="Input"
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setKeyboardOpen(true)}
            onBlur={() => setKeyboardOpen(false)}
            placeholder={
              WebSearch ? "Will do a deep research" : "Ask Anything..."
            }
            value={inputValue}
            autoComplete="off"
          />
        </div>

        <div className="MsgBtn">
          <div>
            <div
              className="AttachBtn"
              ref={attachRef}
              onClick={() => setShowAttach((prev) => !prev)}
            >
              <button className="AttachBtn">
                <AttachFileIcon fontSize="small" />
                <p className="Attach">Attach</p>
              </button>

              {showAttach && (
                <div className="AttachUI">
                  <div
                    onClick={() =>
                      imageInputRef.current && imageInputRef.current.click()
                    }
                    className="AttachUIItem"
                  >
                    <CollectionsOutlinedIcon fontSize="small" />
                    <p>Images</p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      style={{ display: "none" }}
                      onChange={handleFile}
                    />
                  </div>

                  <div
                    onClick={() =>
                      fileInputRef.current && fileInputRef.current.click()
                    }
                    className="AttachUIItem"
                  >
                    <FileOpenOutlinedIcon fontSize="small" />
                    <p>Files</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFile}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                className="SearchBtn"
                onClick={() => SetWebSearch((prev) => !prev)}
                style={{
                  color: WebSearch ? "#0886fcff" : "rgb(100, 99, 99)",
                  borderColor: WebSearch ? "#0886fcff" : "rgb(223, 221, 221)",
                  backgroundColor: WebSearch ? "#f5f9fdff" : "white",
                }}
              >
                <LanguageIcon fontSize="small" />
                <p id="Search">Search</p>
              </button>
            </div>
          </div>

          <div className="SendBtnDiv">
            <button
              onClick={fetchData}
              style={{
                backgroundColor: `${inputValue ? "black" : "white"}`,
              }}
              id="SendBtn"
            >
              {inputValue ? (
                <ArrowUpwardOutlinedIcon style={{ color: "white" }} />
              ) : (
                <VoiceInput
                  onTranscript={(text) => setInputValue(text)}
                  setInput={setInputValue}
                  inputVal={inputValue}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
