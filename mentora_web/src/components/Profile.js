import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge } from "react-bootstrap";
import {
  Camera,
  PencilLine,
  Save,
  Mail,
  Phone,
  School,
  Trophy,
  Flame,
  Star,
  CreditCard,
  CalendarClock,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import ProfileSidebar from "./ProfileSideBar";

export default function Profile() {
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "آرین محمدی",
    email: "arian@example.com",
    phone: "09123456789",
    major: "ریاضی",
    grade: "دوازدهم",
    targetRank: "زیر 1000",
    bio: "برای کنکور ۱۴۰۵ تلاش می‌کنم و دنبال برنامه‌ریزی منظم‌تر هستم.",
  });

  const progressData = {
    totalProgress: 78,
    weeklyProgress: 64,
    monthlyProgress: 81,
    streak: 12,
    xp: 1450,
    completedTasks: 37,
    remainingTasks: 8,
  };

  const subscription = {
    plan: "اشتراک طلایی",
    daysLeft: 24,
    expireDate: "۱۴۰۵/۰۴/۲۰",
    status: "فعال",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = () => {
    alert("اطلاعات با موفقیت ذخیره شد");
  };

  return (
    <div style={{ direction: "rtl", background: "#f8f7ff", minHeight: "100vh", fontFamily: "Vazir, sans-serif" }}>
      <div style={{ display: "flex" }}>
        <ProfileSidebar />

        <div style={{ flexGrow: 1, padding: "24px" }}>
          <Container fluid>
            {/* Header */}
            <Card
              id="overview"
              style={{
                border: "none",
                borderRadius: "24px",
                overflow: "hidden",
                marginBottom: "24px",
                boxShadow: "0 16px 50px rgba(98,85,245,0.08)",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #6255f5, #8f84ff)",
                  padding: "32px",
                  color: "#fff",
                }}
              >
                <Row className="align-items-center g-4">
                  <Col md={8}>
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: "110px",
                            height: "110px",
                            borderRadius: "50%",
                            border: "4px solid rgba(255,255,255,0.6)",

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "48px",
                            fontWeight: "900",
                            color: "#fff",
                            background: "rgba(255,255,255,0.2)",
                            lineHeight: "1",
                          }}
                        >
                          {formData.name.slice(0, 1)}
                        </div>

                        <label
                          htmlFor="profile-upload"
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "4px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6255f5",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Camera size={18} />
                        </label>
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                        />
                      </div>

                      <div>
                        <h2 style={{ fontWeight: "900", marginBottom: "8px" }}>{formData.name}</h2>
                        <div style={{ opacity: 0.9, marginBottom: "6px" }}>
                          دانش‌آموز {formData.grade} | رشته {formData.major}
                        </div>
                        <Badge
                          bg=""
                          style={{
                            background: "rgba(255,255,255,0.18)",
                            color: "#fff",
                            padding: "8px 14px",
                            borderRadius: "999px",
                            fontWeight: "700",
                          }}
                        >
                          هدف رتبه: {formData.targetRank}
                        </Badge>
                      </div>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.14)",
                        borderRadius: "20px",
                        padding: "18px",
                      }}
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <span>پیشرفت کلی</span>
                        <strong>{progressData.totalProgress}%</strong>
                      </div>
                      <ProgressBar
                        now={progressData.totalProgress}
                        style={{ height: "10px", borderRadius: "999px" }}
                      />
                      <div className="mt-3" style={{ fontSize: "0.92rem", opacity: 0.95 }}>
                        در مسیر خیلی خوبی هستی، ادامه بده 🚀
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* Stats */}
            <Row className="g-4 mb-4">
              <Col md={6} lg={3}>
                <Card style={statCardStyle}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={statLabel}>استمرار</div>
                        <div style={statValue}>{progressData.streak} روز</div>
                      </div>
                      <Flame color="#ff7a59" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card style={statCardStyle}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={statLabel}>XP</div>
                        <div style={statValue}>{progressData.xp}</div>
                      </div>
                      <Star color="#f5b700" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card style={statCardStyle}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={statLabel}>کارهای انجام‌شده</div>
                        <div style={statValue}>{progressData.completedTasks}</div>
                      </div>
                      <Trophy color="#6255f5" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card style={statCardStyle}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={statLabel}>کارهای باقی‌مانده</div>
                        <div style={statValue}>{progressData.remainingTasks}</div>
                      </div>
                      <BarChart3 color="#20c997" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Edit profile */}
            <Card
              style={sectionCardStyle}
              id="settings"
              className="mb-4"
            >
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <PencilLine size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    ویرایش اطلاعات کاربری
                  </h5>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>نام و نام خانوادگی</Form.Label>
                      <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ایمیل</Form.Label>
                      <Form.Control
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>شماره موبایل</Form.Label>
                      <Form.Control
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>رشته</Form.Label>
                      <Form.Control
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>پایه</Form.Label>
                      <Form.Control
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>هدف رتبه</Form.Label>
                      <Form.Control
                        name="targetRank"
                        value={formData.targetRank}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>درباره من</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    onClick={handleSave}
                    style={{
                      background: "#6255f5",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 18px",
                      fontWeight: "700",
                    }}
                  >
                    <Save size={18} className="ms-2" />
                    ذخیره تغییرات
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Progress */}
            <Card
              style={sectionCardStyle}
              id="progress"
              className="mb-4"
            >
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <BarChart3 size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    وضعیت پیشرفت
                  </h5>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>پیشرفت هفتگی</span>
                    <strong>{progressData.weeklyProgress}%</strong>
                  </div>
                  <ProgressBar now={progressData.weeklyProgress} style={progressStyle} />
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>پیشرفت ماهانه</span>
                    <strong>{progressData.monthlyProgress}%</strong>
                  </div>
                  <ProgressBar now={progressData.monthlyProgress} style={progressStyle} />
                </div>

                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>پیشرفت کلی</span>
                    <strong>{progressData.totalProgress}%</strong>
                  </div>
                  <ProgressBar now={progressData.totalProgress} style={progressStyle} />
                </div>
              </Card.Body>
            </Card>

            {/* Subscription */}
            <Card
              style={sectionCardStyle}
              id="subscription"
              className="mb-4"
            >
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <CreditCard size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    اطلاعات اشتراک
                  </h5>
                </div>

                <Row className="g-4">
                  <Col md={4}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div style={statLabel}>نوع پلن</div>
                        <div style={statValue}>{subscription.plan}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div style={statLabel}>روز باقی‌مانده</div>
                        <div style={statValue}>{subscription.daysLeft} روز</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div style={statLabel}>تاریخ انقضا</div>
                        <div style={statValue}>{subscription.expireDate}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div
                  className="mt-4"
                  style={{
                    background: "#f8f7ff",
                    borderRadius: "16px",
                    padding: "18px",
                    color: "#4b427d",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <CalendarClock size={18} color="#6255f5" />
                    <strong>وضعیت اشتراک: {subscription.status}</strong>
                  </div>
                  <div style={{ lineHeight: "2" }}>
                    اشتراک شما فعال است و تا <strong>{subscription.expireDate}</strong> معتبر می‌باشد.
                  </div>
                  <Button
                    className="mt-3"
                    style={{
                      background: "#6255f5",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "700",
                    }}
                  >
                    تمدید اشتراک
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Security */}
            <Card style={sectionCardStyle} id="security">
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <ShieldCheck size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    امنیت حساب
                  </h5>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Mail size={16} color="#6255f5" />
                          <strong>ایمیل تایید شده</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>{formData.email}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Phone size={16} color="#6255f5" />
                          <strong>شماره تماس</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>{formData.phone}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <School size={16} color="#6255f5" />
                          <strong>وضعیت تحصیلی</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>
                          {formData.grade} - رشته {formData.major} - هدف رتبه {formData.targetRank}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
}

const statCardStyle = {
  border: "none",
  borderRadius: "20px",
  boxShadow: "0 12px 35px rgba(98,85,245,0.07)",
  background: "#fff",
};

const sectionCardStyle = {
  border: "none",
  borderRadius: "24px",
  boxShadow: "0 12px 35px rgba(98,85,245,0.07)",
  background: "#fff",
};

const miniCardStyle = {
  border: "1px solid #f0edff",
  borderRadius: "18px",
  background: "#fcfbff",
};

const statLabel = {
  color: "#7b74a7",
  fontSize: "0.95rem",
  marginBottom: "6px",
};

const statValue = {
  color: "#2a1f68",
  fontSize: "1.35rem",
  fontWeight: "800",
};

const inputStyle = {
  borderRadius: "12px",
  padding: "12px 14px",
  border: "1px solid #e7e2ff",
  background: "#fcfbff",
};

const progressStyle = {
  height: "10px",
  borderRadius: "999px",
};
