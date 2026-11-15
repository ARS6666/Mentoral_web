import React, { useState } from "react";
import {
  Check,
  Flame,
  Sparkles,
  BookOpen,
  Clock,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
  ArrowLeft,
  Target,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Link } from "react-router-dom";
import "./Today.css";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const taskTimeRange = (duration = "") => {
  const matches =
    String(duration)
      .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
      .match(/(?:[01]\d|2[0-3]):[0-5]\d/g) || [];

  return {
    startTime: matches[0] || "",
    endTime: matches[1] || "",
  };
};

const validTimeRange = ({ startTime, endTime }) =>
  Boolean(startTime && endTime && startTime < endTime);

const taskPayload = (values) => ({
  title: values.title,
  duration: `${values.startTime} تا ${values.endTime}`,
  category: values.category,
  scheduledDate: values.scheduledDate,
});

const getCategoryClass = (category) => {
  switch (category) {
    case "ریاضی":
      return "today-page-tag math";
    case "شیمی":
      return "today-page-tag chemistry";
    case "فیزیک":
      return "today-page-tag physics";
    case "زیست‌شناسی":
    case "زیست":
      return "today-page-tag biology";
    default:
      return "today-page-tag general";
  }
};

const todayIso = formatLocalDate(new Date());

const emptyTaskForm = {
  title: "",
  startTime: "",
  endTime: "",
  category: "عمومی",
  scheduledDate: todayIso,
};

