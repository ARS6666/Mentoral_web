import React, { useEffect, useState , useCallback } from "react";
import {
  LifeBuoy,
  MessageCircle,
  Plus,
  Send,
  RefreshCw,
  Logs,
  ChevronLeft,
  Headphones,
  CircleCheck,
  Clock3,
  XCircle,
  UserRound,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiJson } from "../utils/api";

const statusTagClass = (status) => {
  if (!status) return "support-status support-status-info";

  if (status.includes("بسته") || status.includes("closed")) {
    return "support-status support-status-danger";
  }

  if (status.includes("پاسخ") || status.includes("answered")) {
    return "support-status support-status-success";
  }

  return "support-status support-status-warning";
};

const statusIcon = (status) => {
  if (status?.includes("بسته") || status?.includes("closed")) {
    return <XCircle size={12} />;
  }

  if (status?.includes("پاسخ") || status?.includes("answered")) {
    return <CircleCheck size={12} />;
  }

  return <Clock3 size={12} />;
};

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "عمومی",
    body: "",
  });

  const loadTickets = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoadingTickets(true);
    }

    try {
      const { response, data } = await apiJson("/api/support/tickets");

      if (response.ok) {
        const list = data.tickets || [];
        setTickets(list);

        setSelected((currentSelected) => {
          if (!currentSelected) return null;

          const exists = list.some(
            (ticket) => ticket.id === currentSelected.id,
          );

          return exists ? currentSelected : null;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  }, []);
  const loadTicket = async (id) => {
    if (!id) return;

    setLoadingTicket(true);

    try {
      const { response, data } = await apiJson(`/api/support/tickets/${id}`);

      if (response.ok) {
        setSelected(data.ticket);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTicket(false);
    }
  };

  const createTicket = async (event) => {
    event.preventDefault();

    if (creating) return;
    if (!form.title.trim() || !form.body.trim()) return;

    setCreating(true);

    try {
      const { response, data } = await apiJson("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({
          title: "",
          category: "عمومی",
          body: "",
        });

        if (data.ticket) {
          setSelected(data.ticket);
        }

        await loadTickets();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!selected || !message.trim() || sending) return;

    setSending(true);

    try {
      const { response } = await apiJson(
        `/api/support/tickets/${selected.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: message.trim(),
          }),
        },
      );

      if (response.ok) {
        setMessage("");
        await loadTicket(selected.id);
        await loadTickets();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);
  return (
    <>
      <Helmet>
        <title>پشتیبانی | منتورا</title>
        <meta
          name="description"
          content="ثبت تیکت، پیگیری درخواست‌ها و گفتگو با پشتیبانی منتورا."
        />
        <link rel="canonical" href="https://mentoralearn.ir/support" />
      </Helmet>

      <div className="support-page-v2">
        <div className="support-container-v2">
          <header className="support-header-v2">
            <div className="support-header-content-v2">
              <div className="support-header-icon-v2">
                <LifeBuoy size={21} />
              </div>

              <div>
                <span className="support-header-small-v2">
                  پاسخ‌گویی به مشکلات و سوالات شما
                </span>

                <h1>پشتیبانی منتورا</h1>

                <p>سوال یا مشکلی داری؟ درخواستت رو ثبت کن تا پیگیریش کنیم.</p>
              </div>
            </div>

            <button
              type="button"
              className="support-refresh-v2"
              onClick={() => loadTickets(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "support-spin-v2" : ""}
              />

              <span>{refreshing ? "در حال بروزرسانی..." : "بروزرسانی"}</span>
            </button>
          </header>

          <div className="support-grid-v2">
            {/* ایجاد تیکت */}
            <section className="support-panel-v2">
              <div className="support-panel-head-v2">
                <div className="support-title-icon-v2">
                  <Plus size={17} />
                </div>

                <div>
                  <h2>ثبت تیکت جدید</h2>
                  <span>درخواستت رو برای پشتیبانی ارسال کن</span>
                </div>
              </div>

              <form className="support-create-form-v2" onSubmit={createTicket}>
                <div className="support-field-v2">
                  <label htmlFor="support-title-v2">عنوان درخواست</label>

                  <input
                    id="support-title-v2"
                    type="text"
                    value={form.title}
                    placeholder="مثلاً مشکل در برنامه‌ریزی"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="support-field-v2">
                  <label htmlFor="support-category-v2">دسته‌بندی</label>

                  <select
                    id="support-category-v2"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="عمومی">عمومی</option>
                    <option value="مربی هوشمند">مربی هوشمند</option>
                    <option value="برنامه‌ریزی">برنامه‌ریزی</option>
                    <option value="آزمون‌ها">آزمون‌ها</option>
                  </select>
                </div>

                <div className="support-field-v2 support-description-v2">
                  <label htmlFor="support-body-v2">توضیحات</label>

                  <textarea
                    id="support-body-v2"
                    rows={7}
                    value={form.body}
                    placeholder="مشکل یا درخواست خودت رو با جزئیات توضیح بده..."
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        body: e.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="support-create-button-v2"
                  disabled={creating || !form.title.trim() || !form.body.trim()}
                >
                  {creating ? (
                    <span className="support-loader-v2" />
                  ) : (
                    <Send
                      size={16}
                      style={{
                        transform: "scaleX(-1)",
                      }}
                    />
                  )}

                  <span>{creating ? "در حال ارسال..." : "ارسال تیکت"}</span>
                </button>
              </form>
            </section>

            {/* لیست تیکت‌ها */}
            <section className="support-panel-v2 support-list-panel-v2">
              <div className="support-panel-head-v2">
                <div className="support-title-icon-v2">
                  <Logs size={17} />
                </div>

                <div>
                  <h2>درخواست‌های شما</h2>
                  <span>تیکت‌های قبلی خودت رو پیگیری کن</span>
                </div>

                {!loadingTickets && tickets.length > 0 && (
                  <div className="support-count-v2">{tickets.length}</div>
                )}
              </div>

              <div className="support-list-v2">
                {loadingTickets ? (
                  <>
                    <div className="support-ticket-skeleton-v2" />
                    <div className="support-ticket-skeleton-v2" />
                    <div className="support-ticket-skeleton-v2" />
                  </>
                ) : tickets.length === 0 ? (
                  <div className="support-empty-v2">
                    <div className="support-empty-icon-v2">
                      <MessageCircle size={24} />
                    </div>

                    <strong>هنوز تیکتی ثبت نکردی</strong>

                    <span>
                      اگر سوال یا مشکلی داری، از فرم ثبت تیکت استفاده کن.
                    </span>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const active = selected?.id === ticket.id;

                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        className={`support-ticket-v2 ${
                          active ? "support-ticket-active-v2" : ""
                        }`}
                        onClick={() => loadTicket(ticket.id)}
                      >
                        <div className="support-ticket-icon-v2">
                          <MessageCircle size={16} />
                        </div>

                        <div className="support-ticket-content-v2">
                          <strong>{ticket.title}</strong>

                          <span>برای مشاهده گفتگو کلیک کنید</span>
                        </div>

                        <div className="support-ticket-status-wrap-v2">
                          <span className={statusTagClass(ticket.status)}>
                            {statusIcon(ticket.status)}
                            {ticket.status || "در انتظار"}
                          </span>

                          <ChevronLeft
                            size={16}
                            className="support-ticket-arrow-v2"
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* گفتگو */}
            <section className="support-panel-v2 support-chat-v2">
              <div className="support-chat-header-v2">
                <div className="support-chat-user-v2">
                  <div className="support-chat-icon-v2">
                    <Headphones size={18} />
                  </div>

                  <div>
                    <h2>{selected ? selected.title : "گفتگو با پشتیبانی"}</h2>

                    <span>
                      {selected
                        ? "گفتگوی تیکت انتخاب‌شده"
                        : "یک تیکت را انتخاب کنید"}
                    </span>
                  </div>
                </div>

                {selected?.status && (
                  <span className={statusTagClass(selected.status)}>
                    {statusIcon(selected.status)}
                    {selected.status}
                  </span>
                )}
              </div>

              <div className="support-chat-content-v2">
                {!selected ? (
                  <div className="support-chat-empty-v2">
                    <div className="support-chat-empty-icon-v2">
                      <MessageCircle size={27} />
                    </div>

                    <h3>یک تیکت را انتخاب کنید</h3>

                    <p>
                      از لیست درخواست‌ها یک تیکت را انتخاب کنید تا پیام‌ها نمایش
                      داده شوند.
                    </p>
                  </div>
                ) : loadingTicket ? (
                  <div className="support-chat-loading-v2">
                    <div className="support-message-loading-v2 user" />
                    <div className="support-message-loading-v2 support" />
                    <div className="support-message-loading-v2 user short" />
                  </div>
                ) : selected.messages?.length ? (
                  <div className="support-messages-v2">
                    {selected.messages.map((item) => {
                      const isUser = item.senderRole === "user";

                      return (
                        <div
                          key={item.id}
                          className={`support-message-row-v2 ${
                            isUser ? "is-user-v2" : "is-support-v2"
                          }`}
                        >
                          <div
                            className={`support-message-bubble-v2 ${
                              isUser ? "user-bubble-v2" : "support-bubble-v2"
                            }`}
                          >
                            <div className="support-message-author-v2">
                              {isUser ? (
                                <>
                                  <UserRound size={11} />
                                  شما
                                </>
                              ) : (
                                <>
                                  <Headphones size={11} />
                                  پشتیبانی منتورا
                                </>
                              )}
                            </div>

                            <div className="support-message-text-v2">
                              {item.body}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="support-chat-empty-v2">
                    <div className="support-chat-empty-icon-v2">
                      <MessageCircle size={27} />
                    </div>

                    <h3>هنوز پیامی وجود ندارد</h3>

                    <p>اولین پیام را ارسال کنید تا گفتگو شروع شود.</p>
                  </div>
                )}
              </div>

              <div className="support-composer-v2">
                <input
                  type="text"
                  value={message}
                  disabled={!selected || sending}
                  placeholder={
                    selected
                      ? "پیام خود را بنویسید..."
                      : "ابتدا یک تیکت انتخاب کنید"
                  }
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  className="support-send-v2"
                  disabled={!selected || !message.trim() || sending}
                  onClick={sendMessage}
                  aria-label="ارسال پیام"
                >
                  {sending ? (
                    <span className="support-loader-v2" />
                  ) : (
                    <Send
                      size={17}
                      style={{
                        transform: "scaleX(-1)",
                      }}
                    />
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .support-page-v2,
        .support-page-v2 * {
          box-sizing: border-box;
        }

        .support-page-v2 {
          direction: rtl;
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
          padding: 28px 0 45px;
          color: #182522;
        }

        .support-container-v2 {
          width: min(1200px, calc(100% - 32px));
          margin: 0 auto;
        }

        .support-header-v2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .support-header-content-v2 {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .support-header-icon-v2 {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: #2e7f81;
          background: #e9f5f4;
          border: 1px solid #d7eae8;
        }

        .support-header-small-v2 {
          display: block;
          margin-bottom: 4px;
          color: #81908c;
          font-size: 10.5px;
          font-weight: 700;
        }

        .support-header-v2 h1 {
          margin: 0;
          color: #182522;
          font-size: 28px;
          line-height: 1.25;
          font-weight: 900;
        }

        .support-header-v2 p {
          margin: 5px 0 0;
          color: #65736f;
          font-size: 11.5px;
          line-height: 1.8;
        }

        .support-refresh-v2 {
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid #dce5e2;
          outline: none;
          min-height: 43px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 13px;
          background: #ffffff;
          color: #42514d;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(20,32,30,.04);
        }

        .support-refresh-v2:hover:not(:disabled) {
          color: #2e7f81;
          border-color: #a9cfcb;
        }

        .support-refresh-v2:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .support-spin-v2 {
          animation: support-spin-v2 .8s linear infinite;
        }

        @keyframes support-spin-v2 {
          to {
            transform: rotate(360deg);
          }
        }

        .support-grid-v2 {
          display: grid;
          grid-template-columns:
            minmax(260px, .88fr)
            minmax(280px, 1fr)
            minmax(330px, 1.22fr);
          gap: 18px;
          align-items: stretch;
        }

        .support-panel-v2 {
          min-width: 0;
          min-height: 590px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #dfe7e4;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 8px 26px rgba(20,32,30,.045);
        }

        .support-panel-head-v2 {
          min-height: 73px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #e5ebe9;
          background: #ffffff;
        }

        .support-title-icon-v2 {
          width: 37px;
          height: 37px;
          flex: 0 0 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: #2e7f81;
          background: #e9f5f4;
        }

        .support-panel-head-v2 h2 {
          margin: 0;
          color: #1d2a27;
          font-size: 13.5px;
          font-weight: 900;
        }

        .support-panel-head-v2 span {
          display: block;
          margin-top: 3px;
          color: #899590;
          font-size: 9.5px;
        }

        .support-count-v2 {
          width: 27px;
          height: 27px;
          margin-right: auto;
          margin-top: 0 !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #2e7f81 !important;
          background: #e9f5f4;
          font-size: 9px !important;
          font-weight: 900;
        }

        .support-create-form-v2 {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
        }

        .support-field-v2 {
          min-width: 0;
        }

        .support-field-v2 label {
          display: block;
          margin-bottom: 7px;
          color: #263531;
          font-size: 11px;
          font-weight: 800;
        }

        .support-field-v2 input,
        .support-field-v2 select,
        .support-field-v2 textarea {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          border: 1px solid #dce5e2;
          outline: none;
          border-radius: 12px;
          color: #263531 !important;
          background: #f8faf9 !important;
          font-family: inherit;
          font-size: 12px;
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .support-field-v2 input,
        .support-field-v2 select {
          height: 45px;
          padding: 0 13px;
        }

        .support-field-v2 textarea {
          min-height: 135px;
          padding: 12px 13px;
          line-height: 1.9;
          resize: vertical;
        }

        .support-field-v2 input::placeholder,
        .support-field-v2 textarea::placeholder {
          color: #9aa6a2 !important;
          opacity: 1;
        }

        .support-field-v2 input:focus,
        .support-field-v2 select:focus,
        .support-field-v2 textarea:focus {
          border-color: #66a8a5;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(46,127,129,.08);
        }

        .support-description-v2 {
          flex: 1;
        }

        .support-create-button-v2 {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          min-height: 47px;
          margin-top: auto;
          padding: 0 15px;
          border: 0;
          outline: none;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ffffff !important;
          background: linear-gradient(135deg, #2e7f81, #24686a) !important;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 9px 21px rgba(46,127,129,.2);
        }

        .support-create-button-v2:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 13px 26px rgba(46,127,129,.28);
        }

        .support-create-button-v2:disabled {
          opacity: .45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .support-list-panel-v2 {
          min-height: 590px;
        }

        .support-list-v2 {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 14px;
          scrollbar-width: thin;
        }

        .support-list-v2::-webkit-scrollbar,
        .support-chat-content-v2::-webkit-scrollbar {
          width: 5px;
        }

        .support-list-v2::-webkit-scrollbar-thumb,
        .support-chat-content-v2::-webkit-scrollbar-thumb {
          background: #d6dfdc;
          border-radius: 10px;
        }

        .support-ticket-v2 {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          min-height: 73px;
          margin-bottom: 8px;
          padding: 10px;
          border: 1px solid #dfe7e4 !important;
          outline: none;
          border-radius: 14px;
          display: grid;
          grid-template-columns: 35px minmax(0,1fr) auto;
          align-items: center;
          gap: 10px;
          text-align: right;
          color: #25332f !important;
          background: #f8faf9 !important;
          font-family: inherit;
          cursor: pointer;
        }

        .support-ticket-v2:hover {
          border-color: #9fcac6 !important;
          background: #ffffff !important;
        }

        .support-ticket-active-v2 {
          border-color: #2e7f81 !important;
          background: #e9f5f4 !important;
        }

        .support-ticket-icon-v2 {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: #2e7f81;
          background: #e0f0ef;
        }

        .support-ticket-content-v2 {
          min-width: 0;
        }

        .support-ticket-content-v2 strong {
          display: block;
          overflow: hidden;
          color: #24322e !important;
          font-size: 11.5px;
          font-weight: 900;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .support-ticket-content-v2 span {
          margin-top: 5px;
          color: #8a9692 !important;
          font-size: 8.5px;
        }

        .support-ticket-status-wrap-v2 {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .support-ticket-arrow-v2 {
          color: #879590;
        }

        .support-status {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 7px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 8px !important;
          font-weight: 900;
        }

        .support-status-info {
          color: #33709c !important;
          background: #eaf3f8 !important;
        }

        .support-status-success {
          color: #2f8a57 !important;
          background: #e9f6ee !important;
        }

        .support-status-warning {
          color: #aa711d !important;
          background: #fff4df !important;
        }

        .support-status-danger {
          color: #b43b3b !important;
          background: #fbeaea !important;
        }

        .support-empty-v2 {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px;
          text-align: center;
        }

        .support-empty-icon-v2,
        .support-chat-empty-icon-v2 {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          color: #2e7f81;
          background: #e9f5f4;
        }

        .support-empty-v2 strong {
          margin-top: 10px;
          color: #293733 !important;
          font-size: 12px;
          font-weight: 900;
        }

        .support-empty-v2 span {
          max-width: 220px;
          margin-top: 6px;
          color: #899590 !important;
          font-size: 10px;
          line-height: 1.9;
        }

        .support-chat-v2 {
          min-height: 590px;
        }

        .support-chat-header-v2 {
          min-height: 73px;
          padding: 13px 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #e5ebe9;
        }

        .support-chat-user-v2 {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .support-chat-icon-v2 {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #2e7f81;
          background: #e9f5f4;
        }

        .support-chat-user-v2 h2 {
          max-width: 260px;
          overflow: hidden;
          margin: 0;
          color: #1d2b27 !important;
          font-size: 12.5px;
          font-weight: 900;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .support-chat-user-v2 span {
          display: block;
          margin-top: 3px;
          color: #8a9692 !important;
          font-size: 9px;
        }

        .support-chat-content-v2 {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 17px;
          background: #fcfdfc !important;
          scrollbar-width: thin;
        }

        .support-chat-empty-v2 {
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px;
          text-align: center;
        }

        .support-chat-empty-v2 h3 {
          margin: 11px 0 5px;
          color: #263531 !important;
          font-size: 13px;
          font-weight: 900;
        }

        .support-chat-empty-v2 p {
          max-width: 260px;
          margin: 0;
          color: #899590 !important;
          font-size: 10px;
          line-height: 1.9;
        }

        .support-messages-v2 {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .support-message-row-v2 {
          width: 100%;
          display: flex;
        }

        .support-message-row-v2.is-user-v2 {
          justify-content: flex-start;
        }

        .support-message-row-v2.is-support-v2 {
          justify-content: flex-end;
        }

        .support-message-bubble-v2 {
          max-width: 78%;
          padding: 10px 13px;
          border-radius: 15px;
        }

        .user-bubble-v2 {
          color: #ffffff !important;
          background: #2e7f81 !important;
          border-radius: 15px 15px 4px 15px;
          box-shadow: 0 6px 15px rgba(46,127,129,.16);
        }

        .support-bubble-v2 {
          color: #263531 !important;
          background: #ffffff !important;
          border: 1px solid #dce5e2;
          border-radius: 15px 15px 15px 4px;
        }

        .support-message-author-v2 {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 5px;
          font-size: 8px;
          font-weight: 900;
        }

        .user-bubble-v2 .support-message-author-v2 {
          color: rgba(255,255,255,.78) !important;
        }

        .support-bubble-v2 .support-message-author-v2 {
          color: #2e7f81 !important;
        }

        .support-message-text-v2 {
          color: inherit !important;
          font-size: 11.5px;
          line-height: 1.95;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .support-chat-loading-v2 {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .support-message-loading-v2 {
          width: 68%;
          height: 65px;
          border-radius: 15px;
          background: linear-gradient(
            90deg,
            #f0f3f2,
            #e2e8e6,
            #f0f3f2
          );
          background-size: 200% 100%;
          animation: support-loading-v2 1.2s infinite;
        }

        .support-message-loading-v2.user {
          align-self: flex-start;
        }

        .support-message-loading-v2.support {
          align-self: flex-end;
          width: 54%;
        }

        .support-message-loading-v2.short {
          width: 42%;
        }

        .support-ticket-skeleton-v2 {
          width: 100%;
          height: 73px;
          margin-bottom: 8px;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            #f0f3f2,
            #e2e8e6,
            #f0f3f2
          );
          background-size: 200% 100%;
          animation: support-loading-v2 1.2s infinite;
        }

        @keyframes support-loading-v2 {
          to {
            background-position: -200% 0;
          }
        }

        .support-composer-v2 {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px;
          border-top: 1px solid #e3e9e7;
          background: #ffffff;
        }

        .support-composer-v2 input {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          min-width: 0;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #dce5e2;
          outline: none;
          border-radius: 13px;
          color: #263531 !important;
          background: #f8faf9 !important;
          font-family: inherit;
          font-size: 11.5px;
        }

        .support-composer-v2 input::placeholder {
          color: #9aa6a2 !important;
          opacity: 1;
        }

        .support-composer-v2 input:focus {
          border-color: #66a8a5;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(46,127,129,.08);
        }

        .support-composer-v2 input:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .support-send-v2 {
          appearance: none;
          -webkit-appearance: none;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          padding: 0;
          border: 0;
          outline: none;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff !important;
          background: #2e7f81 !important;
          cursor: pointer;
          box-shadow: 0 7px 17px rgba(46,127,129,.2);
        }

        .support-send-v2:hover:not(:disabled) {
          background: #24686a !important;
          transform: translateY(-1px);
        }

        .support-send-v2:disabled {
          opacity: .4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .support-loader-v2 {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: support-spin-v2 .7s linear infinite;
        }

        @media (max-width: 1050px) {
          .support-grid-v2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .support-chat-v2 {
            grid-column: 2;
          }
        }

        @media (max-width: 760px) {
          .support-page-v2 {
            padding: 20px 0 32px;
          }

          .support-container-v2 {
            width: min(100% - 20px, 600px);
          }

          .support-header-v2 {
            flex-direction: column;
            align-items: stretch;
          }

          .support-refresh-v2 {
            width: 100%;
          }

          .support-grid-v2 {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .support-chat-v2 {
            grid-column: auto;
          }

          .support-panel-v2 {
            min-height: auto;
            border-radius: 17px;
          }

          .support-create-form-v2 {
            padding: 17px 15px;
          }

          .support-list-panel-v2 {
            min-height: 380px;
          }

          .support-chat-v2 {
            min-height: 540px;
          }
        }

        @media (max-width: 430px) {
          .support-container-v2 {
            width: calc(100% - 14px);
          }

          .support-header-content-v2 {
            gap: 9px;
          }

          .support-header-icon-v2 {
            width: 41px;
            height: 41px;
            flex-basis: 41px;
            border-radius: 12px;
          }

          .support-header-v2 h1 {
            font-size: 21px;
          }

          .support-header-small-v2 {
            font-size: 9px;
          }

          .support-header-v2 p {
            display: none;
          }

          .support-panel-head-v2 {
            min-height: 63px;
            padding: 12px;
          }

          .support-panel-head-v2 span {
            display: none;
          }

          .support-title-icon-v2 {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
          }

          .support-panel-head-v2 h2 {
            font-size: 12px;
          }

          .support-count-v2 {
            display: flex !important;
          }

          .support-ticket-v2 {
            grid-template-columns: 34px minmax(0,1fr) auto;
            padding: 9px;
          }

          .support-ticket-status-wrap-v2 .support-ticket-arrow-v2 {
            display: none;
          }

          .support-ticket-content-v2 strong {
            font-size: 10.5px;
          }

          .support-ticket-content-v2 span {
            font-size: 8px;
          }

          .support-status {
            font-size: 7.5px !important;
          }

          .support-chat-user-v2 h2 {
            max-width: 150px;
          }

          .support-chat-header-v2 > .support-status {
            display: none !important;
          }

          .support-message-bubble-v2 {
            max-width: 88%;
          }

          .support-message-text-v2 {
            font-size: 10.5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .support-spin-v2,
          .support-loader-v2,
          .support-ticket-skeleton-v2,
          .support-message-loading-v2 {
            animation: none;
          }

          .support-create-button-v2,
          .support-send-v2,
          .support-ticket-v2 {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
