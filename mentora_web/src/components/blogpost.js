import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts.js";
import { Helmet } from "react-helmet-async";
import AdSlot from "./AdSlot";
import {
  Clock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { showToast } from "../utils/notify";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main
        style={{
          direction: "rtl",
          textAlign: "right",
          maxWidth: "860px",
          margin: "40px auto",
          padding: "30px",
          background: "#FFFFFF",
          border: "1px solid #E1E5E1",
          borderRadius: "18px",
          fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
        }}
      >
        <h2 style={{ fontWeight: 800, marginBottom: "12px" }}>مقاله پیدا نشد</h2>
        <p style={{ color: "#55625F", marginBottom: "20px" }}>
          ممکن است آدرس مقاله تغییر کرده باشد یا حذف شده باشد.
        </p>
        <Link
          to="/blog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "#3A8778",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          <ArrowRight size={15} />
          بازگشت به همه مقالات
        </Link>
      </main>
    );
  }

  const paragraphIndexes = post.content
    .map((block, index) => (block.type === "p" ? index : -1))
    .filter((index) => index !== -1);

  const firstAdIndex =
    paragraphIndexes[Math.floor(paragraphIndexes.length / 3)] ?? -1;

  const secondAdIndex =
    paragraphIndexes[Math.floor((paragraphIndexes.length * 2) / 3)] ?? -1;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("لینک مقاله در حافظه کپی شد", "success");
    }
  };

  return (
    <>
      <Helmet>
        <title>{post ? `${post.title} | وبلاگ منتورا` : "وبلاگ منتورا"}</title>
        <meta
          name="description"
          content={post ? post.description : "مقالات آموزشی تفصیلی منتورا"}
        />
        <link rel="canonical" href={`https://mentoralearn.ir/blog/${slug}`} />
      </Helmet>

      <main
        style={{
          direction: "rtl",
          textAlign: "right",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "10px 0 48px",
          fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Breadcrumb Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12.5px",
            color: "#55625F",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/home"
            style={{ color: "#55625F", textDecoration: "none" }}
          >
            داشبورد
          </Link>
          <ChevronLeft size={13} style={{ color: "#778582" }} />
          <Link
            to="/blog"
            style={{ color: "#3A8778", textDecoration: "none", fontWeight: 700 }}
          >
            وبلاگ منتورا
          </Link>
          <ChevronLeft size={13} style={{ color: "#778582" }} />
          <span style={{ color: "#121A18", fontWeight: 600 }}>
            {post.title}
          </span>
        </nav>

        {/* Article Container */}
        <article
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "clamp(22px, 4vw, 38px)",
            boxShadow: "0 10px 30px rgba(18, 26, 24, 0.04)",
            border: "1px solid #E1E5E1",
          }}
        >
          {/* Article Header */}
          <header style={{ marginBottom: "26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    background: "rgba(58, 135, 120, 0.12)",
                    color: "#3A8778",
                    border: "1px solid rgba(78, 154, 137, 0.25)",
                    padding: "4px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {post.category || "مقاله"}
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#55625F",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Clock size={13} style={{ color: "#3A8778" }} />
                  {post.readingTime || "مطالعه کوتاه"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#FAFBF9",
                  border: "1px solid #E1E5E1",
                  borderRadius: "10px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  color: "#55625F",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  transition: "all 0.18s ease",
                }}
              >
                <Share2 size={13} />
                اشتراک‌گذاری
              </button>
            </div>

            <h1
              style={{
                fontWeight: 900,
                fontSize: "clamp(22px, 3.5vw, 30px)",
                lineHeight: "1.55",
                color: "#121A18",
                margin: "0 0 14px",
                letterSpacing: "-0.5px",
              }}
            >
              {post.title}
            </h1>

            <p
              style={{
                color: "#55625F",
                fontSize: "14px",
                lineHeight: "1.9",
                margin: 0,
              }}
            >
              {post.description}
            </p>

            <div
              style={{
                width: "44px",
                height: "3px",
                background: "#4E9A89",
                borderRadius: "999px",
                margin: "18px 0 24px",
              }}
            />
          </header>

          {/* Article Body */}
          <section style={{ borderTop: "1px solid #F0F2F0", paddingTop: "20px" }}>
            {post.content.map((block, index) => {
              return (
                <React.Fragment key={index}>
                  {block.type === "h2" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "32px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: "4px",
                          height: "18px",
                          background: "#3A8778",
                          borderRadius: "999px",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <h2
                        style={{
                          fontWeight: 800,
                          fontSize: "18px",
                          color: "#121A18",
                          margin: 0,
                          lineHeight: "1.7",
                        }}
                      >
                        {block.text}
                      </h2>
                    </div>
                  )}

                  {block.type === "p" && (
                    <p
                      style={{
                        fontSize: "14.5px",
                        lineHeight: "2.15",
                        color: "#2D3A37",
                        marginBottom: "16px",
                      }}
                    >
                      {block.text}
                    </p>
                  )}

                  {block.type === "ul" && (
                    <ul
                      style={{
                        margin: "14px 0 20px",
                        paddingRight: "22px",
                        lineHeight: "2.1",
                        color: "#2D3A37",
                        fontSize: "14px",
                      }}
                    >
                      {block.items.map((item, i) => (
                        <li key={i} style={{ marginBottom: "8px" }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {index === firstAdIndex && (
                    <div style={{ margin: "32px 0" }}>
                      <AdSlot index={2} />
                    </div>
                  )}

                  {index === secondAdIndex && secondAdIndex !== firstAdIndex && (
                    <div style={{ margin: "32px 0" }}>
                      <AdSlot index={6} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Navigation & Return */}
            <div
              style={{
                marginTop: "36px",
                paddingTop: "20px",
                borderTop: "1px solid #F0F2F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <Link
                to="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "#FAFBF9",
                  border: "1px solid #E1E5E1",
                  color: "#121A18",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                  transition: "all 0.2s ease",
                }}
              >
                <ArrowRight size={16} />
                بازگشت به همه مقالات
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  to="/today"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    background: "#3A8778",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "13px",
                    boxShadow: "0 4px 14px rgba(58, 135, 120, 0.25)",
                  }}
                >
                  <Sparkles size={14} />
                  رفتن به برنامه مطالعه امروز
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