export default function Today() {
  const {
    tasks = [],
    stats = {},
    profile = {},
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
  } = useApp();

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyTaskForm);
  const [taskActionError, setTaskActionError] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const formattedDate = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const {
    streakCount = 0,
    xpPoints = 0,
    programStartsTomorrow,
    upcomingTasksCount,
  } = stats || {};

  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedCount = safeTasks.filter((task) => task?.completed).length;

  const currentProgress =
    safeTasks.length > 0
      ? Math.round((completedCount / safeTasks.length) * 100)
      : 0;

  const targetRankText = safeProfile?.targetRank || "ثبت نشده";
  const firstName = (safeProfile?.fullName || safeProfile?.name || "").split(" ")[0];

  const handleToggleTask = (task) => {
    if (!toggleTask || task?.id === undefined || task?.id === null) return;
    toggleTask(task.id, !task.completed);
  };

  const startEditTask = (task) => {
    setTaskActionError("");
    setEditingTaskId(task.id);
    setEditingForm({
      title: task.title || "",
      ...taskTimeRange(task.duration),
      category: task.category || "عمومی",
      scheduledDate: task.scheduledDate || todayIso,
    });
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!createTask) return;

    if (!taskForm.title.trim()) {
      setTaskActionError("عنوان تسک الزامی است.");
      return;
    }

    if (!validTimeRange(taskForm)) {
      setTaskActionError("ساعت شروع باید قبل از ساعت پایان باشد.");
      return;
    }

    setSavingTask(true);
    setTaskActionError("");

    try {
      await createTask(taskPayload(taskForm));
      setTaskForm(emptyTaskForm);
      setShowAddTask(false);
    } catch (err) {
      setTaskActionError(err.message || "افزودن تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();
    if (!updateTask || !editingTaskId) return;

    if (!editingForm.title.trim()) {
      setTaskActionError("عنوان تسک الزامی است.");
      return;
    }

    if (!validTimeRange(editingForm)) {
      setTaskActionError("ساعت شروع باید قبل از ساعت پایان باشد.");
      return;
    }

    setSavingTask(true);
    setTaskActionError("");

    try {
      await updateTask(editingTaskId, taskPayload(editingForm));
      setEditingTaskId(null);
    } catch (err) {
      setTaskActionError(err.message || "ویرایش تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!deleteTask || !taskId) return;
    setSavingTask(true);
    setTaskActionError("");

    try {
      await deleteTask(taskId);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
    } catch (err) {
      setTaskActionError(err.message || "حذف تسک ناموفق بود.");
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <main className="today-page" dir="rtl">
      <div className="today-page-container">
        {/* Minimal Clean Header */}
        <header className="today-page-header">
          <div className="today-page-header-text">
            <div className="today-page-date">
              <span className="today-page-date-dot" />
              {formattedDate}
            </div>

            <h1>
              {firstName ? `سلام ${firstName}، برنامه امروزت اینجاست` : "برنامه مطالعه امروز"}
            </h1>

            <p>
              {safeTasks.length > 0
                ? `${completedCount} از ${safeTasks.length} کار تکمیل شده است (${currentProgress}٪ پیشرفت)`
                : "تسک‌های امروزت را مدیریت کن و با آرامش پیش برو."}
            </p>
          </div>

          <div className="today-page-header-actions">
            <button
              type="button"
              onClick={() => {
                setTaskActionError("");
                setShowAddTask((prev) => !prev);
              }}
              className={showAddTask ? "today-page-add-button is-close" : "today-page-add-button"}
            >
              {showAddTask ? <X size={15} /> : <Plus size={15} />}
              <span>{showAddTask ? "بستن فرم" : "افزودن تسک"}</span>
            </button>
          </div>
        </header>

        {/* Compact Single-Line Stats Ribbon */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(58, 135, 120, 0.12)",
                color: "#3A8778",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check size={16} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "10.5px", color: "#55625F" }}>پیشرفت امروز</span>
              <strong style={{ fontSize: "14px", color: "#121A18", fontWeight: 800 }}>{currentProgress}٪ انجام‌شده</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Flame size={16} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "10.5px", color: "#55625F" }}>استمرار مداوم</span>
              <strong style={{ fontSize: "14px", color: "#121A18", fontWeight: 800 }}>{streakCount} روز پیوسته</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(168, 85, 247, 0.12)",
                color: "#9333EA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "10.5px", color: "#55625F" }}>امتیاز تجربه (XP)</span>
              <strong style={{ fontSize: "14px", color: "#121A18", fontWeight: 800 }}>{xpPoints} XP</strong>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E5E1",
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Target size={16} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "10.5px", color: "#55625F" }}>هدف رتبه</span>
              <strong style={{ fontSize: "14px", color: "#121A18", fontWeight: 800 }}>{targetRankText}</strong>
            </div>
          </div>
        </section>

        {/* Main 2-Column Focus Layout */}
        <section className="today-page-main-grid">
          {/* Main Tasks Panel (Front & Center) */}
          <section className="today-page-panel">
            <div className="today-page-panel-header">
              <div className="today-page-panel-title">
                <div className="today-page-panel-icon">
                  <BookOpen size={17} />
                </div>
                <div>
                  <h2>تسک‌های مطالعه امروز</h2>
                  <span>
                    {safeTasks.length
                      ? `${completedCount} از ${safeTasks.length} کار تکمیل شده`
                      : "در انتظار ثبت کارهای امروز"}
                  </span>
                </div>
              </div>
            </div>

            {taskActionError && (
              <div className="today-page-error">{taskActionError}</div>
            )}

            {showAddTask && (
              <div className="today-page-editor-wrap">
                <TaskEditor
                  values={taskForm}
                  onChange={setTaskForm}
                  onSubmit={handleAddTask}
                  onCancel={() => setShowAddTask(false)}
                  saving={savingTask}
                  submitLabel="افزودن تسک"
                />
              </div>
            )}

            {safeTasks.length === 0 ? (
              <div className="today-page-empty">
                <div className="today-page-empty-icon">
                  <BookOpen size={22} />
                </div>
                <h3>
                  {programStartsTomorrow
                    ? "برنامه مطالعاتی از فردا آغاز می‌شود"
                    : "هنوز تسکی برای امروز ثبت نشده است"}
                </h3>
                <p>
                  {programStartsTomorrow
                    ? `${upcomingTasksCount || ""} تسک برای فردا در انتظار شماست.`
                    : "می‌توانید با دکمه بالا تسک جدید اضافه کنید یا برنامه هفتگی خود را تنظیم نمایید."}
                </p>
                <Link to="/planningassistant" className="today-page-empty-button">
                  رفتن به دستیار برنامه‌ریزی
                  <ArrowLeft size={14} />
                </Link>
              </div>
            ) : (
              <div className="today-page-task-list">
                {safeTasks.map((task, index) => {
                  const isEditing = editingTaskId === task?.id;

                  if (isEditing) {
                    return (
                      <div key={task?.id ?? index} className="today-page-edit-row">
                        <TaskEditor
                          values={editingForm}
                          onChange={setEditingForm}
                          onSubmit={handleSaveTask}
                          onCancel={() => setEditingTaskId(null)}
                          saving={savingTask}
                          submitLabel="ذخیره تغییرات"
                        />
                      </div>
                    );
                  }

                  return (
                    <article
                      key={task?.id ?? index}
                      className={`today-page-task ${task?.completed ? "is-completed" : ""}`}
                    >
                      <button
                        type="button"
                        className={`today-page-check ${task?.completed ? "checked" : ""}`}
                        onClick={() => handleToggleTask(task)}
                        aria-label={task?.completed ? "بازگشت به انجام نشده" : "علامت‌گذاری به عنوان انجام‌شده"}
                      >
                        {task?.completed && <Check size={14} strokeWidth={3} />}
                      </button>

                      <div className="today-page-task-content">
                        <h3>{task?.title || "بدون عنوان"}</h3>
                        <div className="today-page-task-meta">
                          <span>
                            <Clock size={12} />
                            {task?.duration || "زمان مشخص نشده"}
                          </span>
                          {task?.completed && (
                            <span className="today-page-done-text">انجام شد</span>
                          )}
                        </div>
                      </div>

                      <span className={getCategoryClass(task?.category)}>
                        {task?.category || "عمومی"}
                      </span>

                      <div className="today-page-task-actions">
                        <button
                          type="button"
                          onClick={() => startEditTask(task)}
                          className="today-page-icon-button"
                          aria-label="ویرایش تسک"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="today-page-icon-button danger"
                          aria-label="حذف تسک"
                          disabled={savingTask}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="today-page-panel-footer">
              <Link to="/planningassistant" className="today-page-week-link">
                مشاهده و ویرایش کل برنامه هفتگی
                <ArrowLeft size={14} />
              </Link>
            </div>
          </section>

          {/* Quiet Tools Sidebar (Single instance of Focus & Tutor) */}
          <aside className="today-page-tools">
            {/* Focus Timer Widget */}
            <div className="today-page-timer-card">
              <div className="today-page-timer-decoration" />
              <div className="today-page-timer-label">
                <Clock size={15} />
                تایمر تمرکز پومودورو
              </div>
              <div className="today-page-timer">25:00</div>
              <p>جلسه مطالعه عمیق و بدون حواس‌پرتی</p>
              <Link to="/focustimer" className="today-page-timer-button">
                شروع جلسه تمرکز
                <ArrowLeft size={14} />
              </Link>
            </div>

            {/* AI Tutor Card */}
            <div className="today-page-tutor-card">
              <div className="today-page-tutor-icon">
                <MessageSquare size={17} />
              </div>
              <h3>اشکال درسی داری؟</h3>
              <p>معلم هوشمند منتورا آماده است سوالات و تست‌های دشوار را برایت حل کند.</p>
              <Link to="/tutor" className="today-page-tutor-button">
                پرسش از معلم هوشمند
                <ArrowLeft size={14} />
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function TaskEditor({
  values,
  onChange,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
}) {
  const updateField = (field, value) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={onSubmit} className="today-page-editor">
      <div className="today-page-editor-title">
        <div>
          <strong>{submitLabel === "افزودن تسک" ? "تسک جدید" : "ویرایش تسک"}</strong>
          <span>عنوان، بازه زمانی و درس مربوطه را وارد کنید.</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="today-page-close-editor"
          aria-label="انصراف"
        >
          <X size={15} />
        </button>
      </div>

      <div className="today-page-editor-grid">
        <div className="today-page-field today-page-field-span-2">
          <label htmlFor="task-title-input">عنوان تسک</label>
          <input
            id="task-title-input"
            type="text"
            value={values.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="مثلاً: تست‌زنی ژنتیک ۱۰ تست"
            autoFocus
          />
        </div>

        <div className="today-page-field">
          <label htmlFor="task-start-time">زمان شروع و پایان</label>
          <div className="today-page-time-fields">
            <input
              id="task-start-time"
              type="time"
              value={values.startTime}
              onChange={(e) => updateField("startTime", e.target.value)}
            />
            <span>تا</span>
            <input
              type="time"
              value={values.endTime}
              onChange={(e) => updateField("endTime", e.target.value)}
            />
          </div>
        </div>

        <div className="today-page-field">
          <label htmlFor="task-category-select">درس</label>
          <select
            id="task-category-select"
            value={values.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option value="عمومی">عمومی</option>
            <option value="زیست">زیست‌شناسی</option>
            <option value="شیمی">شیمی</option>
            <option value="فیزیک">فیزیک</option>
            <option value="ریاضی">ریاضی</option>
          </select>
        </div>
      </div>

      <div className="today-page-editor-actions">
        <button
          type="submit"
          className="today-page-save-button"
          disabled={saving}
        >
          <Save size={14} />
          {saving ? "در حال ثبت..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="today-page-cancel-button"
          disabled={saving}
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
