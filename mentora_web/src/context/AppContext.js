import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiJson, getToken, setToken } from "../utils/api";

const AppContext = createContext(null);

const localDateKey = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const syncTodayTask = (tasks, task) => {
  const isToday = task.scheduledDate === localDateKey();
  const exists = tasks.some((item) => item.id === task.id);
  if (!isToday) return tasks.filter((item) => item.id !== task.id);
  return exists
    ? tasks.map((item) => (item.id === task.id ? task : item))
    : [...tasks, task];
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    readinessScore: 0,
    streakCount: 0,
    xpPoints: 0,
    calendarDate: "",
    programStartsTomorrow: false,
    upcomingTasksCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bridgeQuestion, setBridgeQuestion] = useState(null);
  const [latestWeeklyPlan, setLatestWeeklyPlan] = useState(null);

  const loadToday = useCallback(async ({ silent = false } = {}) => {
    const token = getToken();
    if (!token) {
      setProfile(null);
      setTasks([]);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const { response, data } = await apiJson("/api/planner/today");
      if (response.status === 401) {
        setToken(null);
        setProfile(null);
        setTasks([]);
        setIsAuthenticated(false);
        return;
      }
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setStats({
          readinessScore: data.readinessScore ?? 0,
          streakCount: data.streakCount ?? 0,
          xpPoints: data.xpPoints ?? 0,
          calendarDate: data.calendarDate ?? "",
          programStartsTomorrow: data.programStartsTomorrow ?? false,
          upcomingTasksCount: data.upcomingTasksCount ?? 0,
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("خطا در همگام‌سازی با سرور:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) return null;
    const { response, data } = await apiJson("/api/auth/me");
    if (response.ok) {
      if (data.profile) setProfile(data.profile);
      if (data.latestWeeklyPlan) setLatestWeeklyPlan(data.latestWeeklyPlan);
      setIsAuthenticated(true);
      return data;
    }
    if (response.status === 401) {
      setToken(null);
      setIsAuthenticated(false);
    }
    return null;
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        await loadMe();
        await loadToday();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [loadMe, loadToday]);

  const login = useCallback(async (phone, password) => {
    const { response, data } = await apiJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),  // ← email → phone
    });
    if (!response.ok) {
      throw new Error(data.error || "ورود ناموفق بود.");
    }
    setToken(data.token);
    setProfile(data.profile);
    setIsAuthenticated(true);
    await Promise.all([loadMe(), loadToday()]);
    return data;
  }, [loadMe, loadToday]);

  const register = useCallback(async ({ fullName, phone, email, password, confirmPassword }) => {
    const { response, data } = await apiJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        phone: phone || email,
        email,
        password,
        confirmPassword,
      }),
    });
    if (!response.ok) {
      throw new Error(data.error || "ثبت‌نام ناموفق بود.");
    }
    setToken(data.token);
    setProfile(data.profile);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiJson("/api/auth/logout", { method: "POST" });
    } catch (_) {
      /* ignore */
    }
    setToken(null);
    setProfile(null);
    setTasks([]);
    setLatestWeeklyPlan(null);
    setIsAuthenticated(false);
  }, []);

  const completeOnboarding = useCallback((newProfile, newTasks) => {
    setProfile(newProfile);
    setTasks(Array.isArray(newTasks) ? newTasks : []);
    setStats((prev) => ({
      ...prev,
      calendarDate:
        prev.calendarDate ||
        new Date().toLocaleDateString("fa-IR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    }));
  }, []);

  const syncLatestWeeklyTask = useCallback((task) => {
    setLatestWeeklyPlan((plan) => {
      if (!plan || task.weeklyPlanId !== plan.id) return plan;
      const planTasks = Array.isArray(plan.tasks) ? plan.tasks : [];
      const exists = planTasks.some((item) => item.id === task.id);
      return {
        ...plan,
        tasks: exists
          ? planTasks.map((item) => (item.id === task.id ? task : item))
          : [...planTasks, task],
      };
    });
  }, []);

  const removeLatestWeeklyTask = useCallback((taskId) => {
    setLatestWeeklyPlan((plan) => plan
      ? { ...plan, tasks: (plan.tasks || []).filter((task) => task.id !== taskId) }
      : plan);
  }, []);

  const toggleTask = useCallback(async (taskId, completed) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    );

    try {
      const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setTasks((prev) => syncTodayTask(prev, data.task));
        syncLatestWeeklyTask(data.task);
      }
    } catch (err) {
      console.error("خطا در به‌روزرسانی کار:", err);
    }
  }, [syncLatestWeeklyTask]);

  const applyTaskStats = useCallback((data) => {
    setStats((prev) => ({
      ...prev,
      readinessScore: data.readinessScore ?? prev.readinessScore,
      streakCount: data.streakCount ?? prev.streakCount,
      todayProgress: data.todayProgress ?? prev.todayProgress,
      xpPoints: data.xpPoints ?? prev.xpPoints,
    }));
  }, []);

  const createTask = useCallback(async (task) => {
    const { response, data } = await apiJson("/api/planner/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(data.error || "افزودن تسک ناموفق بود.");
    }

    setTasks((prev) => syncTodayTask(prev, data.task));
    syncLatestWeeklyTask(data.task);
    applyTaskStats(data);
    return data.task;
  }, [applyTaskStats, syncLatestWeeklyTask]);

  const updateTask = useCallback(async (taskId, updates) => {
    const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(data.error || "ویرایش تسک ناموفق بود.");
    }

    setTasks((prev) => syncTodayTask(prev, data.task));
    syncLatestWeeklyTask(data.task);
    applyTaskStats(data);
    return data.task;
  }, [applyTaskStats, syncLatestWeeklyTask]);

  const deleteTask = useCallback(async (taskId) => {
    const { response, data } = await apiJson(`/api/planner/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(data.error || "حذف تسک ناموفق بود.");
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    removeLatestWeeklyTask(taskId);
    applyTaskStats(data);
    return data;
  }, [applyTaskStats, removeLatestWeeklyTask]);

  const updateProfile = useCallback((partial) => {
    setProfile((prev) => ({ ...(prev || {}), ...partial }));
  }, []);

  const value = {
    profile,
    tasks,
    stats,
    loading,
    isAuthenticated,
    bridgeQuestion,
    latestWeeklyPlan,
    setBridgeQuestion,
    completeOnboarding,
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
    updateProfile,
    login,
    register,
    logout,
    refresh: loadToday,
    loadMe,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

export default AppContext;
