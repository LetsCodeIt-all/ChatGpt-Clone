import React, { useRef, useState, useEffect } from "react";
import loadingGif from "./assets/loading.gif"; // keep if used elsewhere
import NavBar from "./NavBar";
import MsgBox from "./MsgBox";
import "./App.scss";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function App() {
  const [msg, setMsg] = useState([]);
  const [copiedReqIndex, setCopiedReqIndex] = useState(null); // index of copied request
  const [copiedResIndex, setCopiedResIndex] = useState(null); // index of copied response

  const divWithChatRef = useRef(null);
  const initialHeight = useRef(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    if (divWithChatRef.current) {
      divWithChatRef.current.scrollTop = divWithChatRef.current.scrollHeight;
    }
  }, [msg]);

  // Detect keyboard open/close using innerHeight fallback
  useEffect(() => {
    const handleResize = () => {
      if (!initialHeight.current) initialHeight.current = window.innerHeight;
      // threshold 150 px — tweak if necessary
      if (window.innerHeight < initialHeight.current - 150) {
        setKeyboardOpen(true);
      } else {
        setKeyboardOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // copy text (req or res)
  const copyFN = async (type, index, data) => {
    try {
      await navigator.clipboard.writeText(data);
      if (type === "req") {
        setCopiedReqIndex(index);
        setTimeout(() => setCopiedReqIndex(null), 2000);
      } else {
        setCopiedResIndex(index);
        setTimeout(() => setCopiedResIndex(null), 2000);
      }
    } catch (e) {
      // fallback: do nothing or show toast
      console.error("Copy failed", e);
    }
  };

  return (
    <div className="AppContainer">
      <p id="Notice">
        <marquee behavior="scroll" direction="left">
          * Currently We only take OCR of Image and pdf Provided
        </marquee>
      </p>

      <div className="HalfPart">
        <div className="DivWithNav">
          <NavBar />
        </div>

        <div className="divWithChat" ref={divWithChatRef}>
          {msg.map(({ ImgUrls, Req, Res }, idx) => (
            <div key={idx} className="messageBlock">
              <div className="Req">
                <div>
                  <div className="ReqImg">
                    {ImgUrls &&
                      ImgUrls.map((url, uidx) => (
                        <div className="image-container" key={uidx}>
                          <img src={url} alt="" height="100px" width="100px" />
                        </div>
                      ))}
                  </div>
                  <h4>
                    {Req}
                    {copiedReqIndex === idx ? (
                      <CheckIcon fontSize="small" className="copy_Icon" />
                    ) : (
                      <ContentCopyIcon
                        fontSize="small"
                        className="copy_Icon"
                        onClick={() => copyFN("req", idx, Req)}
                      />
                    )}
                  </h4>
                </div>
              </div>

              <div className="Res">
                {typeof Res === "string" && Res.startsWith("https:") ? (
                  <img src={Res} height="200px" width="200px" alt="generated" />
                ) : Res === "..." ? (
                  <img
                    src={loadingGif}
                    height="50px"
                    width="50px"
                    alt="loading"
                  />
                ) : (
                  <p>
                    {Res}
                    {copiedResIndex === idx ? (
                      <CheckIcon fontSize="small" className="copy_Icon" />
                    ) : (
                      <ContentCopyIcon
                        fontSize="small"
                        className="copy_Icon"
                        onClick={() => copyFN("res", idx, Res)}
                      />
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="ExtraSpace" style={{ height: 120 }} />
        </div>

        <div className="MainHead">
          <h1>Krishna's ChatGPT</h1>
        </div>
      </div>

      <div className="AnotherPart">
        <div className="InputBoxDown">
          <MsgBox
            setMsg={setMsg}
            msg={msg}
            keyboardOpen={keyboardOpen}
            setKeyboardOpen={setKeyboardOpen}
          />
        </div>
      </div>

      <div className="Footer">
        <p>
          By messaging ChatGPT, you agree to our <a href="#">Terms</a> and have
          read our <a href="#">Privacy Policy</a>. See{" "}
          <a href="#">Cookie Preferences</a>.
        </p>
      </div>
    </div>
  );
}

export default App;
