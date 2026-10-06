const starterEvents = [
	{ id: "music-night", title: "One last night of summer", club: "Northwood Music Collective", category: "Arts & culture", date: "2026-10-02", time: "19:30", location: "The Quad", going: 84, image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80" },
	{ id: "print-night", title: "Print & Pour: lino cut night", club: "Studio Arts Society", category: "Arts & culture", date: "2026-10-03", time: "18:00", location: "Fine Arts, Room 204", going: 19, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80" },
	{ id: "build-night", title: "Build night: tiny tools", club: "Northwood Computing Club", category: "Technology", date: "2026-10-04", time: "17:30", location: "Innovation Lab", going: 31, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80" },
	{ id: "trail-morning", title: "The long way round", club: "Outing Club", category: "Outdoors", date: "2026-10-05", time: "09:00", location: "Meet at East Gate", going: 16, image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=700&q=80" },
	{ id: "story-swap", title: "Stories from everywhere", club: "Global Neighbors", category: "Community", date: "2026-10-07", time: "18:30", location: "Commons, Room 1B", going: 24, image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80" },
	{ id: "film-night", title: "Short films, big feelings", club: "Frame by Frame", category: "Arts & culture", date: "2026-10-09", time: "19:00", location: "Media Center, Theater", going: 42, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80" },
	{ id: "garden-day", title: "Grow something good", club: "Campus Garden Collective", category: "Outdoors", date: "2026-10-11", time: "11:00", location: "South Greenhouse", going: 11, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=80" }
];

const starterDescriptions = {
	"music-night": "Live music, a long evening, and the last bit of summer on the Quad.",
	"print-night": "Make a tiny lino print, meet new people, and take your work home. Materials included.",
	"build-night": "Bring a laptop or just an idea for a small tool you can build with a team.",
	"trail-morning": "An easy arboretum loop with a coffee stop. No special gear or experience needed.",
	"story-swap": "Share a story, song, or just your curiosity. Tea and conversation for everyone.",
	"film-night": "Watch student-made short films, then chat with the filmmakers in a relaxed setting.",
	"garden-day": "Help prepare the campus garden for the season and take home a herb cutting."
};

const colors = { "Arts & culture": "#ed7962", Technology: "#648de0", Outdoors: "#72a975", Community: "#d5aa3e", Wellness: "#ba7ca7", Academic: "#648de0" };
const images = Object.fromEntries(starterEvents.map((event) => [event.category, event.image]));
const grid = document.querySelector("#events-grid");
const search = document.querySelector("#event-search");
const eventDialog = document.querySelector("#event-dialog");
const eventForm = document.querySelector("#event-form");
const registrationDialog = document.querySelector("#registration-dialog");
const registrationForm = document.querySelector("#registration-form");
const profileDialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
const toast = document.querySelector("#toast");
const storedEventData = read("gather-events", null);
let events = storedEventData && !Array.isArray(storedEventData) && Array.isArray(storedEventData.items)
	? storedEventData.items
	: [...starterEvents, ...(Array.isArray(storedEventData) ? storedEventData : [])];
let rsvps = read("gather-rsvps", []);
let registrations = read("gather-registrations", {});
if (!registrations || Array.isArray(registrations) || typeof registrations !== "object") registrations = {};
let clubProfile = read("gather-club-profile", null);
let filter = "All events";
let view = "discover";
let latestFirst = false;
let toastTimer;
let activeRegistrationId = null;

function read(key, fallback) {
	try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function save() {
	try {
		localStorage.setItem("gather-events", JSON.stringify({ version: 2, items: events }));
		localStorage.setItem("gather-rsvps", JSON.stringify(rsvps));
		localStorage.setItem("gather-registrations", JSON.stringify(registrations));
	} catch { showToast("Changes could not be saved in this browser."); }
}

function safe(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatDate(dateString) {
	const date = new Date(`${dateString}T12:00:00`);
	return { month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: date.toLocaleDateString("en-US", { day: "numeric" }), weekday: date.toLocaleDateString("en-US", { weekday: "short" }) };
}

function formatTime(timeString) {
	const [hours, minutes] = timeString.split(":").map(Number);
	return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function card(event) {
	const date = formatDate(event.date);
	const isGoing = rsvps.includes(event.id);
	const description = event.description || starterDescriptions[event.id] || `${event.club} welcomes new faces to join in.`;
	const isFull = event.capacity && event.going >= event.capacity && !isGoing;
	return `<article class="event-card">
		<div class="event-image-wrap"><img class="event-image" src="${safe(event.image)}" alt="" loading="lazy"><div class="event-date"><span>${date.month}</span><span>${date.day}</span></div></div>
		<div class="event-info"><div class="event-category"><span class="category-dot" style="background:${colors[event.category] || "#79a357"}"></span>${safe(event.category)} <span class="event-host">· ${safe(event.club)}</span></div>
		<h3 class="event-title" title="${safe(event.title)}">${safe(event.title)}</h3><p class="event-description">${safe(description)}</p>
		<div class="event-meta"><time datetime="${safe(event.date)}T${safe(event.time)}">◷ ${date.weekday}, ${date.month} ${date.day} · ${formatTime(event.time)}</time><span class="event-venue" title="Venue: ${safe(event.location)}">⌖ ${safe(event.location)}</span></div>
		<div class="event-bottom"><span class="event-attendees">${event.going} going${event.capacity ? ` · ${Math.max(0, event.capacity - event.going)} spots left` : ""}</span><button class="rsvp-button${isGoing ? " is-going" : ""}" data-register="${safe(event.id)}" aria-pressed="${isGoing}" ${isFull ? "disabled" : ""}>${isGoing ? "Registered ✓" : isFull ? "Full" : "Register"}</button></div></div></article>`;
}

function renderEvents() {
	const query = search.value.trim().toLowerCase();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const weekEnd = new Date(today);
	weekEnd.setDate(weekEnd.getDate() + 7);
	const visible = events.filter((event) => {
		const date = new Date(`${event.date}T12:00:00`);
		const matchesSearch = !query || [event.title, event.club, event.category, event.location, event.description, starterDescriptions[event.id]].join(" ").toLowerCase().includes(query);
		const matchesFilter = filter === "All events" || (filter === "This week" && date >= today && date <= weekEnd) || event.category === filter;
		const matchesView = view !== "my-events" || rsvps.includes(event.id);
		return matchesSearch && matchesFilter && matchesView && (date >= today || view === "manage");
	}).sort((left, right) => latestFirst ? right.date.localeCompare(left.date) : left.date.localeCompare(right.date));
	grid.innerHTML = visible.map(card).join("");
	document.querySelector("#empty-state").hidden = visible.length > 0;
	document.querySelector("#load-more").hidden = visible.length === 0;
	document.querySelector("#all-count").textContent = events.filter((event) => new Date(`${event.date}T12:00:00`) >= today).length;
	const count = document.querySelector("#rsvp-count");
	count.textContent = rsvps.length;
	count.classList.toggle("has-count", rsvps.length > 0);
	const featured = events.find((event) => event.id === "music-night");
	if (featured) {
		document.querySelector("#feature-attendance").textContent = featured.going;
		const featureButton = document.querySelector("[data-feature-rsvp]");
		const featureRegistered = rsvps.includes(featured.id);
		featureButton.classList.toggle("is-going", featureRegistered);
		featureButton.innerHTML = featureRegistered ? "Registered ✓" : "Count me in <span>↗</span>";
	}
	if (view === "admin") renderAdmin();
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add("is-visible");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function selectFilter(value) {
	filter = value;
	document.querySelectorAll(".filter-tab").forEach((tab) => {
		const selected = tab.dataset.filter === value;
		tab.classList.toggle("is-selected", selected);
		tab.setAttribute("aria-selected", String(selected));
	});
	renderEvents();
}

function showView(value, label) {
	view = value;
	filter = "All events";
	const clubPage = value === "club-page";
	const adminPage = value === "admin";
	document.querySelector("#breadcrumb-current").textContent = label;
	document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("is-active", link.dataset.view === value));
	document.querySelector("#discover-view").hidden = clubPage || adminPage;
	document.querySelector("#club-page-view").hidden = !clubPage;
	document.querySelector("#admin-view").hidden = !adminPage;
	document.querySelector(".search-box").hidden = adminPage;
	if (value === "my-events") document.querySelector("#events-heading").innerHTML = 'Your plans <span class="heading-period">.</span>';
	else if (value === "manage") document.querySelector("#events-heading").innerHTML = 'Your club events <span class="heading-period">.</span>';
	else if (value === "discover") document.querySelector("#events-heading").innerHTML = 'Upcoming events <span class="heading-period">.</span>';
	if (clubPage) renderProfile();
	else if (adminPage) renderAdmin();
	else selectFilter(filter);
}

function renderProfile() {
	const hasProfile = Boolean(clubProfile);
	document.querySelector("#club-empty").hidden = hasProfile;
	document.querySelector("#club-profile").hidden = !hasProfile;
	document.querySelector("#edit-profile-button").innerHTML = hasProfile ? "Edit introduction" : "<span>＋</span>Create club page";
	if (!hasProfile) return;
	document.querySelector("#profile-name").textContent = clubProfile.name;
	document.querySelector("#profile-category").textContent = clubProfile.category;
	document.querySelector("#profile-tagline").textContent = clubProfile.tagline;
	document.querySelector("#profile-description").textContent = clubProfile.description;
	document.querySelector("#profile-meeting").textContent = clubProfile.meeting || "Meeting details coming soon";
	document.querySelector("#profile-contact").textContent = clubProfile.contact;
	document.querySelector("#profile-cover").src = clubProfile.cover || images[clubProfile.category] || images.Community;
}

function renderAdmin() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const upcoming = events.filter((event) => new Date(`${event.date}T12:00:00`) >= today);
	document.querySelector("#admin-event-count").textContent = upcoming.length;
	document.querySelector("#admin-registration-count").textContent = Object.keys(registrations).length;
	document.querySelector("#admin-club-count").textContent = clubProfile ? 1 : 0;
	document.querySelector("#admin-event-label").textContent = `${events.length} event${events.length === 1 ? "" : "s"}`;
	document.querySelector("#admin-events-empty").hidden = events.length > 0;
	document.querySelector("#admin-events-body").innerHTML = [...events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => {
		const date = formatDate(event.date);
		return `<tr><td><strong>${safe(event.title)}</strong><small>${safe(event.club)} · ${safe(event.category)}</small></td><td>${date.weekday}, ${date.month} ${date.day}<small>${formatTime(event.time)}</small></td><td>${safe(event.location)}</td><td>${event.going}${event.capacity ? ` / ${event.capacity}` : ""}</td><td class="admin-actions"><button type="button" data-edit-event="${safe(event.id)}" aria-label="Edit ${safe(event.title)}">Edit</button><button type="button" class="delete-action" data-delete-event="${safe(event.id)}" aria-label="Delete ${safe(event.title)}">Delete</button></td></tr>`;
	}).join("");
	const eventFilter = document.querySelector("#registration-event-filter"), selectedEvent = eventFilter.value;
	eventFilter.innerHTML = `<option value="">All events</option>${[...events].sort((a, b) => a.title.localeCompare(b.title)).map((event) => `<option value="${safe(event.id)}">${safe(event.title)}</option>`).join("")}`;
	eventFilter.value = selectedEvent;
	const query = document.querySelector("#registration-search").value.trim().toLowerCase();
	const year = document.querySelector("#registration-year-filter").value;
	const records = Object.entries(registrations).map(([id, student]) => ({ ...student, id, event: events.find((item) => item.id === id) })).filter((record) => {
		const searchable = [record.name, record.email, record.phone, record.college, record.year, record.event?.title, record.event?.club, record.event?.location].join(" ").toLowerCase();
		return record.event && (!query || searchable.includes(query)) && (!eventFilter.value || record.id === eventFilter.value) && (!year || record.year === year);
	}).sort((a, b) => a.name.localeCompare(b.name));
	document.querySelector("#admin-registration-label").textContent = `${records.length} student${records.length === 1 ? "" : "s"}`;
	document.querySelector("#admin-registrations-empty").hidden = records.length > 0;
	document.querySelector("#admin-registrations-body").innerHTML = records.map((record) => `<tr><td><strong>${safe(record.name)}</strong><small>${safe(record.year)}</small></td><td>${safe(record.event.title)}<small>${formatDate(record.event.date).month} ${formatDate(record.event.date).day}</small></td><td>${safe(record.college)}<small>${safe(record.year)}</small></td><td><a href="mailto:${safe(record.email)}">${safe(record.email)}</a><small><a href="tel:${safe(record.phone)}">${safe(record.phone)}</a></small></td><td class="admin-actions"><button type="button" class="delete-action" data-delete-registration="${safe(record.id)}" aria-label="Remove ${safe(record.name)} registration">Remove</button></td></tr>`).join("");
}

function openRegistration(id) {
	const event = events.find((item) => item.id === id);
	if (!event) return;
	if (!rsvps.includes(id) && event.capacity && event.going >= event.capacity) { showToast("This event is full."); return; }
	activeRegistrationId = id;
	const registration = registrations[id];
	registrationForm.reset();
	registrationForm.elements.eventId.value = id;
	if (registration) Object.entries(registration).forEach(([key, value]) => { if (registrationForm.elements[key]) registrationForm.elements[key].value = value; });
	document.querySelector("#registration-event-name").textContent = `${event.title} · ${event.location}`;
	document.querySelector("#cancel-registration").hidden = !rsvps.includes(id);
	document.querySelector("#registration-submit").innerHTML = `${registration ? "Update registration" : "Complete registration"} <span>↗</span>`;
	registrationDialog.showModal();
}

function cancelRegistration() {
	const event = events.find((item) => item.id === activeRegistrationId);
	if (event) event.going = Math.max(0, event.going - 1);
	rsvps = rsvps.filter((id) => id !== activeRegistrationId);
	delete registrations[activeRegistrationId];
	save();
	registrationDialog.close();
	renderEvents();
	showToast("Your registration has been cancelled.");
}

function openProfile() {
	profileForm.reset();
	if (clubProfile) Object.entries(clubProfile).forEach(([key, value]) => { if (profileForm.elements[key]) profileForm.elements[key].value = value; });
	document.querySelector("#profile-dialog-title").innerHTML = clubProfile ? 'Edit your <span>club page.</span>' : 'Introduce your <span>club.</span>';
	profileDialog.showModal();
}

function openEventDialog(id = "") {
	eventForm.reset();
	const selectedEvent = events.find((event) => event.id === id);
	eventForm.elements.eventId.value = selectedEvent?.id || "";
	const dateInput = eventForm.elements.date;
	if (selectedEvent) {
		for (const key of ["title", "club", "category", "date", "time", "location", "capacity", "description"]) {
			if (eventForm.elements[key] && selectedEvent[key] !== undefined) eventForm.elements[key].value = selectedEvent[key];
		}
		dateInput.removeAttribute("min");
		document.querySelector("#event-dialog-title").innerHTML = 'Edit event <span>details.</span>';
		eventForm.querySelector('[type="submit"]').innerHTML = "Save changes <span>✓</span>";
	} else {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		dateInput.min = tomorrow.toISOString().slice(0, 10);
		document.querySelector("#event-dialog-title").innerHTML = 'Create an <span>event.</span>';
		eventForm.querySelector('[type="submit"]').innerHTML = '<span>＋</span>Publish event';
	}
	eventDialog.showModal();
}

document.addEventListener("click", (event) => {
	if (event.target.closest("[data-open-event]")) {
		openEventDialog(); return;
	}
	if (event.target.closest("[data-open-profile]")) { openProfile(); return; }
	const close = event.target.closest("[data-close]");
	if (close) { document.getElementById(close.dataset.close).close(); return; }
	const register = event.target.closest("[data-register]");
	if (register) { openRegistration(register.dataset.register); return; }
	const editEvent = event.target.closest("[data-edit-event]");
	if (editEvent) { openEventDialog(editEvent.dataset.editEvent); return; }
	const deleteEvent = event.target.closest("[data-delete-event]");
	if (deleteEvent) {
		const selectedEvent = events.find((item) => item.id === deleteEvent.dataset.deleteEvent);
		if (!selectedEvent || !confirm(`Delete “${selectedEvent.title}” and its registrations?`)) return;
		events = events.filter((item) => item.id !== selectedEvent.id);
		rsvps = rsvps.filter((id) => id !== selectedEvent.id);
		delete registrations[selectedEvent.id];
		save(); renderEvents(); showToast("Event and registrations deleted."); return;
	}
	const deleteRegistration = event.target.closest("[data-delete-registration]");
	if (deleteRegistration) {
		const id = deleteRegistration.dataset.deleteRegistration, student = registrations[id], selectedEvent = events.find((item) => item.id === id);
		if (!student || !confirm(`Remove ${student.name}'s registration${selectedEvent ? ` for ${selectedEvent.title}` : ""}?`)) return;
		delete registrations[id]; rsvps = rsvps.filter((eventId) => eventId !== id);
		if (selectedEvent) selectedEvent.going = Math.max(0, selectedEvent.going - 1);
		save(); renderEvents(); showToast("Registration removed."); return;
	}
	const tab = event.target.closest("[data-filter]");
	if (tab) { showView("discover", "Discover"); selectFilter(tab.dataset.filter); return; }
	const category = event.target.closest(".club-link[data-category]");
	if (category) { showView("discover", "Discover"); selectFilter(category.dataset.category); return; }
	const nav = event.target.closest("[data-view]");
	if (nav) { showView(nav.dataset.view, nav.textContent.trim()); return; }
	if (event.target.closest("[data-view-all]")) { showView("discover", "Discover"); return; }
	if (event.target.closest("[data-feature-rsvp]")) { openRegistration("music-night"); return; }
	if (event.target.closest(".feature-save")) { const button = event.target.closest(".feature-save"); button.textContent = button.textContent === "♡" ? "♥" : "♡"; showToast("Featured event saved."); return; }
	if (event.target.closest("#join-club-button")) showToast("Club interest feature is ready when a club page is published.");
});

search.addEventListener("input", renderEvents);
document.querySelector("#sort-button").addEventListener("click", (event) => { latestFirst = !latestFirst; event.currentTarget.innerHTML = `<span>↕</span> ${latestFirst ? "Latest" : "Soonest"}`; renderEvents(); });
document.querySelector("#load-more").addEventListener("click", () => showToast("That's everything on the calendar for now."));
document.querySelector(".notification-button").addEventListener("click", () => showToast("You're all caught up on notifications."));
document.querySelector(".profile-button").addEventListener("click", () => showToast("Signed in as Jordan Davis."));
for (const input of ["#registration-search", "#registration-event-filter", "#registration-year-filter"]) document.querySelector(input).addEventListener("input", renderAdmin);
document.querySelector("#registration-event-filter").addEventListener("change", renderAdmin);
document.querySelector("#registration-year-filter").addEventListener("change", renderAdmin);
for (const dialog of [eventDialog, registrationDialog, profileDialog]) dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector("#cancel-registration").addEventListener("click", cancelRegistration);

registrationForm.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!registrationForm.reportValidity()) return;
	const data = new FormData(registrationForm), id = data.get("eventId"), selectedEvent = events.find((item) => item.id === id);
	if (!selectedEvent) return;
	if (!rsvps.includes(id) && selectedEvent.capacity && selectedEvent.going >= selectedEvent.capacity) { registrationDialog.close(); showToast("This event just filled up."); return; }
	registrations[id] = Object.fromEntries(["name", "email", "phone", "college", "year"].map((key) => [key, data.get(key).trim()]));
	if (!rsvps.includes(id)) { rsvps.push(id); selectedEvent.going += 1; }
	save();
	registrationDialog.close();
	renderEvents();
	showToast(`Registration saved for ${selectedEvent.title}.`);
});

eventForm.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!eventForm.reportValidity()) return;
	const data = new FormData(eventForm), category = data.get("category"), id = data.get("eventId");
	const details = { title: data.get("title").trim(), club: data.get("club").trim(), category, date: data.get("date"), time: data.get("time"), location: data.get("location").trim(), capacity: Number(data.get("capacity")), description: data.get("description").trim() };
	if (id) {
		const selectedEvent = events.find((item) => item.id === id);
		if (!selectedEvent) return;
		Object.assign(selectedEvent, details, { image: images[category] || selectedEvent.image });
	} else {
		events.push({ id: `event-${Date.now()}`, ...details, going: 0, image: images[category] || images.Community });
	}
	const stayInAdmin = view === "admin";
	save(); eventForm.reset(); eventDialog.close();
	if (stayInAdmin) showView("admin", "Admin dashboard");
	else showView("manage", "Manage events");
	showToast(id ? "Event changes saved." : "Your event is live on the campus calendar.");
});

profileForm.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!profileForm.reportValidity()) return;
	const data = new FormData(profileForm);
	clubProfile = Object.fromEntries(["name", "category", "meeting", "tagline", "description", "contact", "cover"].map((key) => [key, data.get(key).trim()]));
	try { localStorage.setItem("gather-club-profile", JSON.stringify(clubProfile)); } catch { showToast("Your club introduction could not be saved."); }
	profileDialog.close(); showView("club-page", "Club homepage"); showToast("Your club introduction is published.");
});

document.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); search.focus(); } });
renderEvents();
