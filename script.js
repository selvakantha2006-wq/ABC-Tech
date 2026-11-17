const initialDepartments = [
  { id: "it", name: "IT Department", shortName: "IT", head: { name: "Suresh", id: "EID001" }, members: [
    { name: "Sita", id: "EID002", designation: "Team Member" },
    { name: "Selva Kantha", id: "EID003", designation: "Team Member" },
    { name: "Manikandan", id: "EID004", designation: "Team Member" }
  ] },
  { id: "digital-marketing", name: "Digital Marketing Department", shortName: "Digital Marketing", head: { name: "Gokul", id: "EID005" }, members: [
    { name: "Karthick", id: "EID006", designation: "Team Member" },
    { name: "Suba", id: "EID007", designation: "Team Member" }
  ] },
  { id: "hr", name: "HR Department", shortName: "HR", head: null, members: [] },
  { id: "admin", name: "Admin Department", shortName: "Admin", head: null, members: [] },
  { id: "system-development", name: "System Development Department", shortName: "System Development", head: null, members: [] }
];

const departmentStyles = {
  it: { icon: "⌘", color: "#eaf0ff", ink: "#5876d5" },
  "digital-marketing": { icon: "✳", color: "#e9f6f0", ink: "#53a783" },
  hr: { icon: "♡", color: "#fcecf0", ink: "#d2748b" },
  admin: { icon: "▣", color: "#f1edfc", ink: "#8a70ce" },
  "system-development": { icon: "◇", color: "#fff3e4", ink: "#d8994b" }
};

const holidays = [
  { name: "New Year's Day", date: "January 1, 2026" },
  { name: "Martin Luther King Jr. Day", date: "January 19, 2026" },
  { name: "Memorial Day", date: "May 25, 2026" },
  { name: "Independence Day", date: "July 3, 2026" },
  { name: "Labor Day", date: "September 7, 2026" },
  { name: "Thanksgiving Day", date: "November 26, 2026" },
  { name: "Christmas Day", date: "December 25, 2026" }
];

const initialAnnouncements = [
  { id: "welcome-2026", title: "Welcome to our employee intranet", body: "Your new home for company news, team information, and important dates. We’re glad you’re here!", date: "November 17, 2026" },
  { id: "team-meeting", title: "All-hands meeting — save the date", body: "Join us for our next company-wide update. More details and a calendar invitation are coming soon.", date: "November 12, 2026" },
  { id: "volunteer-day", title: "ABC Community Day is coming up", body: "We’re looking forward to coming together and giving back to our community. Talk to HR to learn more.", date: "November 5, 2026" }
];

const ANNOUNCEMENTS_KEY = "abc-intranet-announcements";
const DEPARTMENTS_KEY = "abc-intranet-departments";
const loginScreen = document.getElementById("login-screen");
const appShell = document.getElementById("app-shell");
const announcementForm = document.getElementById("announcement-form");

function readAnnouncements() {
  try {
    const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (saved === null) return [...initialAnnouncements];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((item) =>
      item && typeof item.id === "string" && typeof item.title === "string" &&
      typeof item.body === "string" && typeof item.date === "string"
    )) {
      throw new Error("Saved announcements have an invalid format.");
    }
    return parsed;
  } catch (error) {
    console.error("Could not load saved announcements:", error);
    return [...initialAnnouncements];
  }
}

let announcements = readAnnouncements();

function readDepartments() {
  try {
    const saved = localStorage.getItem(DEPARTMENTS_KEY);
    if (saved === null) return initialDepartments.map((department) => ({
      ...department,
      head: department.head ? { ...department.head } : null,
      members: department.members.map((member) => ({ ...member }))
    }));
    const parsed = JSON.parse(saved);
    const expectedIds = initialDepartments.map((department) => department.id);
    const valid = Array.isArray(parsed) && parsed.length === expectedIds.length &&
      new Set(parsed.map((department) => department.id)).size === expectedIds.length &&
      parsed.every((department) => expectedIds.includes(department.id) &&
        typeof department.name === "string" && Array.isArray(department.members) &&
        (department.head === null || (department.head &&
          typeof department.head.name === "string" && typeof department.head.id === "string")) &&
        department.members.every((member) => member && typeof member.name === "string" &&
          typeof member.id === "string" && typeof member.designation === "string"));
    const ids = valid ? parsed.flatMap((department) =>
      [...(department.head ? [department.head.id] : []), ...department.members.map((member) => member.id)]
    ) : [];
    if (!valid || new Set(ids).size !== ids.length) {
      throw new Error("Saved employee directory has an invalid format.");
    }
    return parsed;
  } catch (error) {
    console.error("Could not load the saved employee directory:", error);
    return initialDepartments.map((department) => ({
      ...department,
      head: department.head ? { ...department.head } : null,
      members: department.members.map((member) => ({ ...member }))
    }));
  }
}

