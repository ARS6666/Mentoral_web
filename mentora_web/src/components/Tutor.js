import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  Send,
  Bot,
  User,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
  X,
} from "lucide-react";
import "katex/dist/katex.min.css";

export default function Tutor({
  profile,
  initialQuestion,
  onClearInitialQuestion,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      content:
        `سلام قهرمان! من **منتورا** مربی هوشمند تو هستم. 🌟\n\nامروز چه سوال یا مبحثی رو برات کالبدشکافی کنیم؟ هر سوال ریاضی، فیزیک، زیست یا شیمی که برات مبهم هست رو اینجا بفرست تا با هم به ساده‌ترین روش تستی و تشریحی حلش کنیم!`,
      timestamp: new Date().toLocaleTimeString("fa-IR", {
        hour: "numeric",
        minute: "numeric",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (textToSend, action) => {
    const userText = textToSend.trim();
    const imageToSend = action ? null : selectedImage;
    const previewToSend = action ? "" : imagePreview;

    if (!userText && !action && !imageToSend) return;

    const userMsgId = Date.now().toString();

    const newUserMessage = {
      id: userMsgId,
      role: "user",
      content:
        userText ||
        (action === "simpler" ? "ساده‌تر بگو" : "روش تست‌زنی دیگر"),
      timestamp: new Date().toLocaleTimeString("fa-IR", {
        hour: "numeric",
        minute: "numeric",
      }),
    };

    if (!userText && imageToSend) {
      newUserMessage.content = "تصویر سوال ارسال شد.";
    }

    if (previewToSend) {
      newUserMessage.imagePreview = previewToSend;
    }

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setLoading(true);

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const formData = new FormData();
      formData.append("message", userText);
      formData.append("history", JSON.stringify(historyPayload));

      if (action) {
        formData.append("action", action);
      }

      if (imageToSend) {
        formData.append("image", imageToSend);
      }

      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "در اتصال به سرور خللی ایجاد شد.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString("fa-IR", {
            hour: "numeric",
            minute: "numeric",
          }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content:
            err instanceof Error
              ? err.message
              : "متاسفانه خطایی در دریافت پاسخ مربی به وجود آمد.",
          timestamp: new Date().toLocaleTimeString("fa-IR", {
            hour: "numeric",
            minute: "numeric",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    handleSendMessage("", type);
  };

  return (
    <div
      className="d-flex flex-column flex-grow-1 h-100 mx-auto position-relative"
      style={{
        width: "100%",
        maxWidth: "1100px",
        minHeight: "calc(100vh - 64px)",
        fontFamily: "Tahoma, Arial, sans-serif",
        backgroundColor: "#fcfbf9",
        direction: "rtl",
        borderLeft: "1px solid #f3f4f6",
        borderRight: "1px solid #f3f4f6",
      }}
    >
      {/* Header */}
      <div
        className="bg-white d-flex align-items-center justify-content-between"
        style={{
          padding: "16px",
          borderBottom: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          flexShrink: 0,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center text-white"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6255f5, #4f46e5)",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
            }}
          >
            <Bot size={20} />
          </div>

          <div className="text-end">
            <h3
              className="d-flex align-items-center gap-1 mb-1"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              منتورا AI
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                }}
              ></span>
            </h3>
            <p
              className="mb-0"
              style={{
                fontSize: "10px",
                color: "#9ca3af",
                fontWeight: 300,
              }}
            >
              پاسخگویی هوشمند ۲۴ ساعته کنکور
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: "12px",
            background: "rgba(98,85,245,0.15)",
            color: "#6255f5",
            padding: "6px 10px",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          رشته {profile.major}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-grow-1 overflow-auto"
        style={{
          padding: "16px",
        }}
      >
        <div className="d-flex flex-column gap-3">
          {messages.map((m) => {
            const isModel = m.role === "model";

            return (
              <div
                key={m.id}
                className={`d-flex gap-2 ${isModel ? "justify-content-start" : "justify-content-end"}`}
              >
                {isModel && (
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#eef2ff",
                      color: "#6255f5",
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className="d-flex flex-column"
                  style={{ maxWidth: "80%" }}
                >
                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "16px",
                      fontSize: "13px",
                      lineHeight: "1.9",
                      textAlign: "right",
                      whiteSpace: "pre-wrap",
                      direction: "rtl",
                      backgroundColor: isModel ? "#ffffff" : "#6255f5",
                      color: isModel ? "#1f2937" : "#ffffff",
                      border: isModel ? "1px solid #f3f4f6" : "none",
                      borderTopRightRadius: isModel ? "0" : "18px",
                      borderTopLeftRadius: isModel ? "18px" : "0",
                      boxShadow: isModel
                        ? "0 1px 4px rgba(0,0,0,0.04)"
                        : "none",
                      fontWeight: isModel ? 400 : 500,
                    }}
                  >
                    {m.imagePreview && (
                      <img
                        src={m.imagePreview}
                        alt="Question upload"
                        style={{
                          marginBottom: "12px",
                          maxHeight: "224px",
                          width: "100%",
                          borderRadius: "14px",
                          objectFit: "contain",
                          background: "rgba(255,255,255,0.2)",
                        }}
                      />
                    )}

                    {isModel ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => (
                            <p style={{ marginBottom: "8px" }}>{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul style={{ margin: "8px 0", paddingRight: "20px" }}>
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol style={{ margin: "8px 0", paddingRight: "20px" }}>
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li style={{ lineHeight: "1.8" }}>{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong style={{ fontWeight: 900, color: "#111827" }}>
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code
                              style={{
                                borderRadius: "6px",
                                background: "#f3f4f6",
                                padding: "2px 6px",
                                fontSize: "12px",
                                color: "#1f2937",
                              }}
                            >
                              {children}
                            </code>
                          ),
                          div: ({ className, children }) => (
                            <div
                              className={className}
                              style={
                                className === "math math-display"
                                  ? {
                                      margin: "12px 0",
                                      overflowX: "auto",
                                      padding: "4px 0",
                                    }
                                  : {}
                              }
                            >
                              {children}
                            </div>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: "9px",
                      color: "#9ca3af",
                      marginTop: "4px",
                      padding: "0 4px",
                      alignSelf: "flex-start",
                      fontWeight: 300,
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {!isModel && (
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      color: "#4b5563",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="d-flex gap-2 justify-content-start">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#eef2ff",
                  color: "#6255f5",
                  border: "1px solid #c7d2fe",
                }}
              >
                <Bot size={16} />
              </div>

              <div
                className="d-flex align-items-center gap-2 bg-white"
                style={{
                  borderRadius: "18px",
                  borderTopRightRadius: "0",
                  border: "1px solid #f3f4f6",
                  padding: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#6255f5",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#6255f5",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#6255f5",
                    display: "inline-block",
                  }}
                ></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          background: "linear-gradient(to top, #fcfbf9, rgba(252,251,249,0.95), transparent)",
          padding: "16px",
          borderTop: "1px solid #f3f4f6",
          flexShrink: 0,
        }}
      >
        <div className="d-flex flex-column gap-3">
          {imagePreview && (
            <div
              className="d-flex align-items-center gap-3 bg-white"
              style={{
                borderRadius: "18px",
                border: "1px solid #c7d2fe",
                padding: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={imagePreview}
                alt="Selected question"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "1px solid #f3f4f6",
                }}
              />

              <div className="flex-grow-1 text-end" style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedImage?.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#9ca3af",
                  }}
                >
                  تصویر همراه سوال ارسال می‌شود
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelectedImage}
                className="btn"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  padding: "8px",
                  color: "#9ca3af",
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => handleAction("simpler")}
              disabled={loading || messages.length < 2}
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: "#fffbeb",
                color: "#b45309",
                fontWeight: 700,
                fontSize: "12px",
                padding: "10px 12px",
                border: "1px solid #fde68a",
                borderRadius: "14px",
              }}
            >
              <HelpCircle size={14} />
              ساده‌تر بگو 😊
            </button>

            <button
              type="button"
              onClick={() => handleAction("alternative")}
              disabled={loading || messages.length < 2}
              className="btn flex-fill d-flex align-items-center justify-content-center gap-1"
              style={{
                background: "#eef2ff",
                color: "#4338ca",
                fontWeight: 700,
                fontSize: "12px",
                padding: "10px 12px",
                border: "1px solid #c7d2fe",
                borderRadius: "14px",
              }}
            >
              <RefreshCw size={14} />
              روش تست‌زنی دیگر ⚡
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="d-flex gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={loading}
              className="btn"
              style={{
                padding: "12px",
                borderRadius: "14px",
                border: selectedImage
                  ? "1px solid #6255f5"
                  : "1px solid #e5e7eb",
                background: selectedImage ? "rgba(98,85,245,0.1)" : "#ffffff",
                color: selectedImage ? "#6255f5" : "#6b7280",
              }}
            >
              <ImageIcon size={16} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="سوال درسی جدید خود را بپرسید..."
              className="form-control"
              style={{
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                padding: "12px 16px",
                fontSize: "12px",
                textAlign: "right",
                color: "#1f2937",
              }}
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)}
              className="btn text-white"
              style={{
                background: "#6255f5",
                padding: "12px",
                borderRadius: "14px",
                border: "none",
                boxShadow: "0 2px 6px rgba(98,85,245,0.2)",
              }}
            >
              <Send size={16} style={{ transform: "rotate(180deg)" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
