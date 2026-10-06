import { useEffect, useRef, useState } from "react";

const seed = [
  { id: "music-night", title: "One last night of summer", club: "Northwood Music Collective", category: "Arts & culture", date: "2026-10-02", time: "19:30", location: "The Quad", description: "Live music, a long evening, and the last bit of summer on the Quad.", capacity: 140, going: 84, image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85" },
  { id: "print-night", title: "Print & Pour: lino cut night", club: "Studio Arts Society", category: "Arts & culture", date: "2026-10-03", time: "18:00", location: "Fine Arts, Room 204", description: "Make a tiny lino print, meet new people, and take your work home. Materials included.", capacity: 28, going: 19, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80" },
  { id: "build-night", title: "Build night: tiny tools", club: "Northwood Computing Club", category: "Technology", date: "2026-10-04", time: "17:30", location: "Innovation Lab", description: "Bring a laptop or just an idea for a small tool you can build with a team.", capacity: 45, going: 31, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80" },
  { id: "trail-morning", title: "The long way round", club: "Outing Club", category: "Outdoors", date: "2026-10-05", time: "09:00", location: "Meet at East Gate", description: "An easy arboretum loop with a coffee stop. No special gear or experience needed.", capacity: 22, going: 16, image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=700&q=80" },
  { id: "story-swap", title: "Stories from everywhere", club: "Global Neighbors", category: "Community", date: "2026-10-07", time: "18:30", location: "Commons, Room 1B", description: "Share a story, song, or just your curiosity. Tea and conversation for everyone.", capacity: 35, going: 24, image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80" },
  { id: "film-night", title: "Short films, big feelings", club: "Frame by Frame", category: "Arts & culture", date: "2026-10-09", time: "19:00", location: "Media Center, Theater", description: "Watch student-made short films, then chat with the filmmakers in a relaxed setting.", capacity: 60, going: 42, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80" },
  { id: "garden-day", title: "Grow something good", club: "Campus Garden Collective", category: "Outdoors", date: "2026-10-11", time: "11:00", location: "South Greenhouse", description: "Help prepare the campus garden for the season and take home a herb cutting.", capacity: 18, going: 11, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=80" }
];
const categories = ["Arts & culture", "Technology", "Outdoors", "Community", "Wellness", "Academic"];
const colors = { "Arts & culture": "#ed7962", Technology: "#648de0", Outdoors: "#72a975", Community: "#d5aa3e", Wellness: "#ba7ca7", Academic: "#648de0" };
const images = Object.fromEntries(seed.map((event) => [event.category, event.image]));
const years = ["First year", "Sophomore", "Junior", "Senior", "Graduate student", "Other"];

function read(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; }
}
function initialEvents() {
  const saved = read("gather-events", null);
  if (saved && !Array.isArray(saved) && Array.isArray(saved.items)) return saved.items;
  if (Array.isArray(saved)) return [...seed.filter((event) => !saved.some((item) => item.id === event.id)), ...saved];
  return seed;
}
function parseDate(value) { return new Date(`${value}T12:00:00`); }
function dateText(value, options = { weekday: "short", month: "short", day: "numeric" }) { return parseDate(value).toLocaleDateString("en-US", options); }
function timeText(value) { const [hours, minutes] = value.split(":").map(Number); return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
function today() { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }

function Modal({ titleId, onClose, children, className = "" }) {
  return <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}><section className={`app-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>{children}</section></div>;
}
function DialogHeading({ kicker, title, id, onClose }) {
  return <div className="dialog-heading"><div><p className="section-kicker">{kicker}</p><h2 id={id}>{title}</h2></div><button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog">×</button></div>;
}
function EventCard({ event, registered, onRegister }) {
  const spots = event.capacity ? Math.max(0, event.capacity - event.going) : null;
  const full = spots === 0 && !registered;
  return <article className="event-card"><div className="event-image-wrap"><img className="event-image" src={event.image} alt="" loading="lazy" /><div className="event-date"><span>{dateText(event.date, { month: "short" }).toUpperCase()}</span><span>{parseDate(event.date).getDate()}</span></div></div>
    <div className="event-info"><div className="event-category"><span className="category-dot" style={{ background: colors[event.category] || "#79a357" }} />{event.category}<span className="event-host">· {event.club}</span></div><h3 className="event-title" title={event.title}>{event.title}</h3><p className="event-description">{event.description || `${event.club} welcomes new faces to join in.`}</p>
      <div className="event-meta"><time dateTime={`${event.date}T${event.time}`}>◷ {dateText(event.date)} · {timeText(event.time)}</time><span className="event-venue" title={`Venue: ${event.location}`}>⌖ {event.location}</span></div>
      <div className="event-bottom"><span className="event-attendees">{event.going} going{spots !== null ? ` · ${spots} spots left` : ""}</span><button className={`rsvp-button${registered ? " is-going" : ""}`} type="button" aria-pressed={registered} disabled={full} onClick={() => onRegister(event)}>{registered ? "Registered ✓" : full ? "Full" : "Register"}</button></div>
    </div>
  </article>;
}

function EventForm({ event, onSave, onClose }) {
  const [form, setForm] = useState(() => event ? { ...event } : { title: "", club: "", category: categories[0], date: "", time: "", location: "", capacity: 40, description: "" });
  const update = (key) => (change) => setForm((current) => ({ ...current, [key]: change.target.value }));
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return <Modal titleId="event-dialog-title" onClose={onClose}><form onSubmit={(eventSubmit) => { eventSubmit.preventDefault(); onSave({ ...form, capacity: Number(form.capacity) }); }}><DialogHeading kicker="PUT IT ON THE CALENDAR" title={event ? <>Edit event <span>details.</span></> : <>Create an <span>event.</span></>} id="event-dialog-title" onClose={onClose} />
    <label className="form-field">Event name<input autoFocus required maxLength="72" value={form.title} onChange={update("title")} placeholder="Give it a good name" /></label><div className="form-row"><label className="form-field">Club or host<input required maxLength="48" value={form.club} onChange={update("club")} placeholder="Who's putting it on?" /></label><label className="form-field">Category<select value={form.category} onChange={update("category")}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label></div>
    <div className="form-row"><label className="form-field">Date<input type="date" required min={event ? undefined : minDate} value={form.date} onChange={update("date")} /></label><label className="form-field">Time<input type="time" required value={form.time} onChange={update("time")} /></label></div><div className="form-row"><label className="form-field">Venue<input required maxLength="80" value={form.location} onChange={update("location")} placeholder="Where should people meet?" /></label><label className="form-field">Spots<input type="number" min="2" max="999" required value={form.capacity} onChange={update("capacity")} /></label></div>
    <label className="form-field">Event description<textarea maxLength="240" rows="3" value={form.description} onChange={update("description")} placeholder="What's happening? What should people know?" /></label><div className="dialog-actions"><p>Visible to your campus community.</p><button className="create-button" type="submit">{event ? "Save changes" : <><span>＋</span>Publish event</>}</button></div>
  </form></Modal>;
}

function RegistrationForm({ event, registration, onSave, onCancel, onClose }) {
  const [form, setForm] = useState(() => registration || { name: "", email: "", phone: "", college: "", year: "" });
  const update = (key) => (change) => setForm((current) => ({ ...current, [key]: change.target.value }));
  return <Modal titleId="registration-title" onClose={onClose}><form onSubmit={(eventSubmit) => { eventSubmit.preventDefault(); onSave(form); }}><DialogHeading kicker="SAVE YOUR SPOT" title={<>Event <span>registration.</span></>} id="registration-title" onClose={onClose} />
    <p className="registration-event-name">{event.title} · {event.location}</p><label className="form-field">Full name<input autoFocus autoComplete="name" required maxLength="80" value={form.name} onChange={update("name")} placeholder="Your first and last name" /></label><label className="form-field">Email address<input type="email" autoComplete="email" required maxLength="120" value={form.email} onChange={update("email")} placeholder="you@northwood.edu" /></label>
    <label className="form-field">Phone number<input type="tel" autoComplete="tel" inputMode="tel" pattern="\+?[0-9]{7,15}" required maxLength="16" value={form.phone} onChange={update("phone")} placeholder="15551234567" /></label><div className="form-row"><label className="form-field">College<input required maxLength="80" value={form.college} onChange={update("college")} placeholder="Your college or school" /></label><label className="form-field">Year<select required value={form.year} onChange={update("year")}><option value="" disabled>Select year</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label></div>
    <div className="dialog-actions">{registration && <button className="cancel-registration" type="button" onClick={onCancel}>Cancel registration</button>}<button className="create-button" type="submit">{registration ? "Update registration" : "Submit registration"} <span>↗</span></button></div><p className="registration-privacy">Your details are shared with the event organizer for registration.</p>
  </form></Modal>;
}

function ClubForm({ profile, onSave, onClose }) {
  const [form, setForm] = useState(() => profile || { name: "", category: "Community", meeting: "", tagline: "", description: "", contact: "", cover: "" });
  const update = (key) => (change) => setForm((current) => ({ ...current, [key]: change.target.value }));
  return <Modal titleId="profile-dialog-title" className="profile-dialog" onClose={onClose}><form onSubmit={(eventSubmit) => { eventSubmit.preventDefault(); onSave(form); }}><DialogHeading kicker="MAKE YOURSELVES AT HOME" title={profile ? <>Edit your <span>club page.</span></> : <>Introduce your <span>club.</span></>} id="profile-dialog-title" onClose={onClose} />
    <label className="form-field">Club name<input autoFocus required maxLength="56" value={form.name} onChange={update("name")} placeholder="What do you call yourselves?" /></label><div className="form-row"><label className="form-field">Category<select value={form.category} onChange={update("category")}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="form-field">When do you meet?<input maxLength="56" value={form.meeting} onChange={update("meeting")} placeholder="Tuesdays at 6, for example" /></label></div>
    <label className="form-field">Your one-line hello<input required maxLength="100" value={form.tagline} onChange={update("tagline")} placeholder="What makes your club feel like your club?" /></label><label className="form-field">A little about you<textarea required maxLength="500" rows="4" value={form.description} onChange={update("description")} placeholder="What do you do? Who's welcome? What should a new person know?" /></label>
    <div className="form-row"><label className="form-field">Contact email<input type="email" required value={form.contact} onChange={update("contact")} placeholder="club@northwood.edu" /></label><label className="form-field">Cover image URL <span className="optional-label">optional</span><input type="url" value={form.cover} onChange={update("cover")} placeholder="https://..." /></label></div><div className="dialog-actions"><p>You can update this any time.</p><button className="create-button" type="submit">Publish introduction <span>↗</span></button></div>
  </form></Modal>;
}

function AdminView({ events, registrations, clubProfile, onCreateEvent, onEditEvent, onDeleteEvent, onRemoveRegistration }) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const upcomingCount = events.filter((event) => parseDate(event.date) >= today()).length;
  const students = Object.entries(registrations).map(([id, registration]) => ({ ...registration, id, event: events.find((event) => event.id === id) })).filter((student) => {
    const text = [student.name, student.email, student.phone, student.college, student.year, student.event?.title, student.event?.club, student.event?.location].join(" ").toLowerCase();
    return student.event && (!search || text.includes(search.toLowerCase())) && (!eventFilter || student.id === eventFilter) && (!yearFilter || student.year === yearFilter);
  }).sort((a, b) => a.name.localeCompare(b.name));
  return <section className="admin-view"><div className="admin-heading"><div><p className="eyebrow"><i />NORTHWOOD COLLEGE · ADMIN</p><h1>Campus, <span>in good hands.</span></h1><p className="welcome-subtitle">Events and registrations, all in one place.</p></div><button className="create-button" onClick={onCreateEvent}><span>＋</span>Create event</button></div>
    <div className="admin-stats" aria-label="Campus activity summary"><article><span className="stat-icon stat-green">◷</span><p>UPCOMING EVENTS<strong>{upcomingCount}</strong></p></article><article><span className="stat-icon stat-coral">↗</span><p>STUDENT REGISTRATIONS<strong>{Object.keys(registrations).length}</strong></p></article><article><span className="stat-icon stat-blue">▣</span><p>CLUB INTRODUCTIONS<strong>{clubProfile ? 1 : 0}</strong></p></article></div>
    <section className="admin-panel"><div className="admin-panel-heading"><div><p className="section-kicker">KEEP THE CAMPUS CALENDAR TIDY</p><h2>Manage events</h2></div><span className="admin-panel-count">{events.length} events</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>EVENT</th><th>DATE & TIME</th><th>VENUE</th><th>REGISTRATIONS</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{[...events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => <tr key={event.id}><td><strong>{event.title}</strong><small>{event.club} · {event.category}</small></td><td>{dateText(event.date)}<small>{timeText(event.time)}</small></td><td>{event.location}</td><td>{event.going}{event.capacity ? ` / ${event.capacity}` : ""}</td><td className="admin-actions"><button type="button" onClick={() => onEditEvent(event)}>Edit</button><button type="button" className="delete-action" aria-label={`Delete event ${event.title}`} onClick={() => onDeleteEvent(event)}>Delete event</button></td></tr>)}</tbody></table></div>{events.length === 0 && <p className="admin-empty">No events on the calendar yet.</p>}</section>
    <section className="admin-panel"><div className="admin-panel-heading"><div><p className="section-kicker">WHO'S COMING</p><h2>Student registrations</h2></div><span className="admin-panel-count">{students.length} students</span></div><div className="registration-filters"><label className="admin-search"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students or events" aria-label="Search registrations" /></label><label className="select-filter"><span className="visually-hidden">Filter by event</span><select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} aria-label="Filter registrations by event"><option value="">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label><label className="select-filter"><span className="visually-hidden">Filter by year</span><select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} aria-label="Filter registrations by year"><option value="">All years</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label></div><div className="admin-table-wrap"><table className="admin-table registration-table"><thead><tr><th>STUDENT</th><th>EVENT</th><th>COLLEGE & YEAR</th><th>CONTACT</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.year}</small></td><td>{student.event.title}<small>{dateText(student.event.date)}</small></td><td>{student.college}<small>{student.year}</small></td><td><a href={`mailto:${student.email}`}>{student.email}</a><small><a href={`tel:${student.phone}`}>{student.phone}</a></small></td><td className="admin-actions"><button type="button" className="delete-action" onClick={() => onRemoveRegistration(student.id, student)}>Remove</button></td></tr>)}</tbody></table></div>{students.length === 0 && <p className="admin-empty">No registrations match these filters.</p>}</section>
  </section>;
}

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [rsvps, setRsvps] = useState(() => read("gather-rsvps", []));
  const [registrations, setRegistrations] = useState(() => read("gather-registrations", {}));
  const [profile, setProfile] = useState(() => read("gather-club-profile", null));
  const [view, setView] = useState("discover");
  const [filter, setFilter] = useState("All events");
  const [search, setSearch] = useState("");
  const [latestFirst, setLatestFirst] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [toast, setToast] = useState("");
  const [featuredSaved, setFeaturedSaved] = useState(false);
  const [interested, setInterested] = useState(() => read("gather-club-interested", false));
  const [interestCount, setInterestCount] = useState(() => Number(read("gather-club-interest", 0)) || 0);
  const eventsSectionRef = useRef(null);

  useEffect(() => { try { localStorage.setItem("gather-events", JSON.stringify({ version: 2, items: events })); } catch { setToast("Changes could not be saved in this browser."); } }, [events]);
  useEffect(() => { try { localStorage.setItem("gather-rsvps", JSON.stringify(rsvps)); localStorage.setItem("gather-registrations", JSON.stringify(registrations)); } catch { setToast("Changes could not be saved in this browser."); } }, [rsvps, registrations]);
  useEffect(() => { try { if (profile) localStorage.setItem("gather-club-profile", JSON.stringify(profile)); } catch { setToast("Your club page could not be saved in this browser."); } }, [profile]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(""), 2600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".search-box input")?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const currentDay = today();
  const weekEnd = new Date(currentDay); weekEnd.setDate(weekEnd.getDate() + 7);
  const upcoming = events.filter((event) => parseDate(event.date) >= currentDay).sort((a, b) => latestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const visibleEvents = upcoming.filter((event) => {
    const query = search.trim().toLowerCase(), date = parseDate(event.date);
    const matchesText = !query || [event.title, event.club, event.category, event.location, event.description].join(" ").toLowerCase().includes(query);
    const matchesFilter = filter === "All events" || (filter === "This week" && date <= weekEnd) || event.category === filter;
    return matchesText && matchesFilter && (view !== "my-events" || rsvps.includes(event.id));
  });
  const featured = events.find((event) => event.id === "music-night") || seed[0];

  function openRegistration(event) {
    if (event.capacity && event.going >= event.capacity && !rsvps.includes(event.id)) { setToast("This event is full."); return; }
    setActiveEvent(event); setDialog("registration");
  }
  function saveRegistration(details) {
    const alreadyGoing = rsvps.includes(activeEvent.id);
    setRegistrations((current) => ({ ...current, [activeEvent.id]: { ...details } }));
    if (!alreadyGoing) { setRsvps((current) => [...current, activeEvent.id]); setEvents((current) => current.map((event) => event.id === activeEvent.id ? { ...event, going: event.going + 1 } : event)); }
    setDialog(null); setToast(`Registration saved for ${activeEvent.title}.`);
  }
  function cancelRegistration() {
    setRsvps((current) => current.filter((id) => id !== activeEvent.id));
    setRegistrations((current) => { const next = { ...current }; delete next[activeEvent.id]; return next; });
    setEvents((current) => current.map((event) => event.id === activeEvent.id ? { ...event, going: Math.max(0, event.going - 1) } : event));
    setDialog(null); setToast("Your registration has been cancelled.");
  }
  function saveEvent(details) {
    if (activeEvent?.adminEdit) {
      setEvents((current) => current.map((event) => event.id === activeEvent.id ? { ...event, ...details, image: images[details.category] || event.image } : event));
      setToast("Event changes saved.");
    } else {
      setEvents((current) => [...current, { ...details, id: `event-${Date.now()}`, going: 0, image: images[details.category] || images["Arts & culture"] }]);
      setToast("Your event is live on the campus calendar.");
    }
    setDialog(null);
  }
  function deleteEvent(event) {
    if (!window.confirm(`Delete “${event.title}” and its registrations?`)) return;
    setEvents((current) => current.filter((item) => item.id !== event.id));
    setRsvps((current) => current.filter((id) => id !== event.id));
    setRegistrations((current) => { const next = { ...current }; delete next[event.id]; return next; });
    setToast("Event and registrations deleted.");
  }
  function removeRegistration(id, student) {
    if (!window.confirm(`Remove ${student.name}'s registration?`)) return;
    setRsvps((current) => current.filter((eventId) => eventId !== id));
    setRegistrations((current) => { const next = { ...current }; delete next[id]; return next; });
    setEvents((current) => current.map((event) => event.id === id ? { ...event, going: Math.max(0, event.going - 1) } : event));
    setToast("Registration removed.");
  }
  function changeView(next) { setView(next); setFilter("All events"); setSearch(""); }
  function viewAllEvents() {
    changeView("discover");
    setTimeout(() => eventsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function setInterest() {
    const next = !interested, nextCount = Math.max(0, interestCount + (next ? 1 : -1));
    setInterested(next); setInterestCount(nextCount);
    try { localStorage.setItem("gather-club-interested", JSON.stringify(next)); localStorage.setItem("gather-club-interest", JSON.stringify(nextCount)); } catch { setToast("Your interest could not be saved."); }
  }

  const pageLabel = { discover: "Discover", "my-events": "My events", "club-page": "Club homepage", admin: "Admin dashboard" }[view];
  const updateStudentFilter = (value) => { changeView("discover"); setFilter(value); };

  return <>
    <aside className="sidebar" aria-label="Main navigation"><a className="brand" href="#home"><span className="brand-mark">g.</span><span>gather<span className="coral">.</span></span></a><div className="campus-switcher"><span className="campus-monogram">N</span><span><strong>Northwood</strong><small>College campus</small></span><span className="switcher-caret">⌄</span></div>
      <p className="nav-label">YOUR SPACE</p><nav className="primary-nav"><button className={`nav-link${view === "discover" ? " is-active" : ""}`} onClick={() => changeView("discover")}><span className="nav-icon">◫</span>Discover</button><button className={`nav-link${view === "my-events" ? " is-active" : ""}`} onClick={() => changeView("my-events")}><span className="nav-icon">♡</span>My events<span className={`nav-count${rsvps.length ? " has-count" : ""}`}>{rsvps.length}</span></button><button className={`nav-link${view === "club-page" ? " is-active" : ""}`} onClick={() => changeView("club-page")}><span className="nav-icon">▣</span>Club homepage</button><button className={`nav-link${view === "admin" ? " is-active" : ""}`} onClick={() => changeView("admin")}><span className="nav-icon">⌘</span>Admin dashboard</button></nav>
      <p className="nav-label clubs-label">EXPLORE BY INTEREST</p><nav className="club-nav" aria-label="Event categories">{["Arts & culture", "Technology", "Outdoors", "Community"].map((category, index) => <button className="club-link" key={category} onClick={() => updateStudentFilter(category)}><span className={`club-dot ${["dot-coral", "dot-blue", "dot-green", "dot-yellow"][index]}`} />{category}</button>)}</nav>
      <div className="sidebar-bottom"><div className="organizer-card"><div className="organizer-avatars"><span>M</span><span>J</span><span>A</span></div><p><strong>Give your club a home</strong><span>Introduce yourselves to campus.</span></p><button className="text-action" onClick={() => setDialog("profile")}>Create club page <span>↗</span></button></div><button className="profile-button" onClick={() => setToast("Signed in as Jordan Davis.")}><span className="profile-avatar">JD</span><span className="profile-copy"><strong>Jordan Davis</strong><small>Student member</small></span><span className="profile-menu">···</span></button></div>
    </aside>
    <main className="main-content" id="home"><header className="topbar"><a className="mobile-brand" href="#home"><span className="brand-mark">g.</span><span>gather<span className="coral">.</span></span></a><div className="breadcrumb"><span>Northwood College</span><span>/</span><strong>{pageLabel}</strong></div><div className="topbar-actions">{view !== "admin" && <label className="search-box"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by event name..." aria-label="Search events by name, club, or venue" /><kbd>⌘ K</kbd></label>}<button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast("You're all caught up on notifications.")}>♧<i /></button><button className="create-button" onClick={() => { setActiveEvent(null); setDialog("event"); }}><span>＋</span>Create event</button></div></header>
      <nav className="mobile-navigation" aria-label="App navigation"><button className={view === "discover" ? "is-active" : ""} onClick={() => changeView("discover")}><span>◫</span>Discover</button><button className={view === "my-events" ? "is-active" : ""} onClick={() => changeView("my-events")}><span>♡</span>My events</button><button className={view === "club-page" ? "is-active" : ""} onClick={() => changeView("club-page")}><span>▣</span>Club page</button><button className={view === "admin" ? "is-active" : ""} onClick={() => changeView("admin")}><span>⌘</span>Admin</button></nav>

      {(view === "discover" || view === "my-events") && <div>{view === "discover" && <><section className="welcome-row"><div><p className="eyebrow"><i />MONDAY, SEPTEMBER 28, 2026</p><h1>Campus, <span>in motion.</span></h1><p className="welcome-subtitle">Good things happen when we get together. Find your people.</p></div><div className="week-indicator"><span className="week-spark">✳</span><span><strong>A good week to get out</strong><small>{upcoming.filter((event) => parseDate(event.date) <= weekEnd).length} events happening this week</small></span></div></section>
        <section className="feature-section" aria-label="Featured event"><article className="feature-card"><img src={featured.image} alt="" /><div className="feature-shade" /><div className="feature-topline"><span className="feature-tag"><i />THIS WEEK'S PICK</span><button className="feature-save" type="button" aria-label={featuredSaved ? "Unsave featured event" : "Save featured event"} onClick={() => { setFeaturedSaved((saved) => !saved); setToast(featuredSaved ? "Featured event unsaved." : "Featured event saved."); }}>{featuredSaved ? "♥" : "♡"}</button></div><div className="feature-copy"><p className="feature-club">{featured.club.toUpperCase()} <span>·</span> {featured.category.toUpperCase()}</p><h2>{featured.id === "music-night" ? <>One last night<br />of summer.</> : featured.title}</h2><div className="feature-details"><span>◷ &nbsp;{dateText(featured.date)} · {timeText(featured.time)}</span><span>⌖ &nbsp;{featured.location}</span></div></div><button className={`feature-cta${rsvps.includes(featured.id) ? " is-going" : ""}`} onClick={() => openRegistration(featured)}>{rsvps.includes(featured.id) ? "Registered ✓" : "Count me in ↗"}</button><div className="feature-attending"><div className="attendee-stack" aria-hidden="true"><span>R</span><span>K</span><span>T</span><span>+</span></div><span><strong>{featured.going}</strong> going</span></div></article></section></>}
        <section className="events-section" ref={eventsSectionRef}><div className="section-heading"><div><p className="section-kicker">{view === "my-events" ? "YOUR SAVED PLANS" : "MAKE IT A PLAN"}</p><h2>{view === "my-events" ? "Your plans" : "Upcoming events"} <span className="heading-period">.</span></h2></div><button className="view-all-button" onClick={viewAllEvents}>View all events <span>↗</span></button></div>
          {view === "discover" && <div className="event-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter events">{["All events", "This week", ...categories].map((value) => <button key={value} data-filter={value} className={`filter-tab${filter === value ? " is-selected" : ""}`} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}>{value}{value === "All events" && <span className="tab-count">{upcoming.length}</span>}</button>)}</div><button className="sort-button" onClick={() => setLatestFirst((current) => !current)}><span>↕</span> {latestFirst ? "Latest" : "Soonest"}</button></div>}
          <div className="events-grid">{visibleEvents.map((event) => <EventCard key={event.id} event={event} registered={rsvps.includes(event.id)} onRegister={openRegistration} />)}</div>
          {visibleEvents.length === 0 && <div className="empty-state"><span>✳</span><h3>No plans found. Yet.</h3><p>{view === "my-events" ? "Register for an event and your plans will show up here." : "Try another search or start something worth showing up for."}</p><button onClick={() => view === "my-events" ? changeView("discover") : setDialog("event")}>{view === "my-events" ? "Explore events" : "Create an event"}</button></div>}
          {visibleEvents.length > 0 && <button className="load-more-button" type="button" onClick={() => setToast("That's everything on the calendar for now.")}>You're all caught up <span>✳</span></button>}
        </section></div>}

      {view === "club-page" && <section className="club-page-view"><div className="club-page-heading"><div><p className="eyebrow"><i />YOUR CLUB, YOUR CORNER OF CAMPUS</p><h1>A page for <span>your people.</span></h1><p className="welcome-subtitle">Tell students what your club is about and how to find you.</p></div><button className="create-button" onClick={() => setDialog("profile")}><span>＋</span>{profile ? "Edit introduction" : "Create club page"}</button></div>
        {!profile ? <div className="club-empty"><span className="empty-spark">✳</span><div><p className="section-kicker">START WITH AN INTRODUCTION</p><h2>Every good club starts with a hello.</h2><p>Make a home for your club on campus. Share what you're about, who can join, and when you meet. Your introduction will be visible to students browsing Gather.</p><button className="create-button" onClick={() => setDialog("profile")}><span>＋</span>Introduce your club</button></div><div className="empty-illustration" aria-hidden="true"><span>HEY!</span><i>✳</i><b>↗</b></div></div> : <article className="club-profile"><div className="club-cover"><img src={profile.cover || images[profile.category] || images.Community} alt="" /><span className="profile-category">{profile.category}</span><button className="edit-profile-action" onClick={() => setDialog("profile")}>Edit introduction</button></div><div className="club-profile-body"><div className="club-profile-main"><p className="section-kicker">NORTHWOOD COLLEGE CLUB</p><h2>{profile.name}</h2><p className="club-tagline">{profile.tagline}</p><p className="club-description">{profile.description}</p><div className="club-profile-meta"><span>◷ <strong>{profile.meeting || "Meeting details coming soon"}</strong></span><span>✉ <strong>{profile.contact}</strong></span></div></div><aside className="club-join-panel"><span className="join-spark">✳</span><h3>Curious? Come say hi.</h3><p>New faces are always welcome.</p><button className="join-button" onClick={setInterest}>{interested ? "Interested ✓" : <>I'm interested <span>↗</span></>}</button><small>{interestCount} student{interestCount === 1 ? "" : "s"} interested</small></aside></div></article>}</section>}

      {view === "admin" && <AdminView events={events} registrations={registrations} clubProfile={profile} onCreateEvent={() => { setActiveEvent(null); setDialog("event"); }} onEditEvent={(event) => { setActiveEvent({ ...event, adminEdit: true }); setDialog("event"); }} onDeleteEvent={deleteEvent} onRemoveRegistration={removeRegistration} />}
      <footer className="page-footer"><span>A little more together.</span><span>Made for Northwood College <b>✳</b></span></footer></main>
    {dialog === "event" && <EventForm event={activeEvent?.adminEdit ? activeEvent : null} onSave={saveEvent} onClose={() => setDialog(null)} />}
    {dialog === "registration" && activeEvent && <RegistrationForm event={activeEvent} registration={registrations[activeEvent.id] || null} onSave={saveRegistration} onCancel={cancelRegistration} onClose={() => setDialog(null)} />}
    {dialog === "profile" && <ClubForm profile={profile} onSave={(next) => { setProfile(next); setDialog(null); setToast("Your club introduction is published."); }} onClose={() => setDialog(null)} />}
    {toast && <div className="toast is-visible" role="status" aria-live="polite">{toast}</div>}
  </>;
}