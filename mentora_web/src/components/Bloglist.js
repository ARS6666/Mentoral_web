import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts.js";
import { Helmet } from "react-helmet-async";
import {
  BookOpen,
  Clock,
  Search,
  ArrowLeft,
  Sparkles,
  X,
  FileText,
} from "lucide-react";

export default function BlogList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(blogPosts.map((p) => p.category).filter(Boolean))
    );
    return ["همه", ...cats];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCat =
        selectedCategory === "همه" || post.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <Helmet>
        <title>وبلاگ منتورا | مقالات و راهنماهای آموزشی کنکور</title>
        <meta
          name="description"
          content="جدیدترین مقالات درباره روش‌های مطالعه رتبه‌های برتر، معرفی تکنیک‌های تندخوانی و کاربرد هوش مصنوعی در آموزش."
        />
        <link rel="canonical" href="https://mentoralearn.ir/blog" />
      </Helmet>

      <main
        style={{
          direction: "rtl",
          textAlign: "right",
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "10px 0 48px",
          fontFamily: "'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            background:
              "radial-gradient(circle at 90% 15%, rgba(78, 154, 137, 0.18), transparent 35%), linear-gradient(135deg, #1F2E2A, #182523)",
            borderRadius: "24px",
            padding: "clamp(24px, 4vw, 36px)",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(18, 26, 24, 0.12)",
            marginBottom: "28px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(78, 154, 137, 0.22)",
              border: "1px solid rgba(78, 154, 137, 0.4)",
              color: "#8CF2CE",
              padding: "5px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={13} />
            وبلاگ و یادداشت‌های آموزشی منتورا
          </div>

          <h1
            style={{
              fontWeight: 900,
              fontSize: "clamp(24px, 3.5vw, 32px)",
              margin: "0 0 10px",
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
            }}
          >
            دانش، استراتژی و اصول مطالعه رتبه‌های برتر
          </h1>

          <div
            style={{
              width: "44px",
              height: "3px",
              background: "#4E9A89",
              borderRadius: "999px",
              margin: "12px 0 16px",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "rgba(245, 246, 243, 0.82)",
              lineHeight: "1.9",
              fontSize: "13.5px",
              maxWidth: "760px",
            }}
          >
            مجموعه‌ای از مقاله‌های تخصصی، روش‌های نوین تست‌زنی، تکنیک‌های افزایش تراز
            و مدیریت ریتم مطالعه که توسط تیم مشاوره‌ای منتورا تدوین شده است.
          </p>
        </section>

        {/* Search & Category Filter Controls */}
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E5E1",
            borderRadius: "18px",
            padding: "16px 20px",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(18, 26, 24, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Search
              size={17}
              style={{
                position: "absolute",
                right: "14px",
                color: "#778582",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در بین مقالات و موضوعات آموزشی..."
              style={{
                width: "100%",
                height: "44px",
                padding: "0 42px 0 38px",
                border: "1.5px solid #E1E5E1",
                borderRadius: "12px",
                background: "#FAFBF9",
                color: "#121A18",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  left: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#778582",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none",
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    border: isSelected
                      ? "1px solid #3A8778"
                      : "1px solid #E1E5E1",
                    borderRadius: "999px",
                    padding: "6px 14px",
                    background: isSelected ? "#3A8778" : "#FAFBF9",
                    color: isSelected ? "#FFFFFF" : "#55625F",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.18s ease",
                    fontFamily: "inherit",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Articles Count Note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#55625F",
            padding: "0 4px",
          }}
        >
          <span>
            نمایش <strong>{filteredPosts.length}</strong> مقاله آموزشی
          </span>
          {selectedCategory !== "همه" && (
            <span>دسته‌بندی: {selectedCategory}</span>
          )}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px dashed #E1E5E1",
              borderRadius: "18px",
              padding: "48px 24px",
              textAlign: "center",
              color: "#55625F",
            }}
          >
            <BookOpen
              size={36}
              style={{ color: "#3A8778", marginBottom: "12px", opacity: 0.8 }}
            />
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800 }}>
              مقاله‌ای یافت نشد
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "12.5px" }}>
              عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را روی «همه» قرار دهید.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("همه");
              }}
              style={{
                background: "#3A8778",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                padding: "8px 18px",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              پاک‌سازی فیلترها
            </button>
          </div>
        )}

        {/* Articles Grid */}
        <div className="row g-4">
          {filteredPosts.map((post) => (
            <div className="col-12 col-md-6" key={post.slug}>
              <article
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(18, 26, 24, 0.04)",
                  border: "1px solid #E1E5E1",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#CBD3CB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#E1E5E1";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(58, 135, 120, 0.12)",
                        color: "#3A8778",
                        border: "1px solid rgba(78, 154, 137, 0.25)",
                        padding: "4px 12px",
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

                  <h2
                    style={{
                      fontWeight: 800,
                      fontSize: "19px",
                      lineHeight: "1.65",
                      margin: "0 0 10px",
                      color: "#121A18",
                    }}
                  >
                    {post.title}
                  </h2>

                  <p
                    style={{
                      color: "#55625F",
                      lineHeight: "1.85",
                      fontSize: "13px",
                      margin: "0 0 16px",
                    }}
                  >
                    {post.description}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "14px",
                    borderTop: "1px solid #F0F2F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "11.5px", color: "#778582", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <FileText size={13} />
                    منتورا بلاگ
                  </span>

                  <Link
                    to={`/blog/${post.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "12px",
                      background: "#3A8778",
                      color: "#FFFFFF",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      boxShadow: "0 4px 12px rgba(58, 135, 120, 0.2)",
                      transition: "background 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2F7063";
                      e.currentTarget.style.transform = "translateX(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#3A8778";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    خواندن مقاله
                    <ArrowLeft size={14} />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