let departments = readDepartments();

function saveDepartments(nextDepartments) {
  try {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(nextDepartments));
    departments = nextDepartments;
    renderDepartments();
  } catch (error) {
    console.error("Could not save the employee directory:", error);
    window.alert("The employee directory could not be saved in this browser. Check your browser storage settings and try again.");
  }
}

function nextEmployeeId() {
  const usedIds = departments.flatMap((department) =>
    [...(department.head ? [department.head.id] : []), ...department.members.map((member) => member.id)]
  );
  const highest = usedIds.reduce((max, id) => {
    const match = /^EID(\d+)$/.exec(id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `EID${String(highest + 1).padStart(3, "0")}`;
}

function getEmployee(id) {
  for (const department of departments) {
    const employee = department.members.find((member) => member.id === id);
    if (employee) return { employee, department };
  }
  return null;
}

function saveAnnouncements() {
  try {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  } catch (error) {
    console.error("Could not save announcements:", error);
    window.alert("Your announcement could not be saved in this browser. Check your browser storage settings and try again.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderRecentAnnouncements() {
  const container = document.getElementById("recent-announcements");
  const recent = announcements.slice(0, 3);
  container.innerHTML = recent.length ? recent.map((announcement) => `
    <article class="recent-item">
      <span class="recent-dot" aria-hidden="true"></span>
      <div>
        <h3>${escapeHtml(announcement.title)}</h3>
        <p>${escapeHtml(announcement.body)}</p>
        <time>${escapeHtml(announcement.date)}</time>
      </div>
    </article>
  `).join("") : '<p class="empty-state">No announcements yet. Check back soon.</p>';
}

function renderAnnouncements() {
  const container = document.getElementById("announcement-list");
  document.getElementById("announcement-count").textContent =
    `${announcements.length} ${announcements.length === 1 ? "announcement" : "announcements"}`;
  document.getElementById("stat-updates").textContent = announcements.length;
  document.getElementById("announcement-badge").textContent = announcements.length || "";
  container.innerHTML = announcements.length ? announcements.map((announcement) => `
    <article class="announcement-card">
      <span class="announcement-marker" aria-hidden="true">▤</span>
      <div class="announcement-content">
        <h2>${escapeHtml(announcement.title)}</h2>
        ${announcement.body ? `<p>${escapeHtml(announcement.body)}</p>` : ""}
        <time>${escapeHtml(announcement.date)}</time>
      </div>
      <button class="delete-button" type="button" data-delete-id="${escapeHtml(announcement.id)}" aria-label="Delete ${escapeHtml(announcement.title)}">Delete</button>
    </article>
  `).join("") : '<div class="panel empty-state">There are no company updates yet. Add the first announcement above.</div>';
  renderRecentAnnouncements();
}

function renderDepartments() {
  const totalEmployees = departments.reduce((total, department) =>
    total + department.members.length + (department.head ? 1 : 0), 0
  );
  document.getElementById("stat-employees").textContent = totalEmployees;
  document.getElementById("directory-total").textContent =
    `${totalEmployees} ${totalEmployees === 1 ? "employee" : "employees"} across ${departments.length} departments`;
  document.getElementById("employee-department").innerHTML = departments.map((department) =>
    `<option value="${escapeHtml(department.id)}">${escapeHtml(department.name)}</option>`
  ).join("");
  document.getElementById("department-grid").innerHTML = departments.map((department) => {
    const style = departmentStyles[department.id];
    const departmentCount = department.members.length + (department.head ? 1 : 0);
    const headHtml = department.head ? `
      <div class="employee-row department-head-row">
        <span class="employee-avatar" style="background:${style.color};color:${style.ink}" aria-hidden="true">${escapeHtml(department.head.name.slice(0, 1).toUpperCase())}</span>
        <span class="employee-identity"><strong>${escapeHtml(department.head.name)}</strong><small>${escapeHtml(department.head.id)} <i>·</i> Department Head</small></span>
        <button class="employee-action" type="button" data-edit-head="${escapeHtml(department.id)}">Change head</button>
      </div>
    ` : `
      <div class="employee-row department-head-row">
        <span class="employee-avatar empty-avatar" aria-hidden="true">＋</span>
        <span class="employee-identity"><strong>To be added</strong><small>Department Head</small></span>
        <button class="employee-action" type="button" data-edit-head="${escapeHtml(department.id)}">Add head</button>
      </div>
    `;
    const membersHtml = department.members.length ? department.members.map((member) => `
      <div class="employee-row">
        <span class="employee-avatar" style="background:${style.color};color:${style.ink}" aria-hidden="true">${escapeHtml(member.name.slice(0, 1).toUpperCase())}</span>
        <span class="employee-identity"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)} <i>·</i> ${escapeHtml(member.designation)}</small></span>
        <span class="employee-actions">
          <button class="employee-action" type="button" data-edit-employee="${escapeHtml(member.id)}">Edit</button>
          <button class="employee-action employee-delete" type="button" data-delete-employee="${escapeHtml(member.id)}">Delete</button>
        </span>
      </div>
    `).join("") : '<p class="department-empty">Team members to be added.</p>';
    return `
      <article class="department-card directory-card">
        <div class="directory-card-heading">
          <span class="department-symbol" style="background:${style.color};color:${style.ink}" aria-hidden="true">${style.icon}</span>
          <div class="department-info">
            <h2>${escapeHtml(department.name)}</h2>
            <span class="department-count">${departmentCount} ${departmentCount === 1 ? "employee" : "employees"}</span>
          </div>
        </div>
        <div class="directory-group">
          <h3>DEPARTMENT HEAD</h3>
          ${headHtml}
        </div>
        <div class="directory-group">
          <h3>TEAM MEMBERS <span>${department.members.length}</span></h3>
          ${membersHtml}
        </div>
      </article>
    `;
  }).join("");
  document.getElementById("department-preview").innerHTML = departments.map((department) => `
    <div class="preview-team">
      <span class="team-dot" style="background:${departmentStyles[department.id].ink}" aria-hidden="true"></span>
      <strong>${escapeHtml(department.shortName)}</strong>
      <small>${department.members.length + (department.head ? 1 : 0)} ${(department.members.length + (department.head ? 1 : 0)) === 1 ? "member" : "members"}</small>
    </div>
  `).join("");
}

function renderHolidays() {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });
  document.getElementById("holiday-list").innerHTML = holidays.map((holiday) => {
    const date = new Date(`${holiday.date} 00:00:00 UTC`);
    return `
      <div class="holiday-row">
        <span class="holiday-name"><i class="holiday-dot" aria-hidden="true"></i>${escapeHtml(holiday.name)}</span>
        <span class="holiday-date">${escapeHtml(holiday.date)}</span>
        <span class="holiday-day">${formatter.format(date)}</span>
      </div>
    `;
  }).join("");
}

function showPage(pageName) {
  const pageTitles = {
    dashboard: "Dashboard",
    departments: "Employee directory",
    announcements: "Company updates",
    holidays: "Holidays"
  };
  if (!pageTitles[pageName]) return;

  document.querySelectorAll(".page-section").forEach((section) => {
    const isActive = section.id === `page-${pageName}`;
    section.classList.toggle("active", isActive);
    section.hidden = !isActive;
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.dataset.page === pageName;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.getElementById("breadcrumb-current").textContent = pageTitles[pageName];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("visible");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
}

function enterApp() {
  loginScreen.hidden = true;
  appShell.hidden = false;
  renderAnnouncements();
  renderDepartments();
  showPage("dashboard");
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const employeeId = document.getElementById("employee-id").value.trim();
  const password = document.getElementById("password").value;
  const validLogin = employeeId.toUpperCase() === "EMP001" && password === "12345";
  document.getElementById("login-error").hidden = validLogin;
  if (!validLogin) return;
  enterApp();
});

document.getElementById("logout-button").addEventListener("click", () => {
  appShell.hidden = true;
  loginScreen.hidden = false;
  document.getElementById("login-form").reset();
  document.getElementById("login-error").hidden = true;
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => showPage(link.dataset.page));
});

document.querySelectorAll("[data-goto]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.goto));
});

document.getElementById("add-announcement-button").addEventListener("click", () => {
  announcementForm.hidden = false;
  document.getElementById("announcement-title").focus();
});

document.getElementById("cancel-announcement").addEventListener("click", () => {
  announcementForm.hidden = true;
  announcementForm.reset();
});

function openEmployeeForm(employee, departmentId) {
  const form = document.getElementById("employee-form");
  form.reset();
  document.getElementById("employee-form-id").value = employee ? employee.id : "";
  document.getElementById("employee-name").value = employee ? employee.name : "";
  document.getElementById("employee-designation").value = employee ? employee.designation : "";
  document.getElementById("employee-department").value = departmentId || departments[0].id;
  document.getElementById("employee-form-heading").textContent = employee ? "Edit employee" : "Add employee";
  document.getElementById("employee-submit").textContent = employee ? "Save changes" : "Add employee";
  document.getElementById("head-form").hidden = true;
  form.hidden = false;
  document.getElementById("employee-name").focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("add-employee-button").addEventListener("click", () => {
  openEmployeeForm(null);
});

document.getElementById("employee-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.getElementById("employee-form-id").value;
  const name = document.getElementById("employee-name").value.trim();
  const designation = document.getElementById("employee-designation").value.trim();
  const departmentId = document.getElementById("employee-department").value;
  if (!name || !designation || !departments.some((department) => department.id === departmentId)) return;

  const current = id ? getEmployee(id) : null;
  const employee = { name, id: current ? id : nextEmployeeId(), designation };
  let nextDepartments = departments.map((department) => ({
    ...department,
    head: department.head ? { ...department.head } : null,
    members: department.members.filter((member) => !id || member.id !== id).map((member) => ({ ...member }))
  }));
  const destination = nextDepartments.find((department) => department.id === departmentId);
  destination.members.push(employee);
  saveDepartments(nextDepartments);
  document.getElementById("employee-form").hidden = true;
  document.getElementById("employee-form").reset();
});

document.getElementById("department-grid").addEventListener("click", (event) => {
  const headButton = event.target.closest("[data-edit-head]");
  if (headButton) {
    const department = departments.find((item) => item.id === headButton.dataset.editHead);
    if (!department) return;
    document.getElementById("employee-form").hidden = true;
    document.getElementById("head-form").reset();
    document.getElementById("head-department-id").value = department.id;
    document.getElementById("head-name").value = department.head ? department.head.name : "";
    document.getElementById("head-form-heading").textContent = department.head ? `Change ${department.shortName} head` : `Add ${department.shortName} head`;
    document.getElementById("head-submit").textContent = department.head ? "Save changes" : "Add department head";
    document.getElementById("head-form").hidden = false;
    document.getElementById("head-name").focus();
    document.getElementById("head-form").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const editButton = event.target.closest("[data-edit-employee]");
  if (editButton) {
    const result = getEmployee(editButton.dataset.editEmployee);
    if (result) openEmployeeForm(result.employee, result.department.id);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-employee]");
  if (deleteButton) {
    const result = getEmployee(deleteButton.dataset.deleteEmployee);
    if (!result || !window.confirm(`Delete ${result.employee.name} from the employee directory?`)) return;
    const nextDepartments = departments.map((department) => ({
      ...department,
      members: department.members.filter((member) => member.id !== result.employee.id)
    }));
    saveDepartments(nextDepartments);
  }
});

document.getElementById("head-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const departmentId = document.getElementById("head-department-id").value;
  const name = document.getElementById("head-name").value.trim();
  if (!name) return;
  const department = departments.find((item) => item.id === departmentId);
  if (!department) return;
  const head = { name, id: department.head ? department.head.id : nextEmployeeId() };
  const nextDepartments = departments.map((item) => item.id === departmentId
    ? { ...item, head }
    : { ...item, members: item.members.map((member) => ({ ...member })), head: item.head ? { ...item.head } : null }
  );
  saveDepartments(nextDepartments);
  document.getElementById("head-form").hidden = true;
  document.getElementById("head-form").reset();
});

document.querySelectorAll("[data-close-form]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = document.getElementById(button.dataset.closeForm);
    form.hidden = true;
    form.reset();
  });
});

announcementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("announcement-title").value.trim();
  const body = document.getElementById("announcement-body").value.trim();
  if (!title) return;
  announcements.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    date: new Intl.DateTimeFormat("en-US", {
      month: "long", day: "numeric", year: "numeric"
    }).format(new Date())
  });
  saveAnnouncements();
  renderAnnouncements();
  announcementForm.reset();
  announcementForm.hidden = true;
});

document.getElementById("announcement-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const announcement = announcements.find((item) => item.id === button.dataset.deleteId);
  if (!announcement || !window.confirm(`Delete "${announcement.title}"?`)) return;
  announcements = announcements.filter((item) => item.id !== announcement.id);
  saveAnnouncements();
  renderAnnouncements();
});

document.getElementById("menu-toggle").addEventListener("click", (event) => {
  const isOpen = document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-overlay").classList.toggle("visible", isOpen);
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar);
document.getElementById("today-label").textContent = new Intl.DateTimeFormat("en-US", {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
}).format(new Date());
document.getElementById("dashboard-date").textContent = new Intl.DateTimeFormat("en-US", {
  weekday: "long", day: "numeric", month: "long"
}).format(new Date()).toUpperCase();
renderDepartments();
renderHolidays();
