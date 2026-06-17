const STORAGE_KEY = "central-tecnica-atividades";
const TECHNICIANS_STORAGE_KEY = "central-tecnica-tecnicos";
const CLIENTS_STORAGE_KEY = "central-tecnica-clientes";
const USERS_STORAGE_KEY = "central-tecnica-usuarios";
const SESSION_STORAGE_KEY = "central-tecnica-sessao";
const SUPABASE_ENABLED = Boolean(
  window.SUPABASE_CONFIG?.url &&
    window.SUPABASE_CONFIG?.anonKey &&
    window.supabase?.createClient
);
const supabaseClient = SUPABASE_ENABLED
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;

const USER_ROLES = {
  supervisor: "Supervisor",
  operador: "Operador",
  tecnico: "Técnico",
  visualizador: "Visualizador",
};

const TECNICO_ALLOWED_STATUSES = ["em-deslocamento", "em-execucao", "concluida"];

const seedUsers = [
  {
    internalId: createInternalId(),
    name: "Administrador",
    username: "admin",
    password: "admin",
    role: "supervisor",
    createdAt: new Date().toISOString(),
  },
];

const statuses = [
  { id: "agendada", label: "Agendada" },
  { id: "em-deslocamento", label: "Em deslocamento" },
  { id: "em-execucao", label: "Em execução" },
  { id: "concluida", label: "Concluída" },
  { id: "improdutiva", label: "Improdutiva" },
  { id: "atrasada", label: "Atrasada" },
  { id: "reagendada", label: "Reagendada" },
  { id: "cancelada", label: "Cancelada" },
];

const priorityWeight = {
  baixa: 1,
  normal: 2,
  alta: 3,
  urgente: 4,
};

const CONFLICT_WINDOW_MINUTES = 90;

const statusReasons = {
  improdutiva: [
    "Cliente ausente",
    "Sem acesso ao local",
    "Falta de material",
    "Endereço incorreto",
    "Informação divergente",
    "Chamado duplicado",
    "Problema externo",
    "Outro",
  ],
  reagendada: [
    "Solicitação do cliente",
    "Agenda do técnico",
    "Falta de material",
    "Condição climática",
    "Dependência externa",
    "Outro",
  ],
  cancelada: [
    "Solicitação do cliente",
    "Chamado duplicado",
    "Atividade aberta indevidamente",
    "Resolvido remotamente",
    "Fora de escopo",
    "Outro",
  ],
};

const technicianStatuses = {
  disponivel: "Disponível",
  "em-rota": "Em rota",
  "em-atendimento": "Em atendimento",
  folga: "Folga",
  indisponivel: "Indisponível",
};

const seedTechnicians = [
  {
    internalId: createInternalId(),
    name: "Marcos Lima",
    phone: "(11) 98888-1020",
    region: "Centro",
    team: "Fibra",
    status: "em-atendimento",
  },
  {
    internalId: createInternalId(),
    name: "Ana Souza",
    phone: "(11) 97777-8841",
    region: "Vila Nova",
    team: "Instalação",
    status: "disponivel",
  },
  {
    internalId: createInternalId(),
    name: "Carlos Nunes",
    phone: "(11) 96666-4402",
    region: "Zona Sul",
    team: "Reparo",
    status: "em-rota",
  },
  {
    internalId: createInternalId(),
    name: "Bianca Rocha",
    phone: "(11) 95555-7304",
    region: "Centro",
    team: "Equipamentos",
    status: "disponivel",
  },
];

const seedActivities = [
  {
    internalId: createInternalId(),
    activityId: "VIVO-248901",
    ticketNumber: "CH-781244",
    customer: "Condomínio Jardim Sul",
    customerContact: "Portaria",
    customerPhone: "(11) 3333-1000",
    address: "Av. Brasil, 1450 - Centro",
    city: "São Paulo",
    district: "Centro",
    serviceType: "Reparo de fibra",
    technician: "Marcos Lima",
    scheduledAt: todayAt("08:30"),
    serviceWindow: "Manhã",
    priority: "alta",
    status: "em-execucao",
    statusReason: "",
    description: "Cliente sem sinal após manutenção na região.",
    notes: "Validar potência no CTO e registrar fotos do atendimento.",
    updatedAt: new Date().toISOString(),
    history: [{ status: "em-execucao", reason: "", at: new Date().toISOString() }],
  },
  {
    internalId: createInternalId(),
    activityId: "VIVO-248917",
    ticketNumber: "CH-781266",
    customer: "Mercado Alvorada",
    customerContact: "Cláudio",
    customerPhone: "(11) 94444-2200",
    address: "Rua Tupi, 92 - Vila Nova",
    city: "São Paulo",
    district: "Vila Nova",
    serviceType: "Instalação empresarial",
    technician: "Ana Souza",
    scheduledAt: todayAt("10:00"),
    serviceWindow: "08h às 12h",
    priority: "normal",
    status: "agendada",
    statusReason: "",
    description: "Instalação de link dedicado e testes de estabilidade.",
    notes: "Responsável no local: Cláudio.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    history: [{ status: "agendada", reason: "", at: new Date(Date.now() - 1000 * 60 * 28).toISOString() }],
  },
  {
    internalId: createInternalId(),
    activityId: "VIVO-248933",
    ticketNumber: "CH-781301",
    customer: "Residencial Primavera",
    customerContact: "Síndico",
    customerPhone: "(11) 95555-1010",
    address: "Rua das Flores, 300 - Bloco B",
    city: "São Paulo",
    district: "Zona Sul",
    serviceType: "Visita técnica",
    technician: "Carlos Nunes",
    scheduledAt: todayAt("07:40"),
    serviceWindow: "Manhã",
    priority: "urgente",
    status: "atrasada",
    statusReason: "",
    description: "Verificar intermitência reportada pelo cliente.",
    notes: "Chamado escalado pela supervisão.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    history: [{ status: "atrasada", reason: "", at: new Date(Date.now() - 1000 * 60 * 52).toISOString() }],
  },
  {
    internalId: createInternalId(),
    activityId: "VIVO-248955",
    ticketNumber: "CH-781340",
    customer: "Farmácia Popular",
    customerContact: "Gerência",
    customerPhone: "(11) 3222-4000",
    address: "Rua Amazonas, 488 - Centro",
    city: "São Paulo",
    district: "Centro",
    serviceType: "Reparo de equipamento",
    technician: "Bianca Rocha",
    scheduledAt: todayAt("09:15"),
    serviceWindow: "Comercial",
    priority: "normal",
    status: "improdutiva",
    statusReason: "Cliente ausente",
    description: "Substituição de roteador solicitada.",
    notes: "Cliente ausente no horário agendado.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    history: [{ status: "improdutiva", reason: "Cliente ausente", at: new Date(Date.now() - 1000 * 60 * 12).toISOString() }],
  },
];

const seedClients = Array.from(new Set(seedActivities.map((activity) => (activity.customer || "").trim()).filter(Boolean)))
  .sort((a, b) => a.localeCompare(b, "pt-BR"))
  .map((name) => ({
    internalId: createInternalId(),
    name,
    contact: "",
    phone: "",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

let activities = loadActivities();
let technicians = loadTechnicians();
let clients = loadClients();
let users = loadUsers();
let currentUser = null;
let selectedActivityId = activities[0]?.internalId || null;
let activeStatusTab = "";
let activeView = "dashboard";
let activeNav = "dashboard";

const elements = {
  activityList: document.querySelector("#activityList"),
  detailPanel: document.querySelector("#detailPanel"),
  resultCount: document.querySelector("#resultCount"),
  metricToday: document.querySelector("#metricToday"),
  metricTodayHint: document.querySelector("#metricTodayHint"),
  metricRunning: document.querySelector("#metricRunning"),
  metricLate: document.querySelector("#metricLate"),
  metricUnproductive: document.querySelector("#metricUnproductive"),
  searchInput: document.querySelector("#searchInput"),
  dateFilter: document.querySelector("#dateFilter"),
  techFilter: document.querySelector("#techFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  statusTabs: document.querySelector("#statusTabs"),
  sortSelect: document.querySelector("#sortSelect"),
  activityModal: document.querySelector("#activityModal"),
  activityForm: document.querySelector("#activityForm"),
  technicianModal: document.querySelector("#technicianModal"),
  technicianForm: document.querySelector("#technicianForm"),
  technicianModalTitle: document.querySelector("#technicianModalTitle"),
  openTechnicianModal: document.querySelector("#openTechnicianModal"),
  closeTechnicianModal: document.querySelector("#closeTechnicianModal"),
  cancelTechnicianForm: document.querySelector("#cancelTechnicianForm"),
  clientModal: document.querySelector("#clientModal"),
  clientForm: document.querySelector("#clientForm"),
  clientModalTitle: document.querySelector("#clientModalTitle"),
  openClientModal: document.querySelector("#openClientModal"),
  closeClientModal: document.querySelector("#closeClientModal"),
  cancelClientForm: document.querySelector("#cancelClientForm"),
  statusReasonModal: document.querySelector("#statusReasonModal"),
  statusReasonForm: document.querySelector("#statusReasonForm"),
  modalTitle: document.querySelector("#modalTitle"),
  openActivityModal: document.querySelector("#openActivityModal"),
  closeActivityModal: document.querySelector("#closeActivityModal"),
  cancelActivityForm: document.querySelector("#cancelActivityForm"),
  closeStatusReasonModal: document.querySelector("#closeStatusReasonModal"),
  cancelStatusReason: document.querySelector("#cancelStatusReason"),
  statusReasonTitle: document.querySelector("#statusReasonTitle"),
  quickStatusActivityId: document.querySelector("#quickStatusActivityId"),
  quickStatusValue: document.querySelector("#quickStatusValue"),
  quickStatusReason: document.querySelector("#quickStatusReason"),
  quickStatusNote: document.querySelector("#quickStatusNote"),
  resetDemoButton: document.querySelector("#resetDemoButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  dashboardView: document.querySelector("#dashboardView"),
  calendarView: document.querySelector("#calendarView"),
  techniciansView: document.querySelector("#techniciansView"),
  clientsView: document.querySelector("#clientsView"),
  reportsView: document.querySelector("#reportsView"),
  viewButtons: document.querySelectorAll("[data-view-button]"),
  calendarTechFilter: document.querySelector("#calendarTechFilter"),
  calendarDateFilter: document.querySelector("#calendarDateFilter"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  calendarSummary: document.querySelector("#calendarSummary"),
  calendarGrid: document.querySelector("#calendarGrid"),
  technicianSummary: document.querySelector("#technicianSummary"),
  technicianGrid: document.querySelector("#technicianGrid"),
  technicianSuggestions: document.querySelector("#technicianSuggestions"),
  customerSuggestions: document.querySelector("#customerSuggestions"),
  clientSummary: document.querySelector("#clientSummary"),
  clientGrid: document.querySelector("#clientGrid"),
  reportsSummary: document.querySelector("#reportsSummary"),
  unproductiveReasons: document.querySelector("#unproductiveReasons"),
  techRanking: document.querySelector("#techRanking"),
  fields: {
    internalId: document.querySelector("#activityInternalId"),
    activityId: document.querySelector("#activityId"),
    ticketNumber: document.querySelector("#ticketNumber"),
    customer: document.querySelector("#customer"),
    customerContact: document.querySelector("#customerContact"),
    customerPhone: document.querySelector("#customerPhone"),
    address: document.querySelector("#address"),
    city: document.querySelector("#city"),
    district: document.querySelector("#district"),
    serviceType: document.querySelector("#serviceType"),
    technician: document.querySelector("#technician"),
    scheduledAt: document.querySelector("#scheduledAt"),
    serviceWindow: document.querySelector("#serviceWindow"),
    customServiceWindow: document.querySelector("#customServiceWindow"),
    priority: document.querySelector("#priority"),
    status: document.querySelector("#status"),
    statusReason: document.querySelector("#statusReason"),
    description: document.querySelector("#description"),
    notes: document.querySelector("#notes"),
  },
  technicianFields: {
    internalId: document.querySelector("#technicianInternalId"),
    name: document.querySelector("#technicianName"),
    phone: document.querySelector("#technicianPhone"),
    region: document.querySelector("#technicianRegion"),
    team: document.querySelector("#technicianTeam"),
    status: document.querySelector("#technicianStatus"),
  },
  clientFields: {
    internalId: document.querySelector("#clientInternalId"),
    name: document.querySelector("#clientName"),
    contact: document.querySelector("#clientContact"),
    phone: document.querySelector("#clientPhone"),
    notes: document.querySelector("#clientNotes"),
  },
  statusReasonField: document.querySelector("#statusReasonField"),
  customServiceWindowField: document.querySelector("#customServiceWindowField"),
  activityConflictWarning: document.querySelector("#activityConflictWarning"),
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  appShell: document.querySelector("#appShell"),
  logoutButton: document.querySelector("#logoutButton"),
  sidebarUserName: document.querySelector("#sidebarUserName"),
  sidebarUserRole: document.querySelector("#sidebarUserRole"),
  usersView: document.querySelector("#usersView"),
  usersTableBody: document.querySelector("#usersTableBody"),
  userModal: document.querySelector("#userModal"),
  userForm: document.querySelector("#userForm"),
  userModalTitle: document.querySelector("#userModalTitle"),
  openUserModal: document.querySelector("#openUserModal"),
  closeUserModal: document.querySelector("#closeUserModal"),
  cancelUserForm: document.querySelector("#cancelUserForm"),
  calendarDetailPanel: document.querySelector("#calendarDetailPanel"),
  userFields: {
    internalId: document.querySelector("#userInternalId"),
    name: document.querySelector("#userDisplayName"),
    username: document.querySelector("#userUsername"),
    password: document.querySelector("#userPassword"),
    role: document.querySelector("#userRole"),
  },
};

initialize();

function initialize() {
  bindAuthEvents();
  restoreSession();
}

function bindAuthEvents() {
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.logoutButton?.addEventListener("click", logout);
}

async function restoreSession() {
  if (SUPABASE_ENABLED) {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session?.user) {
      showLoginScreen();
      return;
    }
    const profile = await fetchProfile(data.session.user.id);
    if (!profile) {
      await supabaseClient.auth.signOut();
      showLoginScreen();
      return;
    }
    await loadRemoteData();
    startApp(profile);
    return;
  }

  const sessionUserId = readSession();
  if (!sessionUserId) {
    showLoginScreen();
    return;
  }

  const user = users.find((item) => item.internalId === sessionUserId);
  if (!user) {
    clearSession();
    showLoginScreen();
    return;
  }

  startApp(user);
}

async function handleLogin(event) {
  event.preventDefault();
  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;

  if (SUPABASE_ENABLED) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error || !data.user) {
      elements.loginError.textContent = "E-mail ou senha inválidos.";
      elements.loginError.classList.remove("hidden-field");
      return;
    }
    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      elements.loginError.textContent = "Usuário sem perfil configurado.";
      elements.loginError.classList.remove("hidden-field");
      return;
    }
    await loadRemoteData();
    elements.loginError.classList.add("hidden-field");
    startApp(profile);
    return;
  }

  const user = users.find(
    (item) => normalize(item.username) === normalize(username) && item.password === password
  );

  if (!user) {
    elements.loginError.textContent = "Usuário ou senha inválidos.";
    elements.loginError.classList.remove("hidden-field");
    return;
  }

  elements.loginError.classList.add("hidden-field");
  writeSession(user.internalId);
  startApp(user);
}

async function logout() {
  if (!confirm("Deseja sair do sistema?")) {
    return;
  }
  if (SUPABASE_ENABLED) {
    await supabaseClient.auth.signOut();
  }
  clearSession();
  currentUser = null;
  showLoginScreen();
}

function showLoginScreen() {
  document.body.classList.add("login-active");
  document.body.classList.remove("app-active");
  elements.loginScreen?.classList.remove("hidden-field");
  elements.appShell?.classList.add("hidden-field");
  elements.loginForm?.reset();
  elements.loginError?.classList.add("hidden-field");
}

function startApp(user) {
  currentUser = user;
  document.body.classList.remove("login-active");
  document.body.classList.add("app-active");
  elements.loginScreen?.classList.add("hidden-field");
  elements.appShell?.classList.remove("hidden-field");

  configureRoleDefaults();
  elements.dateFilter.value = new Date().toISOString().slice(0, 10);
  elements.calendarDateFilter.value = new Date().toISOString().slice(0, 10);
  populateStatusOptions();
  bindEvents();
  updateSidebarUser();
  applyPermissions();
  render();
}

function configureRoleDefaults() {
  if (isTecnico()) {
    activeNav = "calendar";
    activeView = "calendar";
    if (elements.calendarTechFilter) {
      elements.calendarTechFilter.value = currentUser.name;
    }
  } else {
    activeNav = activeNav || "dashboard";
    activeView = activeNav === "activities" ? "dashboard" : activeNav;
  }
}

function updateSidebarUser() {
  if (!currentUser) {
    return;
  }
  elements.sidebarUserName.textContent = currentUser.name;
  elements.sidebarUserRole.textContent = USER_ROLES[currentUser.role] || currentUser.role;
  elements.sidebarUserRole.className = `sidebar-user-role badge role-${currentUser.role}`;
}

function isSupervisor() {
  return currentUser?.role === "supervisor";
}

function isTecnico() {
  return currentUser?.role === "tecnico";
}

function isOperador() {
  return currentUser?.role === "operador";
}

function isVisualizador() {
  return currentUser?.role === "visualizador";
}

function canManageUsers() {
  return isSupervisor();
}

function canSeeReports() {
  return isSupervisor();
}

function canDelete() {
  return isSupervisor();
}

function canCreateOrEdit() {
  return isSupervisor();
}

function canCreateActivity() {
  return isSupervisor() || isOperador();
}

function isActivityOwner(activity) {
  return activity?.createdBy === currentUser?.internalId || normalize(activity?.criadoPor) === normalize(currentUser?.name);
}

function canEditActivity(activity) {
  if (isSupervisor()) {
    return true;
  }
  return isOperador() && isActivityOwner(activity);
}

function canDeleteActivity(activity) {
  if (isSupervisor()) {
    return true;
  }
  return isOperador() && isActivityOwner(activity);
}

function canChangeActivityStatus(activity) {
  if (isSupervisor()) {
    return true;
  }
  if (isTecnico()) {
    return normalize(activity.technician) === normalize(currentUser.name);
  }
  if (isOperador()) {
    return isActivityOwner(activity);
  }
  return false;
}

function applyPermissions() {
  if (!currentUser) {
    return;
  }

  document.body.dataset.userRole = currentUser.role;

  elements.viewButtons.forEach((button) => {
    const allowed = (button.dataset.navRole || "").split(" ").includes(currentUser.role);
    button.classList.toggle("hidden-field", !allowed);
  });

  const activityWriteActions = [elements.openActivityModal];
  const adminWriteActions = [elements.openTechnicianModal, elements.openClientModal, elements.openUserModal, elements.resetDemoButton];

  activityWriteActions.forEach((control) => {
    if (!control) return;
    control.classList.toggle("hidden-field", !canCreateActivity());
    control.disabled = !canCreateActivity();
  });

  adminWriteActions.forEach((control) => {
    if (!control) return;
    control.classList.toggle("hidden-field", !canCreateOrEdit());
    control.disabled = !canCreateOrEdit();
  });

  if (elements.exportCsvButton) {
    elements.exportCsvButton.classList.toggle("hidden-field", isTecnico());
  }

  const summaryGrid = document.querySelector(".summary-grid");
  if (summaryGrid) {
    summaryGrid.classList.toggle("hidden-field", isTecnico());
  }

  if (elements.calendarTechFilter) {
    const calendarControls = elements.calendarTechFilter.closest("label");
    if (calendarControls) {
      calendarControls.classList.toggle("hidden-field", isTecnico());
    }
    if (isTecnico()) {
      elements.calendarTechFilter.value = currentUser.name;
    }
  }
}

let eventsBound = false;

function bindEvents() {
  if (eventsBound) {
    return;
  }
  eventsBound = true;

  [
    elements.searchInput,
    elements.dateFilter,
    elements.techFilter,
    elements.statusFilter,
    elements.sortSelect,
  ].forEach((control) => control.addEventListener("input", render));

  elements.statusFilter.addEventListener("change", () => {
    activeStatusTab = elements.statusFilter.value;
    render();
  });

  elements.openActivityModal.addEventListener("click", () => openModal());
  elements.closeActivityModal.addEventListener("click", closeModal);
  elements.cancelActivityForm.addEventListener("click", closeModal);
  elements.activityForm.addEventListener("submit", handleSubmit);
  elements.openTechnicianModal.addEventListener("click", () => openTechnicianModal());
  elements.closeTechnicianModal.addEventListener("click", closeTechnicianModal);
  elements.cancelTechnicianForm.addEventListener("click", closeTechnicianModal);
  elements.technicianForm.addEventListener("submit", handleTechnicianSubmit);

  if (elements.openClientModal) {
    elements.openClientModal.addEventListener("click", () => openClientModal());
  }
  if (elements.closeClientModal) {
    elements.closeClientModal.addEventListener("click", closeClientModal);
  }
  if (elements.cancelClientForm) {
    elements.cancelClientForm.addEventListener("click", closeClientModal);
  }
  if (elements.clientForm) {
    elements.clientForm.addEventListener("submit", handleClientSubmit);
  }
  if (elements.openUserModal) {
    elements.openUserModal.addEventListener("click", () => openUserModal());
  }
  if (elements.closeUserModal) {
    elements.closeUserModal.addEventListener("click", closeUserModal);
  }
  if (elements.cancelUserForm) {
    elements.cancelUserForm.addEventListener("click", closeUserModal);
  }
  if (elements.userForm) {
    elements.userForm.addEventListener("submit", handleUserSubmit);
  }
  elements.closeStatusReasonModal.addEventListener("click", closeStatusReasonModal);
  elements.cancelStatusReason.addEventListener("click", closeStatusReasonModal);
  elements.statusReasonForm.addEventListener("submit", handleStatusReasonSubmit);
  elements.fields.status.addEventListener("change", () => updateStatusReasonOptions());
  elements.fields.serviceWindow.addEventListener("change", updateServiceWindowField);
  elements.fields.technician.addEventListener("input", updateActivityConflictWarning);
  elements.fields.scheduledAt.addEventListener("input", updateActivityConflictWarning);
  elements.fields.status.addEventListener("change", updateActivityConflictWarning);
  elements.resetDemoButton.addEventListener("click", resetDemo);
  if (elements.exportCsvButton) {
    elements.exportCsvButton.addEventListener("click", exportActivitiesToCSV);
  }
  elements.calendarTechFilter.addEventListener("input", render);
  elements.calendarDateFilter.addEventListener("input", render);
  elements.calendarTodayButton.addEventListener("click", () => {
    elements.calendarDateFilter.value = new Date().toISOString().slice(0, 10);
    render();
  });

  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.dataset.viewButton) {
        return;
      }
      const allowed = (button.dataset.navRole || "").split(" ").includes(currentUser?.role);
      if (!allowed) {
        return;
      }
      activeNav = button.dataset.viewButton;
      activeView = activeNav === "activities" ? "dashboard" : activeNav;
      render();
    });
  });

  elements.activityModal.addEventListener("click", (event) => {
    if (event.target === elements.activityModal) {
      closeModal();
    }
  });

  elements.technicianModal.addEventListener("click", (event) => {
    if (event.target === elements.technicianModal) {
      closeTechnicianModal();
    }
  });

  if (elements.clientModal) {
    elements.clientModal.addEventListener("click", (event) => {
      if (event.target === elements.clientModal) {
        closeClientModal();
      }
    });
  }

  if (elements.userModal) {
    elements.userModal.addEventListener("click", (event) => {
      if (event.target === elements.userModal) {
        closeUserModal();
      }
    });
  }

  elements.statusReasonModal.addEventListener("click", (event) => {
    if (event.target === elements.statusReasonModal) {
      closeStatusReasonModal();
    }
  });
}

function populateStatusOptions() {
  const options = statuses.map((status) => `<option value="${status.id}">${status.label}</option>`).join("");
  elements.fields.status.innerHTML = options;
  elements.statusFilter.insertAdjacentHTML("beforeend", options);
}

function render() {
  if (!currentUser) {
    return;
  }

  applyPermissions();
  syncTechnicianOptions();
  syncCalendarTechnicianOptions();
  syncCustomerOptions();
  renderActiveView();
  renderStatusTabs();
  renderMetrics();
  renderActivityList();
  renderDetail();
  renderCalendar();
  renderCalendarDetail();
  renderTechnicians();
  renderClients();
  if (canManageUsers()) {
    renderUsers();
  }
  if (canSeeReports()) {
    renderReports();
  }
}

function syncTechnicianOptions() {
  const current = elements.techFilter.value;
  const technicianNames = getTechnicianNames();
  elements.techFilter.innerHTML = '<option value="">Todos</option>';
  elements.technicianSuggestions.innerHTML = "";
  technicianNames.forEach((technician) => {
    const option = document.createElement("option");
    option.value = technician;
    option.textContent = technician;
    elements.techFilter.appendChild(option);

    const suggestion = document.createElement("option");
    suggestion.value = technician;
    elements.technicianSuggestions.appendChild(suggestion);
  });
  elements.techFilter.value = technicianNames.includes(current) ? current : "";
}

function syncCalendarTechnicianOptions() {
  const current = elements.calendarTechFilter.value;
  const technicianNames = getTechnicianNames();
  elements.calendarTechFilter.innerHTML = '<option value="">Todos</option>';
  technicianNames.forEach((technician) => {
    const option = document.createElement("option");
    option.value = technician;
    option.textContent = technician;
    elements.calendarTechFilter.appendChild(option);
  });
  elements.calendarTechFilter.value = technicianNames.includes(current) ? current : "";
}

function syncCustomerOptions() {
  if (!elements.customerSuggestions) {
    return;
  }

  const fromClients = clients.map((client) => client.name).filter(Boolean);
  const fromActivities = activities.map((activity) => activity.customer).filter(Boolean);
  const names = [...new Set(fromClients.concat(fromActivities).map((name) => String(name || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  elements.customerSuggestions.innerHTML = "";
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    elements.customerSuggestions.appendChild(option);
  });
}

function getTechnicianNames() {
  return [
    ...new Set(
      technicians
        .map((technician) => technician.name)
        .concat(activities.map((activity) => activity.technician))
        .filter(Boolean)
    ),
  ].sort();
}

function renderActiveView() {
  elements.dashboardView.classList.toggle("active", activeView === "dashboard");
  elements.calendarView.classList.toggle("active", activeView === "calendar");
  elements.techniciansView.classList.toggle("active", activeView === "technicians");
  if (elements.clientsView) {
    elements.clientsView.classList.toggle("active", activeView === "clients");
  }
  if (elements.usersView) {
    elements.usersView.classList.toggle("active", activeView === "users");
  }
  elements.reportsView.classList.toggle("active", activeView === "reports");
  elements.viewButtons.forEach((button) => {
    const allowed = (button.dataset.navRole || "").split(" ").includes(currentUser?.role);
    button.classList.toggle("active", allowed && button.dataset.viewButton === activeNav);
  });
}

function renderStatusTabs() {
  const allCount = filteredActivities({ ignoreStatus: true }).length;
  const tabItems = [{ id: "", label: "Todos", count: allCount }].concat(
    statuses.map((status) => ({
      ...status,
      count: filteredActivities({ forceStatus: status.id }).length,
    }))
  );

  elements.statusTabs.innerHTML = tabItems
    .map(
      (tab) => `
        <button class="status-tab ${activeStatusTab === tab.id ? "active" : ""}" data-status-tab="${tab.id}" type="button">
          ${tab.label} <span>${tab.count}</span>
        </button>
      `
    )
    .join("");

  elements.statusTabs.querySelectorAll("[data-status-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStatusTab = button.dataset.statusTab;
      elements.statusFilter.value = activeStatusTab;
      render();
    });
  });
}

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const todayActivities = activities.filter((activity) => activity.scheduledAt.slice(0, 10) === today);
  const conflicts = activities.filter((activity) => getScheduleConflicts(activity).length).length;

  elements.metricToday.textContent = todayActivities.length;
  elements.metricTodayHint.textContent =
    conflicts ? `${conflicts} com conflito de agenda` : todayActivities.length === 1 ? "1 atividade programada" : `${todayActivities.length} atividades programadas`;
  elements.metricRunning.textContent = activities.filter((activity) => activity.status === "em-execucao").length;
  elements.metricLate.textContent = activities.filter((activity) => activity.status === "atrasada").length;
  elements.metricUnproductive.textContent = activities.filter((activity) => activity.status === "improdutiva").length;
}

function renderActivityList() {
  const visibleActivities = filteredActivities();

  elements.resultCount.textContent =
    visibleActivities.length === 1 ? "1 registro" : `${visibleActivities.length} registros`;

  if (!visibleActivities.length) {
    elements.activityList.innerHTML = '<div class="empty-state">Nenhuma atividade encontrada.</div>';
    return;
  }

  elements.activityList.innerHTML = visibleActivities.map(activityCardTemplate).join("");
  elements.activityList.querySelectorAll("[data-activity-card]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedActivityId = button.dataset.activityCard;
      render();
    });
  });

  elements.activityList.querySelectorAll("[data-delete-activity]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteActivity(element.dataset.deleteActivity);
    });
  });
}

function renderDetail() {
  if (isTecnico()) {
    elements.detailPanel.innerHTML = `
      <div class="empty-detail">
        <span class="empty-icon">📅</span>
        <h2>Agenda do técnico</h2>
        <p>Selecione uma atividade no calendário para atualizar o status.</p>
      </div>
    `;
    return;
  }

  renderActivityDetail(elements.detailPanel, false);
}

function renderCalendarDetail() {
  if (!elements.calendarDetailPanel) {
    return;
  }

  if (!isTecnico()) {
    elements.calendarDetailPanel.classList.add("hidden-field");
    return;
  }

  elements.calendarDetailPanel.classList.remove("hidden-field");
  renderActivityDetail(elements.calendarDetailPanel, true);
}

function renderActivityDetail(container, isCalendarContext) {
  const selected = activities.find((activity) => activity.internalId === selectedActivityId);

  if (!selected) {
    container.innerHTML = `
      <div class="empty-detail">
        <span class="empty-icon">+</span>
        <h2>Selecione uma atividade</h2>
        <p>${isCalendarContext ? "Toque em um evento da agenda para ver os detalhes." : "Os detalhes, ações rápidas e histórico aparecem aqui."}</p>
      </div>
    `;
    return;
  }

  const showEdit = canEditActivity(selected);
  const showStatusActions = canChangeActivityStatus(selected);
  const quickActionsHtml = buildQuickActionsHtml(selected);

  container.innerHTML = `
    <div class="detail-heading">
      <div>
        <h2>${escapeHtml(selected.customer)}</h2>
        <span class="badge ${statusClass(selected.status)}">${statusLabel(selected.status)}</span>
      </div>
      ${showEdit ? '<button class="ghost-button" id="editSelected" type="button">Editar</button>' : ""}
    </div>

    <div class="detail-grid">
      ${detailItem("ID", selected.activityId)}
      ${detailItem("Chamado", selected.ticketNumber)}
      ${detailItem("Contato", contactLabel(selected))}
      ${detailItem("Técnico", selected.technician)}
      ${detailItem("Prioridade", capitalize(selected.priority))}
      ${detailItem("Agendamento", formatDateTime(selected.scheduledAt))}
      ${detailItem("Janela", selected.serviceWindow || "Não informada")}
      ${detailItem("Serviço", selected.serviceType)}
      ${selected.criadoPor ? detailItem("Criado por", selected.criadoPor) : ""}
      ${selected.statusReason ? detailItem("Motivo", selected.statusReason) : ""}
    </div>

    <div class="detail-section">
      <div class="detail-item">
        <span>Endereço/local</span>
        <strong>${escapeHtml(locationLabel(selected))}</strong>
      </div>
    </div>

    ${!isTecnico() ? conflictDetailTemplate(selected) : ""}

    <div class="detail-section">
      <span class="detail-muted">Descrição</span>
      <p>${escapeHtml(selected.description || "Sem descrição.")}</p>
      ${!isTecnico() ? `<span class="detail-muted">Observações internas</span><p>${escapeHtml(selected.notes || "Sem observações.")}</p>` : ""}
    </div>

    ${
      showStatusActions && quickActionsHtml
        ? `<div class="detail-section">
            <span class="detail-muted">Ações rápidas</span>
            <div class="quick-actions">${quickActionsHtml}</div>
          </div>`
        : ""
    }

    ${
      !isTecnico()
        ? `<div class="detail-section">
            <span class="detail-muted">Resumo</span>
            <div class="quick-actions">
              <button id="copySummaryButton" type="button">Copiar resumo</button>
              <span class="copy-feedback" id="copyFeedback">Resumo copiado</span>
            </div>
          </div>
          <div class="detail-section">
            <span class="detail-muted">Histórico</span>
            ${historyTemplate(selected)}
          </div>`
        : ""
    }
  `;

  const editButton = container.querySelector("#editSelected");
  if (editButton) {
    editButton.addEventListener("click", () => openModal(selected));
  }

  const copyButton = container.querySelector("#copySummaryButton");
  if (copyButton) {
    copyButton.addEventListener("click", () => copySummary(selected));
  }

  container.querySelectorAll("[data-quick-status]").forEach((button) => {
    button.addEventListener("click", () => handleQuickStatus(selected.internalId, button.dataset.quickStatus));
  });
}

function buildQuickActionsHtml(activity) {
  if (isTecnico()) {
    return TECNICO_ALLOWED_STATUSES.map((status) => quickAction(status, statusLabel(status))).join("");
  }

  if (!canEditActivity(activity)) {
    return "";
  }

  return [
    quickAction("em-deslocamento", "Deslocamento"),
    quickAction("em-execucao", "Executar"),
    quickAction("concluida", "Concluir"),
    quickAction("improdutiva", "Improdutiva"),
    quickAction("atrasada", "Atrasada"),
  ].join("");
}

function conflictDetailTemplate(activity) {
  const conflicts = getScheduleConflicts(activity);
  if (!conflicts.length) {
    return "";
  }

  return `
    <div class="detail-section">
      <span class="detail-muted">Conflito de agenda</span>
      ${conflicts
        .map(
          (item) =>
            `<p><strong>${formatTime(item.scheduledAt)}</strong> ${escapeHtml(item.activityId)} - ${escapeHtml(item.customer)}</p>`
        )
        .join("")}
    </div>
  `;
}

function renderCalendar() {
  const weekDays = getWeekDays(elements.calendarDateFilter.value);
  let technician = elements.calendarTechFilter.value;
  if (isTecnico()) {
    technician = currentUser.name;
    elements.calendarTechFilter.value = currentUser.name;
  }
  const weekStart = startOfDay(weekDays[0]);
  const weekEnd = endOfDay(weekDays[6]);
  const weekActivities = activities
    .filter((activity) => {
      const scheduled = new Date(activity.scheduledAt);
      const matchesWeek = scheduled >= weekStart && scheduled <= weekEnd;
      const matchesTechnician = !technician || normalize(activity.technician) === normalize(technician);
      const matchesRole = !isTecnico() || normalize(activity.technician) === normalize(currentUser.name);
      return matchesWeek && matchesTechnician && matchesRole;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  renderCalendarSummary(weekActivities);

  elements.calendarGrid.innerHTML = weekDays
    .map((day) => {
      const dateKey = toDateInputValue(day);
      const dayActivities = weekActivities.filter((activity) => activity.scheduledAt.slice(0, 10) === dateKey);
      return `
        <article class="calendar-day ${dateKey === toDateInputValue(new Date()) ? "today" : ""}">
          <div class="calendar-day-header">
            <strong>${weekdayLabel(day)}</strong>
            <span>${day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
          </div>
          <div class="calendar-events">
            ${
              dayActivities.length
                ? dayActivities.map(calendarEventTemplate).join("")
                : '<div class="calendar-empty">Sem atividades</div>'
            }
          </div>
        </article>
      `;
    })
    .join("");

  elements.calendarGrid.querySelectorAll("[data-calendar-activity]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedActivityId = button.dataset.calendarActivity;
      if (!isTecnico()) {
        activeView = "dashboard";
      }
      render();
    });
  });

  elements.calendarGrid.querySelectorAll("[data-delete-activity]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteActivity(element.dataset.deleteActivity);
    });
  });
}

function renderCalendarSummary(weekActivities) {
  const technicians = new Set(weekActivities.map((activity) => activity.technician).filter(Boolean));
  const running = weekActivities.filter((activity) => activity.status === "em-execucao").length;
  const unproductive = weekActivities.filter((activity) => activity.status === "improdutiva").length;
  const late = weekActivities.filter((activity) => activity.status === "atrasada").length;

  elements.calendarSummary.innerHTML = `
    ${calendarSummaryCard("Atividades na semana", weekActivities.length)}
    ${calendarSummaryCard("Técnicos envolvidos", technicians.size)}
    ${calendarSummaryCard("Em execução", running)}
    ${calendarSummaryCard("Atenção", late + unproductive)}
  `;
}

function calendarSummaryCard(label, value) {
  return `
    <article class="calendar-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function calendarEventTemplate(activity) {
  const hasConflict = getScheduleConflicts(activity).length > 0;
  return `
    <button class="calendar-event ${hasConflict ? "has-conflict" : ""}" data-calendar-activity="${activity.internalId}" data-status="${activity.status}" type="button">
      <span class="calendar-event-time">${formatTime(activity.scheduledAt)}</span>
      <span class="calendar-event-title">${escapeHtml(activity.activityId)}</span>
      <span class="calendar-event-meta">${escapeHtml(activity.ticketNumber)} - ${escapeHtml(activity.customer)}</span>
      <span class="calendar-event-meta">${escapeHtml(activity.technician)}${activity.serviceWindow ? ` - ${escapeHtml(activity.serviceWindow)}` : ""}</span>
      <span class="calendar-event-meta">${escapeHtml(shortLocationLabel(activity))}</span>
      ${hasConflict ? '<span class="badge priority-alta">Conflito</span>' : ""}
      <span class="badge ${statusClass(activity.status)}">${statusLabel(activity.status)}</span>
      ${
        canDeleteActivity(activity)
          ? `<div class="calendar-event-actions">
              <span class="delete-link-button card-delete-btn" data-delete-activity="${activity.internalId}" role="button" tabindex="0" aria-label="Excluir atividade">
                ${trashIcon()}
                <span class="delete-link-text">Excluir</span>
              </span>
            </div>`
          : ""
      }
    </button>
  `;
}

function renderReports() {
  const reportActivities = filteredActivities({ ignoreStatus: true });

  const completedActivities = reportActivities.filter((activity) => activity.status === "concluida").length;
  const lateActivities = reportActivities.filter((activity) => activity.status === "atrasada").length;
  const unproductiveActivities = reportActivities.filter((activity) => activity.status === "improdutiva").length;

  const totalActivities = reportActivities.length || 0;
  const pct = (value) => (totalActivities ? Math.round((value / totalActivities) * 100) : 0);

  elements.reportsSummary.innerHTML = `
    ${reportSummaryCard("Concluídas", completedActivities, "status-concluida", pct(completedActivities))}
    ${reportSummaryCard("Atrasadas", lateActivities, "status-atrasada", pct(lateActivities))}
    ${reportSummaryCard("Improdutivas", unproductiveActivities, "status-improdutiva", pct(unproductiveActivities))}
  `;

  renderUnproductiveReasons(reportActivities);
  renderTechnicianProductivity(reportActivities);
}

function reportSummaryCard(label, value, statusClass = "", percent = null) {
  return `
    <article class="metric reports-card">
      <span class="metric-label">${label}</span>
      <strong class="${statusClass}">${value}</strong>
      <small>${percent === null ? "Atividades" : `${percent}% do total`}</small>
    </article>
  `;
}

function renderUnproductiveReasons(sourceActivities = activities) {
  const reasonCounts = sourceActivities
    .filter((activity) => activity.status === "improdutiva" && activity.statusReason)
    .reduce((acc, activity) => {
      const reason = activity.statusReason.split(" - ")[0];
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

  const sortedReasons = Object.entries(reasonCounts).sort(([, countA], [, countB]) => countB - countA);

  if (!sortedReasons.length) {
    elements.unproductiveReasons.innerHTML = 
      "<div class=\"empty-state\">Nenhum motivo de improdutividade registrado.</div>";
    return;
  }

  const maxCount = Math.max(...sortedReasons.map(([, count]) => count)) || 0;
  const totalReasons = sortedReasons.reduce((sum, [, count]) => sum + count, 0) || 0;

  elements.unproductiveReasons.innerHTML = sortedReasons
    .map(([reason, count]) => {
      const widthPct = maxCount ? Math.round((count / maxCount) * 100) : 0;
      const sharePct = totalReasons ? Math.round((count / totalReasons) * 100) : 0;
      return `
        <div class="reason-item">
          <span>${escapeHtml(reason)}</span>
          <div class="reports-bar" aria-hidden="true" title="${sharePct}% dos motivos">
            <span class="reports-bar-fill" style="width:${widthPct}%; background: var(--accent)"></span>
          </div>
          <span>${count}</span>
        </div>
      `;
    })
    .join("");
}

function renderTechnicianProductivity(sourceActivities = activities) {
  const techProductivity = sourceActivities.reduce((acc, activity) => {
    if (activity.technician && activity.status === "concluida") {
      acc[activity.technician] = (acc[activity.technician] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedTechs = Object.entries(techProductivity)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5); // Top 5 technicians

  if (!sortedTechs.length) {
    elements.techRanking.innerHTML = 
      "<div class=\"empty-state\">Nenhum técnico com atividades concluídas.</div>";
    return;
  }

  const maxCount = sortedTechs[0]?.[1] || 0;

  elements.techRanking.innerHTML = sortedTechs
    .map(([technicianName, count]) => {
      const widthPct = maxCount ? Math.round((count / maxCount) * 100) : 0;
      return `
        <div class="tech-rank-item">
          <span>${escapeHtml(technicianName)}</span>
          <div class="reports-bar" aria-hidden="true">
            <span class="reports-bar-fill" style="width:${widthPct}%; background: var(--primary)"></span>
          </div>
          <span>${count}</span>
        </div>
      `;
    })
    .join("");
}

function renderTechnicians() {
  renderTechnicianSummary();

  if (!technicians.length) {
    elements.technicianGrid.innerHTML = '<div class="empty-state">Nenhum técnico cadastrado.</div>';
    return;
  }

  elements.technicianGrid.innerHTML = technicians
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map(technicianCardTemplate)
    .join("");

  elements.technicianGrid.querySelectorAll("[data-edit-technician]").forEach((button) => {
    button.addEventListener("click", () => {
      const technician = technicians.find((item) => item.internalId === button.dataset.editTechnician);
      openTechnicianModal(technician);
    });
  });

  elements.technicianGrid.querySelectorAll("[data-delete-technician]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTechnician(button.dataset.deleteTechnician);
    });
  });
}

function renderClients() {
  if (!elements.clientGrid || !elements.clientSummary) {
    return;
  }

  renderClientSummary();

  if (!clients.length) {
    elements.clientGrid.innerHTML = '<div class="empty-state">Nenhum cliente cadastrado.</div>';
    return;
  }

  elements.clientGrid.innerHTML = clients
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map(clientCardTemplate)
    .join("");

  elements.clientGrid.querySelectorAll("[data-edit-client]").forEach((button) => {
    button.addEventListener("click", () => {
      const client = clients.find((item) => item.internalId === button.dataset.editClient);
      openClientModal(client);
    });
  });

  elements.clientGrid.querySelectorAll("[data-delete-client]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteClient(button.dataset.deleteClient);
    });
  });
}

function renderClientSummary() {
  const namesInActivities = new Set(activities.map((activity) => (activity.customer || "").trim()).filter(Boolean));
  const registered = clients.length;
  const linked = clients.filter((client) => namesInActivities.has(client.name)).length;
  const onlyInActivities = Array.from(namesInActivities).filter(
    (name) => !clients.some((client) => normalize(client.name) === normalize(name))
  ).length;

  elements.clientSummary.innerHTML = `
    ${clientSummaryCard("Clientes cadastrados", registered)}
    ${clientSummaryCard("Com atividades vinculadas", linked)}
    ${clientSummaryCard("Aparecem só nas atividades", onlyInActivities)}
    ${clientSummaryCard("Total de nomes diferentes", namesInActivities.size)}
  `;
}

function clientSummaryCard(label, value) {
  return `
    <article class="client-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function clientCardTemplate(client) {
  const linkedCount = activities.filter((activity) => normalize(activity.customer) === normalize(client.name)).length;
  return `
    <article class="client-card">
      <div class="client-card-header">
        <div>
          <h3>${escapeHtml(client.name)}</h3>
          <small class="client-muted">${linkedCount ? `${linkedCount} atividade(s)` : "Sem atividades"}</small>
        </div>
        <div class="client-card-actions">
          ${canCreateOrEdit() ? `<button class="ghost-button" data-edit-client="${client.internalId}" type="button">Editar</button>` : ""}
          ${
            canDelete()
              ? `<button class="delete-link-button" data-delete-client="${client.internalId}" type="button" aria-label="Excluir cliente">
                  ${trashIcon()}
                  <span class="delete-link-text">Excluir</span>
                </button>`
              : ""
          }
        </div>
      </div>
      <div class="client-meta">
        <span>${escapeHtml(client.contact || "Contato não informado")}</span>
        <span>${escapeHtml(client.phone || "Telefone não informado")}</span>
      </div>
      ${client.notes ? `<div class="client-notes">${escapeHtml(client.notes)}</div>` : ""}
    </article>
  `;
}

function openClientModal(client = null) {
  if (!canCreateOrEdit()) {
    return;
  }

  elements.clientForm.reset();
  elements.clientModalTitle.textContent = client ? "Editar cliente" : "Novo cliente";

  if (client) {
    Object.entries(elements.clientFields).forEach(([key, field]) => {
      field.value = client[key] || "";
    });
  } else {
    elements.clientFields.internalId.value = "";
  }

  if (typeof elements.clientModal.showModal === "function") {
    elements.clientModal.showModal();
  } else {
    elements.clientModal.classList.add("fallback-open");
    document.body.classList.add("modal-fallback-active");
  }

  elements.clientFields.name.focus();
}

function closeClientModal() {
  if (typeof elements.clientModal.close === "function" && elements.clientModal.open) {
    elements.clientModal.close();
  }
  elements.clientModal.classList.remove("fallback-open");
  document.body.classList.remove("modal-fallback-active");
}

function readClientFormData() {
  return {
    internalId: elements.clientFields.internalId.value,
    name: elements.clientFields.name.value.trim(),
    contact: elements.clientFields.contact.value.trim(),
    phone: elements.clientFields.phone.value.trim(),
    notes: elements.clientFields.notes.value.trim(),
  };
}

function hasDuplicateClient(formData, existingIndex) {
  return clients.some((client, index) => {
    if (index === existingIndex) {
      return false;
    }
    return normalize(client.name) === normalize(formData.name);
  });
}

function handleClientSubmit(event) {
  event.preventDefault();
  if (!canCreateOrEdit()) {
    return;
  }

  const formData = readClientFormData();
  const existingIndex = clients.findIndex((client) => client.internalId === formData.internalId);

  if (!formData.name) {
    alert("Informe o nome do cliente.");
    return;
  }

  if (hasDuplicateClient(formData, existingIndex)) {
    alert("Já existe um cliente com esse nome.");
    return;
  }

  if (existingIndex >= 0) {
    const previousName = clients[existingIndex].name;
    clients[existingIndex] = { ...clients[existingIndex], ...formData, updatedAt: new Date().toISOString() };

    if (previousName !== formData.name) {
      const linked = activities.filter((activity) => normalize(activity.customer) === normalize(previousName)).length;
      if (linked && confirm("Atualizar o nome desse cliente nas atividades existentes?")) {
        activities = activities.map((activity) =>
          normalize(activity.customer) === normalize(previousName) ? { ...activity, customer: formData.name } : activity
        );
        saveActivities();
      }
    }
  } else {
    clients.push({
      ...formData,
      internalId: createInternalId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveClients();
  closeClientModal();
  render();
}

async function deleteClient(internalId) {
  if (!canDelete()) {
    return;
  }

  const client = clients.find((item) => item.internalId === internalId);
  const label = client ? client.name : "este cliente";
  const linkedCount = client ? activities.filter((activity) => normalize(activity.customer) === normalize(client.name)).length : 0;

  const message = linkedCount
    ? `Tem certeza que deseja excluir "${label}"?\n\nObs.: existem ${linkedCount} atividade(s) com esse nome. As atividades não serão apagadas.`
    : `Tem certeza que deseja excluir "${label}"?`;

  if (!confirm(message)) {
    return;
  }

  clients = clients.filter((item) => item.internalId !== internalId);
  if (SUPABASE_ENABLED) {
    const { error } = await supabaseClient.from("clients").delete().eq("id", internalId);
    if (error) {
      alert(`Erro ao excluir cliente: ${error.message}`);
    }
  }
  saveClients();
  render();
}

function renderUsers() {
  if (!elements.usersTableBody || !canManageUsers()) {
    return;
  }

  if (!users.length) {
    elements.usersTableBody.innerHTML =
      '<tr><td colspan="4"><div class="empty-state">Nenhum usuário cadastrado.</div></td></tr>';
    return;
  }

  elements.usersTableBody.innerHTML = users
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((user) => {
      const isFactoryAdmin = normalize(user.username) === "admin";
      return `
        <tr>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.username)}</td>
          <td><span class="badge role-${user.role}">${USER_ROLES[user.role] || user.role}</span></td>
          <td class="users-table-actions">
            <button class="ghost-button" data-edit-user="${user.internalId}" type="button">Editar</button>
            ${
              isFactoryAdmin
                ? ""
                : `<button class="delete-link-button" data-delete-user="${user.internalId}" type="button" aria-label="Excluir usuário">
                    ${trashIcon()}
                    <span class="delete-link-text">Excluir</span>
                  </button>`
            }
          </td>
        </tr>
      `;
    })
    .join("");

  elements.usersTableBody.querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const user = users.find((item) => item.internalId === button.dataset.editUser);
      openUserModal(user);
    });
  });

  elements.usersTableBody.querySelectorAll("[data-delete-user]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteUser(button.dataset.deleteUser);
    });
  });
}

function openUserModal(user = null) {
  if (!canManageUsers()) {
    return;
  }

  elements.userForm.reset();
  elements.userModalTitle.textContent = user ? "Editar usuário" : "Novo usuário";
  elements.userFields.password.required = !user;
  elements.userFields.password.placeholder = user ? "Deixe em branco para manter" : "Senha de acesso";

  if (user) {
    Object.entries(elements.userFields).forEach(([key, field]) => {
      if (key === "password") {
        field.value = "";
        return;
      }
      field.value = user[key] || "";
    });
  } else {
    elements.userFields.internalId.value = "";
    elements.userFields.role.value = "visualizador";
  }

  if (typeof elements.userModal.showModal === "function") {
    elements.userModal.showModal();
  } else {
    elements.userModal.classList.add("fallback-open");
    document.body.classList.add("modal-fallback-active");
  }

  elements.userFields.name.focus();
}

function closeUserModal() {
  if (typeof elements.userModal.close === "function" && elements.userModal.open) {
    elements.userModal.close();
  }
  elements.userModal.classList.remove("fallback-open");
  document.body.classList.remove("modal-fallback-active");
}

function readUserFormData() {
  return {
    internalId: elements.userFields.internalId.value,
    name: elements.userFields.name.value.trim(),
    username: elements.userFields.username.value.trim(),
    password: elements.userFields.password.value,
    role: elements.userFields.role.value,
  };
}

function hasDuplicateUsername(formData, existingIndex) {
  return users.some((user, index) => {
    if (index === existingIndex) {
      return false;
    }
    return normalize(user.username) === normalize(formData.username);
  });
}

function handleUserSubmit(event) {
  event.preventDefault();
  if (!canManageUsers()) {
    return;
  }
  if (SUPABASE_ENABLED) {
    alert("No modo online, crie o usuário em Authentication > Users no Supabase e depois cadastre o perfil na tabela profiles.");
    return;
  }

  const formData = readUserFormData();
  const existingIndex = users.findIndex((user) => user.internalId === formData.internalId);

  if (!formData.name || !formData.username) {
    alert("Preencha nome e usuário.");
    return;
  }

  if (!formData.password && existingIndex < 0) {
    alert("Informe uma senha para o novo usuário.");
    return;
  }

  if (hasDuplicateUsername(formData, existingIndex)) {
    alert("Já existe um usuário com esse login.");
    return;
  }

  if (existingIndex >= 0) {
    const previous = users[existingIndex];
    users[existingIndex] = {
      ...previous,
      name: formData.name,
      username: formData.username,
      role: formData.role,
      password: formData.password || previous.password,
    };

    if (currentUser?.internalId === previous.internalId) {
      currentUser = users[existingIndex];
      updateSidebarUser();
    }
  } else {
    users.push({
      internalId: createInternalId(),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      createdAt: new Date().toISOString(),
    });
  }

  saveUsers();
  closeUserModal();
  render();
}

function deleteUser(internalId) {
  if (!canManageUsers()) {
    return;
  }

  const user = users.find((item) => item.internalId === internalId);
  if (!user) {
    return;
  }

  if (normalize(user.username) === "admin") {
    alert("O usuário administrador padrão não pode ser excluído.");
    return;
  }

  if (currentUser?.internalId === internalId) {
    alert("Você não pode excluir o usuário com o qual está logado.");
    return;
  }

  if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
    return;
  }

  users = users.filter((item) => item.internalId !== internalId);
  saveUsers();
  render();
}

function renderTechnicianSummary() {
  const working = technicians.filter((technician) =>
    ["disponivel", "em-rota", "em-atendimento"].includes(technician.status)
  ).length;
  const onService = technicians.filter((technician) => technician.status === "em-atendimento").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayActivities = activities.filter((activity) => activity.scheduledAt.slice(0, 10) === today).length;

  elements.technicianSummary.innerHTML = `
    ${technicianSummaryCard("Técnicos cadastrados", technicians.length)}
    ${technicianSummaryCard("Disponíveis/ativos", working)}
    ${technicianSummaryCard("Em atendimento", onService)}
    ${technicianSummaryCard("Atividades hoje", todayActivities)}
  `;
}

function technicianSummaryCard(label, value) {
  return `
    <article class="technician-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function technicianCardTemplate(technician) {
  const stats = technicianStats(technician.name);
  return `
    <article class="technician-card">
      <div class="technician-card-header">
        <div>
          <h3>${escapeHtml(technician.name)}</h3>
          <span class="badge ${technicianStatusClass(technician.status)}">${technicianStatusLabel(technician.status)}</span>
        </div>
        <div class="technician-card-actions">
          ${canCreateOrEdit() ? `<button class="ghost-button" data-edit-technician="${technician.internalId}" type="button">Editar</button>` : ""}
          ${
            canDelete()
              ? `<button class="delete-link-button" data-delete-technician="${technician.internalId}" type="button" aria-label="Excluir técnico">
                  ${trashIcon()}
                  <span class="delete-link-text">Excluir</span>
                </button>`
              : ""
          }
        </div>
      </div>
      <div class="technician-meta">
        <span>${escapeHtml(technician.phone || "Telefone não informado")}</span>
        <span>${escapeHtml(technician.region || "Região não informada")}</span>
        <span>${escapeHtml(technician.team || "Equipe não informada")}</span>
      </div>
      <div class="technician-stats">
        ${technicianStat("Hoje", stats.today)}
        ${technicianStat("Ativas", stats.active)}
        ${technicianStat("Concluídas", stats.done)}
      </div>
    </article>
  `;
}

function technicianStat(label, value) {
  return `
    <div class="technician-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function technicianStats(name) {
  const today = new Date().toISOString().slice(0, 10);
  const technicianActivities = activities.filter((activity) => activity.technician === name);
  return {
    today: technicianActivities.filter((activity) => activity.scheduledAt.slice(0, 10) === today).length,
    active: technicianActivities.filter((activity) =>
      ["agendada", "em-deslocamento", "em-execucao", "atrasada", "reagendada"].includes(activity.status)
    ).length,
    done: technicianActivities.filter((activity) => activity.status === "concluida").length,
  };
}

function activityCardTemplate(activity) {
  const hasConflict = getScheduleConflicts(activity).length > 0;
  return `
    <button class="activity-card ${selectedActivityId === activity.internalId ? "selected" : ""} ${hasConflict ? "has-conflict" : ""}"
      data-activity-card="${activity.internalId}"
      data-status="${activity.status}"
      type="button">
      <div>
        <div class="activity-title">
          <strong>${escapeHtml(activity.activityId)}</strong>
          <span class="badge ${statusClass(activity.status)}">${statusLabel(activity.status)}</span>
          <span class="badge ${priorityClass(activity.priority)}">${capitalize(activity.priority)}</span>
          ${hasConflict ? '<span class="badge priority-alta">Conflito</span>' : ""}
        </div>
        <div class="activity-meta">
          <span>${escapeHtml(activity.ticketNumber)}</span>
          <span>${escapeHtml(activity.customer)}</span>
          <span>${escapeHtml(activity.technician)}</span>
          <span>${escapeHtml(locationLabel(activity))}</span>
          ${activity.serviceWindow ? `<span>${escapeHtml(activity.serviceWindow)}</span>` : ""}
        </div>
        ${
          canDeleteActivity(activity)
            ? `<div class="activity-card-actions">
                <span class="delete-link-button card-delete-btn" data-delete-activity="${activity.internalId}" role="button" tabindex="0" aria-label="Excluir atividade">
                  ${trashIcon()}
                  <span class="delete-link-text">Excluir</span>
                </span>
              </div>`
            : ""
        }
      </div>
      <span class="card-time">${formatTime(activity.scheduledAt)}</span>
    </button>
  `;
}

function detailItem(label, value) {
  return `
    <div class="detail-item">
      <span>${label}</span>
      <strong>${escapeHtml(value || "-")}</strong>
    </div>
  `;
}

function quickAction(status, label) {
  return `<button data-quick-status="${status}" type="button">${label}</button>`;
}

function historyTemplate(activity) {
  const history = activity.history?.length ? activity.history : [{ status: activity.status, at: activity.updatedAt }];
  return history
    .slice()
    .reverse()
    .map((item) => {
      const reason = item.reason ? ` - ${escapeHtml(item.reason)}` : "";
      return `<p><strong>${statusLabel(item.status)}</strong>${reason} <span class="detail-muted">${formatDateTime(item.at)}</span></p>`;
    })
    .join("");
}

function filteredActivities(options = {}) {
  const query = normalize(elements.searchInput.value);
  const date = elements.dateFilter.value;
  let technician = elements.techFilter.value;
  const status = options.forceStatus ?? (options.ignoreStatus ? "" : activeStatusTab || elements.statusFilter.value);

  if (isTecnico()) {
    technician = currentUser.name;
  }

  return activities
    .filter((activity) => {
      const searchable = normalize(
        `${activity.activityId} ${activity.ticketNumber} ${activity.customer} ${activity.customerContact} ${activity.customerPhone} ${activity.address} ${activity.city} ${activity.district} ${activity.technician} ${activity.serviceType} ${activity.serviceWindow}`
      );
      const matchesQuery = !query || searchable.includes(query);
      const matchesDate = !date || activity.scheduledAt.slice(0, 10) === date;
      const matchesTechnician = !technician || normalize(activity.technician) === normalize(technician);
      const matchesStatus = !status || activity.status === status;
      const matchesRole = !isTecnico() || normalize(activity.technician) === normalize(currentUser.name);
      return matchesQuery && matchesDate && matchesTechnician && matchesStatus && matchesRole;
    })
    .sort(sortActivities);
}

function sortActivities(a, b) {
  switch (elements.sortSelect.value) {
    case "priority-desc":
      return priorityWeight[b.priority] - priorityWeight[a.priority] || new Date(a.scheduledAt) - new Date(b.scheduledAt);
    case "updated-desc":
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    default:
      return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  }
}

function openModal(activity = null) {
  if (activity ? !canEditActivity(activity) : !canCreateActivity()) {
    return;
  }

  elements.activityForm.reset();
  elements.modalTitle.textContent = activity ? "Editar atividade" : "Nova atividade";

  if (activity) {
    Object.entries(elements.fields).forEach(([key, field]) => {
      if (key === "scheduledAt") {
        field.value = toDateTimeLocal(activity[key]);
        return;
      }
      field.value = activity[key] || "";
    });
  } else {
    elements.fields.internalId.value = "";
    elements.fields.status.value = "agendada";
    elements.fields.priority.value = "normal";
    elements.fields.scheduledAt.value = toDateTimeLocal(new Date().toISOString());
    elements.fields.serviceWindow.value = "";
    elements.fields.customServiceWindow.value = "";
  }

  updateServiceWindowField();
  updateStatusReasonOptions(activity?.statusReason || "");
  updateActivityConflictWarning();
  if (typeof elements.activityModal.showModal === "function") {
    elements.activityModal.showModal();
  } else {
    elements.activityModal.classList.add("fallback-open");
    document.body.classList.add("modal-fallback-active");
  }
  elements.fields.activityId.focus();
}

function closeModal() {
  if (typeof elements.activityModal.close === "function" && elements.activityModal.open) {
    elements.activityModal.close();
  }
  elements.activityModal.classList.remove("fallback-open");
  document.body.classList.remove("modal-fallback-active");
}

function openTechnicianModal(technician = null) {
  if (!canCreateOrEdit()) {
    return;
  }

  elements.technicianForm.reset();
  elements.technicianModalTitle.textContent = technician ? "Editar técnico" : "Novo técnico";

  if (technician) {
    Object.entries(elements.technicianFields).forEach(([key, field]) => {
      field.value = technician[key] || "";
    });
  } else {
    elements.technicianFields.internalId.value = "";
    elements.technicianFields.status.value = "disponivel";
  }

  if (typeof elements.technicianModal.showModal === "function") {
    elements.technicianModal.showModal();
  } else {
    elements.technicianModal.classList.add("fallback-open");
    document.body.classList.add("modal-fallback-active");
  }
  elements.technicianFields.name.focus();
}

function closeTechnicianModal() {
  if (typeof elements.technicianModal.close === "function" && elements.technicianModal.open) {
    elements.technicianModal.close();
  }
  elements.technicianModal.classList.remove("fallback-open");
  document.body.classList.remove("modal-fallback-active");
}

function handleTechnicianSubmit(event) {
  event.preventDefault();
  if (!canCreateOrEdit()) {
    return;
  }

  const formData = readTechnicianFormData();
  const existingIndex = technicians.findIndex((technician) => technician.internalId === formData.internalId);

  if (hasDuplicateTechnician(formData, existingIndex)) {
    alert("Já existe um técnico com esse nome.");
    return;
  }

  if (existingIndex >= 0) {
    const previousName = technicians[existingIndex].name;
    technicians[existingIndex] = { ...technicians[existingIndex], ...formData };
    if (previousName !== formData.name && confirm("Atualizar o nome desse técnico nas atividades existentes?")) {
      activities = activities.map((activity) =>
        activity.technician === previousName ? { ...activity, technician: formData.name } : activity
      );
      saveActivities();
    }
  } else {
    technicians.push({ ...formData, internalId: createInternalId() });
  }

  saveTechnicians();
  closeTechnicianModal();
  render();
}

function readTechnicianFormData() {
  return {
    internalId: elements.technicianFields.internalId.value,
    name: elements.technicianFields.name.value.trim(),
    phone: elements.technicianFields.phone.value.trim(),
    region: elements.technicianFields.region.value.trim(),
    team: elements.technicianFields.team.value.trim(),
    status: elements.technicianFields.status.value,
  };
}

function hasDuplicateTechnician(formData, existingIndex) {
  return technicians.some((technician, index) => {
    if (index === existingIndex) {
      return false;
    }
    return normalize(technician.name) === normalize(formData.name);
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = readFormData();
  const existingIndex = activities.findIndex((activity) => activity.internalId === formData.internalId);
  const conflicts = getScheduleConflicts(formData);

  if (existingIndex >= 0) {
    const previous = activities[existingIndex];
    if (!canEditActivity(previous)) {
      alert("Você não tem permissão para editar esta atividade.");
      return;
    }
  } else if (!canCreateActivity()) {
    return;
  }

  if (hasDuplicateReference(formData, existingIndex)) {
    alert("Já existe uma atividade com esse ID ou número de chamado.");
    return;
  }

  if (conflicts.length && !confirm(`Este técnico tem ${conflicts.length} conflito(s) próximo(s). Deseja salvar mesmo assim?`)) {
    return;
  }

  if (existingIndex >= 0) {
    const previous = activities[existingIndex];
    activities[existingIndex] = {
      ...previous,
      ...formData,
      updatedAt: new Date().toISOString(),
      history:
        previous.status === formData.status
          ? previous.history
          : [...(previous.history || []), { status: formData.status, reason: formData.statusReason, at: new Date().toISOString() }],
    };
    selectedActivityId = formData.internalId;
  } else {
    const newActivity = {
      ...formData,
      internalId: createInternalId(),
      criadoPor: currentUser?.name || "Sistema",
      updatedAt: new Date().toISOString(),
      history: [{ status: formData.status, reason: formData.statusReason, at: new Date().toISOString() }],
    };
    activities.unshift(newActivity);
    selectedActivityId = newActivity.internalId;
  }

  saveActivities();
  closeModal();
  render();
}

function readFormData() {
  const serviceWindow =
    elements.fields.serviceWindow.value === "Personalizada"
      ? elements.fields.customServiceWindow.value.trim()
      : elements.fields.serviceWindow.value;

  return {
    internalId: elements.fields.internalId.value,
    activityId: elements.fields.activityId.value.trim(),
    ticketNumber: elements.fields.ticketNumber.value.trim(),
    customer: elements.fields.customer.value.trim(),
    customerContact: elements.fields.customerContact.value.trim(),
    customerPhone: elements.fields.customerPhone.value.trim(),
    address: elements.fields.address.value.trim(),
    city: elements.fields.city.value.trim(),
    district: elements.fields.district.value.trim(),
    serviceType: elements.fields.serviceType.value.trim(),
    technician: elements.fields.technician.value.trim(),
    scheduledAt: new Date(elements.fields.scheduledAt.value).toISOString(),
    serviceWindow,
    priority: elements.fields.priority.value,
    status: elements.fields.status.value,
    statusReason: elements.fields.statusReason.value,
    description: elements.fields.description.value.trim(),
    notes: elements.fields.notes.value.trim(),
  };
}

function hasDuplicateReference(formData, existingIndex) {
  return activities.some((activity, index) => {
    if (index === existingIndex) {
      return false;
    }
    return (
      normalize(activity.activityId) === normalize(formData.activityId) ||
      normalize(activity.ticketNumber) === normalize(formData.ticketNumber)
    );
  });
}

function updateActivityConflictWarning() {
  const draft = {
    internalId: elements.fields.internalId.value,
    technician: elements.fields.technician.value.trim(),
    scheduledAt: elements.fields.scheduledAt.value ? new Date(elements.fields.scheduledAt.value).toISOString() : "",
    status: elements.fields.status.value,
  };
  const conflicts = getScheduleConflicts(draft);

  elements.activityConflictWarning.classList.toggle("hidden-field", !conflicts.length);
  elements.activityConflictWarning.innerHTML = conflicts.length
    ? `Atenção: ${draft.technician} tem ${conflicts.length} atividade(s) em horário próximo: ${conflicts
        .map((activity) => `${formatTime(activity.scheduledAt)} ${escapeHtml(activity.activityId)}`)
        .join(", ")}.`
    : "";
}

function getScheduleConflicts(activity) {
  if (!activity.technician || !activity.scheduledAt || isInactiveForConflict(activity.status)) {
    return [];
  }

  const scheduledTime = new Date(activity.scheduledAt).getTime();
  if (Number.isNaN(scheduledTime)) {
    return [];
  }

  return activities.filter((candidate) => {
    if (candidate.internalId === activity.internalId) {
      return false;
    }
    if (candidate.technician !== activity.technician || isInactiveForConflict(candidate.status)) {
      return false;
    }
    const candidateTime = new Date(candidate.scheduledAt).getTime();
    const diffMinutes = Math.abs(candidateTime - scheduledTime) / 60000;
    return diffMinutes <= CONFLICT_WINDOW_MINUTES;
  });
}

function isInactiveForConflict(status) {
  return ["concluida", "cancelada", "improdutiva"].includes(status);
}

function handleQuickStatus(internalId, nextStatus) {
  const currentActivity = activities.find((activity) => activity.internalId === internalId);
  if (!currentActivity || currentActivity.status === nextStatus) {
    return;
  }

  if (!canChangeActivityStatus(currentActivity)) {
    alert("Você não tem permissão para alterar esta atividade.");
    return;
  }

  if (isTecnico() && !TECNICO_ALLOWED_STATUSES.includes(nextStatus)) {
    alert("Técnicos só podem alterar para: Em deslocamento, Em execução ou Concluída.");
    return;
  }

  if (statusReasons[nextStatus] && !isTecnico()) {
    openStatusReasonModal(internalId, nextStatus);
    return;
  }

  updateActivityStatus(internalId, nextStatus, "");
}

function updateActivityStatus(internalId, nextStatus, reason = "") {
  activities = activities.map((activity) => {
    if (activity.internalId !== internalId) {
      return activity;
    }

    return {
      ...activity,
      status: nextStatus,
      statusReason: reason,
      updatedAt: new Date().toISOString(),
      history: [...(activity.history || []), { status: nextStatus, reason, at: new Date().toISOString() }],
    };
  });
  saveActivities();
  render();
}

async function deleteActivity(internalId) {
  const activity = activities.find((item) => item.internalId === internalId);
  if (!canDeleteActivity(activity)) {
    return;
  }

  const label = activity ? `${activity.activityId} - ${activity.customer}` : "este item";

  if (confirm(`Tem certeza que deseja excluir "${label}"?`)) {
    activities = activities.filter((activity) => activity.internalId !== internalId);
    if (SUPABASE_ENABLED) {
      const { error } = await supabaseClient.from("activities").delete().eq("id", internalId);
      if (error) {
        alert(`Erro ao excluir atividade: ${error.message}`);
      }
    }
    if (selectedActivityId === internalId) {
      selectedActivityId = activities[0]?.internalId || null;
    }
    saveActivities();
    render();
  }
}

async function deleteTechnician(internalId) {
  if (!canDelete()) {
    return;
  }

  const technician = technicians.find((item) => item.internalId === internalId);
  const label = technician ? technician.name : "este técnico";

  if (confirm(`Tem certeza que deseja excluir "${label}"?`)) {
    technicians = technicians.filter((tech) => tech.internalId !== internalId);
    if (SUPABASE_ENABLED) {
      const { error } = await supabaseClient.from("technicians").delete().eq("id", internalId);
      if (error) {
        alert(`Erro ao excluir técnico: ${error.message}`);
      }
    }
    saveTechnicians();
    render();
  }
}

function openStatusReasonModal(internalId, nextStatus) {
  elements.statusReasonForm.reset();
  elements.quickStatusActivityId.value = internalId;
  elements.quickStatusValue.value = nextStatus;
  elements.statusReasonTitle.textContent = `Motivo para ${statusLabel(nextStatus)}`;
  elements.quickStatusReason.innerHTML = statusReasons[nextStatus]
    .map((reason) => `<option value="${escapeHtml(reason)}">${escapeHtml(reason)}</option>`)
    .join("");

  if (typeof elements.statusReasonModal.showModal === "function") {
    elements.statusReasonModal.showModal();
  } else {
    elements.statusReasonModal.classList.add("fallback-open");
    document.body.classList.add("modal-fallback-active");
  }
  elements.quickStatusReason.focus();
}

function closeStatusReasonModal() {
  if (typeof elements.statusReasonModal.close === "function" && elements.statusReasonModal.open) {
    elements.statusReasonModal.close();
  }
  elements.statusReasonModal.classList.remove("fallback-open");
  document.body.classList.remove("modal-fallback-active");
}

function handleStatusReasonSubmit(event) {
  event.preventDefault();
  const detail = elements.quickStatusNote.value.trim();
  const reason = detail
    ? `${elements.quickStatusReason.value} - ${detail}`
    : elements.quickStatusReason.value;

  updateActivityStatus(elements.quickStatusActivityId.value, elements.quickStatusValue.value, reason);
  closeStatusReasonModal();
}

function updateStatusReasonOptions(selectedReason = "") {
  const reasons = statusReasons[elements.fields.status.value] || [];
  elements.statusReasonField.classList.toggle("hidden-field", !reasons.length);
  elements.fields.statusReason.required = Boolean(reasons.length);
  elements.fields.statusReason.innerHTML = '<option value="">Selecione um motivo</option>';

  reasons.forEach((reason) => {
    const option = document.createElement("option");
    option.value = reason;
    option.textContent = reason;
    elements.fields.statusReason.appendChild(option);
  });

  elements.fields.statusReason.value = reasons.includes(selectedReason) ? selectedReason : "";
}

function updateServiceWindowField() {
  const isCustom = elements.fields.serviceWindow.value === "Personalizada";
  elements.customServiceWindowField.classList.toggle("hidden-field", !isCustom);
  elements.fields.customServiceWindow.required = isCustom;
  if (!isCustom) {
    elements.fields.customServiceWindow.value = "";
  }
}

async function copySummary(activity) {
  const summary = buildSummary(activity);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
    } else {
      copyWithFallback(summary);
    }
    showCopyFeedback("Resumo copiado");
  } catch {
    copyWithFallback(summary);
    showCopyFeedback("Resumo copiado");
  }
}

function buildSummary(activity) {
  const reason = activity.statusReason ? `\nMotivo: ${activity.statusReason}` : "";
  return [
    `ID: ${activity.activityId}`,
    `Chamado: ${activity.ticketNumber}`,
    `Cliente: ${activity.customer}`,
    `Contato: ${contactLabel(activity)}`,
    `Endereço: ${locationLabel(activity)}`,
    `Técnico: ${activity.technician}`,
    `Serviço: ${activity.serviceType}`,
    `Agendamento: ${formatDateTime(activity.scheduledAt)}`,
    `Janela: ${activity.serviceWindow || "Não informada"}`,
    `Status: ${statusLabel(activity.status)}${reason}`,
  ].join("\n");
}

function copyWithFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function showCopyFeedback(message) {
  const feedback = document.querySelector("#copyFeedback");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.classList.add("visible");
  setTimeout(() => feedback.classList.remove("visible"), 1800);
}

function exportActivitiesToCSV() {
  const visibleActivities = filteredActivities();

  if (!visibleActivities.length) {
    alert("Nenhuma atividade encontrada para exportar.");
    return;
  }

  // Cabeçalhos compatíveis com o Excel em Português
  const headers = [
    "ID",
    "Chamado",
    "Cliente",
    "Contato",
    "Telefone",
    "Técnico",
    "Data",
    "Horário",
    "Janela",
    "Prioridade",
    "Status",
    "Motivo do Status",
    "Tipo de Serviço",
    "Região/Bairro",
    "Cidade",
    "Endereço",
    "Descrição",
    "Observações"
  ];

  const rows = visibleActivities.map((activity) => {
    // Formatar data e hora
    const dateObj = new Date(activity.scheduledAt);
    const dateStr = dateObj.toLocaleDateString("pt-BR");
    const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return [
      activity.activityId || "",
      activity.ticketNumber || "",
      activity.customer || "",
      activity.customerContact || "",
      activity.customerPhone || "",
      activity.technician || "",
      dateStr,
      timeStr,
      activity.serviceWindow || "",
      capitalize(activity.priority || ""),
      statusLabel(activity.status) || "",
      activity.statusReason || "",
      activity.serviceType || "",
      activity.district || "",
      activity.city || "",
      activity.address || "",
      activity.description || "",
      activity.notes || ""
    ];
  });

  // Converter para CSV (utilizando ; como separador para compatibilidade direta com Excel em sistemas em Português)
  // Também adicionamos o BOM (Byte Order Mark) para garantir caracteres UTF-8 corretos no Excel.
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      row
        .map((val) => {
          // Escapar aspas duplas e envolver valores que contêm quebras de linha ou o próprio separador em aspas
          let str = String(val).replaceAll('"', '""');
          if (str.includes(";") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
            str = `"${str}"`;
          }
          return str;
        })
        .join(";")
    )
  ].join("\r\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  // Nome do arquivo com data/hora da exportação
  const now = new Date();
  const dateFormatted = now.toISOString().slice(0, 10);
  const timeFormatted = now.toTimeString().slice(0, 8).replaceAll(":", "-");
  link.setAttribute("href", url);
  link.setAttribute("download", `atividades_exportadas_${dateFormatted}_${timeFormatted}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetDemo() {
  if (!canCreateOrEdit()) {
    return;
  }

  if (!confirm("Restaurar os dados de demonstração? As atividades cadastradas localmente serão substituídas.")) {
    return;
  }
  activities = cloneSeedActivities();
  technicians = cloneSeedTechnicians();
  clients = cloneSeedClients();
  selectedActivityId = activities[0]?.internalId || null;
  activeStatusTab = "";
  saveActivities();
  saveTechnicians();
  saveClients();
  render();
}

async function fetchProfile(userId) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    internalId: data.id,
    name: data.full_name,
    username: data.full_name,
    role: data.role,
  };
}

async function loadRemoteData() {
  const [activitiesResult, techniciansResult, clientsResult, profilesResult] = await Promise.all([
    supabaseClient.from("activities").select("*, activity_history(*)").order("scheduled_at", { ascending: true }),
    supabaseClient.from("technicians").select("*").order("name", { ascending: true }),
    supabaseClient.from("clients").select("*").order("name", { ascending: true }),
    supabaseClient.from("profiles").select("id, full_name, role").order("full_name", { ascending: true }),
  ]);

  if (activitiesResult.error) throw activitiesResult.error;
  if (techniciansResult.error) throw techniciansResult.error;
  if (clientsResult.error) throw clientsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  activities = activitiesResult.data.map(fromRemoteActivity);
  technicians = techniciansResult.data.map(fromRemoteTechnician);
  clients = clientsResult.data.map(fromRemoteClient);
  users = profilesResult.data.map((profile) => ({
    internalId: profile.id,
    name: profile.full_name,
    username: profile.full_name,
    role: profile.role,
  }));
  selectedActivityId = activities[0]?.internalId || null;
}

function loadActivities() {
  const stored = readStorage();
  if (!stored) {
    return cloneSeedActivities();
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : cloneSeedActivities();
  } catch {
    return cloneSeedActivities();
  }
}

async function saveActivities() {
  if (SUPABASE_ENABLED) {
    await syncActivitiesToSupabase();
    return;
  }
  writeStorage(JSON.stringify(activities));
}

function loadTechnicians() {
  const stored = readTechnicianStorage();
  if (!stored) {
    return cloneSeedTechnicians();
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : cloneSeedTechnicians();
  } catch {
    return cloneSeedTechnicians();
  }
}

async function saveTechnicians() {
  if (SUPABASE_ENABLED) {
    await syncTechniciansToSupabase();
    return;
  }
  writeTechnicianStorage(JSON.stringify(technicians));
}

function loadClients() {
  const stored = readClientStorage();
  if (!stored) {
    return cloneSeedClients();
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : cloneSeedClients();
  } catch {
    return cloneSeedClients();
  }
}

async function saveClients() {
  if (SUPABASE_ENABLED) {
    await syncClientsToSupabase();
    return;
  }
  writeClientStorage(JSON.stringify(clients));
}

async function syncActivitiesToSupabase() {
  const activitiesToSync = activities.map(toRemoteActivity);
  const { error: activitiesError } = await supabaseClient.from("activities").upsert(activitiesToSync);
  if (activitiesError) {
    alert(`Erro ao salvar atividades no Supabase: ${activitiesError.message}`);
    return;
  }

  // Sincronizar o histórico de atividades
  for (const activity of activities) {
    const historyToSync = activity.history.map((h) => toRemoteActivityHistory(h, activity.internalId, activity.createdBy));
    if (historyToSync.length > 0) {
      const { error: historyError } = await supabaseClient.from("activity_history").upsert(historyToSync);
      if (historyError) {
        alert(`Erro ao salvar histórico da atividade ${activity.activityId} no Supabase: ${historyError.message}`);
      }
    }
  }
}

async function syncTechniciansToSupabase() {
  const { error } = await supabaseClient.from("technicians").upsert(technicians.map(toRemoteTechnician));
  if (error) {
    alert(`Erro ao salvar técnicos no Supabase: ${error.message}`);
  }
}

async function syncClientsToSupabase() {
  const { error } = await supabaseClient.from("clients").upsert(clients.map(toRemoteClient));
  if (error) {
    alert(`Erro ao salvar clientes no Supabase: ${error.message}`);
  }
}

function fromRemoteActivity(row) {
  return {
    internalId: row.id,
    activityId: row.activity_id,
    ticketNumber: row.ticket_number,
    customer: row.customer,
    customerContact: row.customer_contact || "",
    customerPhone: row.customer_phone || "",
    address: row.address,
    city: row.city || "",
    district: row.district || "",
    serviceType: row.service_type,
    technician: row.technician,
    assignedTo: row.assigned_to || "",
    scheduledAt: row.scheduled_at,
    serviceWindow: row.service_window || "",
    priority: row.priority,
    status: row.status,
    statusReason: row.status_reason || "",
    description: row.description || "",
    notes: row.notes || "",
    criadoPor: row.created_by_name || "",
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    history: row.activity_history.map((h) => ({ status: h.status, reason: h.reason, at: h.created_at })) || [],
  };
}

function toRemoteActivity(activity) {
  return {
    id: activity.internalId,
    activity_id: activity.activityId,
    ticket_number: activity.ticketNumber,
    customer: activity.customer,
    customer_contact: activity.customerContact || null,
    customer_phone: activity.customerPhone || null,
    address: activity.address,
    city: activity.city || null,
    district: activity.district || null,
    service_type: activity.serviceType,
    technician: activity.technician,
    assigned_to: activity.assignedTo || null,
    scheduled_at: activity.scheduledAt,
    service_window: activity.serviceWindow || null,
    priority: activity.priority,
    status: activity.status,
    status_reason: activity.statusReason || null,
    description: activity.description || null,
    notes: activity.notes || null,
    created_by: activity.createdBy || currentUser?.internalId,
    created_by_name: currentUser?.name || null,
  };
}

function fromRemoteTechnician(row) {
  return {
    internalId: row.id,
    name: row.name,
    phone: row.phone || "",
    region: row.region || "",
    team: row.team || "",
    status: row.status || "disponivel",
  };
}

function toRemoteTechnician(technician) {
  return {
    id: technician.internalId,
    name: technician.name,
    phone: technician.phone || null,
    region: technician.region || null,
    team: technician.team || null,
    status: technician.status,
  };
}

function fromRemoteClient(row) {
  return {
    internalId: row.id,
    name: row.name,
    contact: row.contact || "",
    phone: row.phone || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRemoteActivityHistory(historyEntry, activityId, createdBy) {
  return {
    activity_id: activityId,
    status: historyEntry.status,
    reason: historyEntry.reason || null,
    created_by: createdBy,
    created_at: historyEntry.at,
  };
}

function toRemoteClient(client) {
  return {
    id: client.internalId,
    name: client.name,
    contact: client.contact || null,
    phone: client.phone || null,
    notes: client.notes || null,
  };
}

function cloneSeedActivities() {
  return seedActivities.map((activity) => ({
    ...activity,
    internalId: createInternalId(),
    scheduledAt: activity.scheduledAt,
    criadoPor: activity.criadoPor || "Administrador",
    history: [...activity.history],
  }));
}

function cloneSeedTechnicians() {
  return seedTechnicians.map((technician) => ({
    ...technician,
    internalId: createInternalId(),
  }));
}

function cloneSeedClients() {
  return seedClients.map((client) => ({
    ...client,
    internalId: createInternalId(),
  }));
}

function statusLabel(statusId) {
  return statuses.find((status) => status.id === statusId)?.label || statusId;
}

function technicianStatusLabel(statusId) {
  return technicianStatuses[statusId] || statusId;
}

function statusClass(statusId) {
  return `status-${statusId}`;
}

function technicianStatusClass(statusId) {
  return `status-${statusId}`;
}

function priorityClass(priority) {
  return `priority-${priority}`;
}

function contactLabel(activity) {
  const parts = [activity.customerContact, activity.customerPhone].filter(Boolean);
  return parts.length ? parts.join(" - ") : "Não informado";
}

function locationLabel(activity) {
  return [activity.address, activity.district, activity.city].filter(Boolean).join(" - ") || "Não informado";
}

function shortLocationLabel(activity) {
  return [activity.district, activity.city].filter(Boolean).join(" - ") || activity.address || "Local não informado";
}

function todayAt(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function getWeekDays(dateValue) {
  const base = dateValue ? parseDateInput(dateValue) : new Date();
  const start = startOfDay(base);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function toDateInputValue(date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
}

function weekdayLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "");
}

function formatTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeLocal(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function capitalize(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function trashIcon() {
  // SVG simples de lixeira (herda a cor via `currentColor`).
  return `
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M8 6V4h8v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M6 6l1 16h10l1-16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `.trim();
}

function createInternalId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    alert("O navegador bloqueou o salvamento local. As alterações ficarão apenas nesta sessão.");
  }
}

function readTechnicianStorage() {
  try {
    return localStorage.getItem(TECHNICIANS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeTechnicianStorage(value) {
  try {
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, value);
  } catch {
    alert("O navegador bloqueou o salvamento local. As alterações ficarão apenas nesta sessão.");
  }
}

function readClientStorage() {
  try {
    return localStorage.getItem(CLIENTS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeClientStorage(value) {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, value);
  } catch {
    alert("O navegador bloqueou o salvamento local. As alterações ficarão apenas nesta sessão.");
  }
}

function loadUsers() {
  const stored = readUserStorage();
  if (!stored) {
    return cloneSeedUsers();
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.length) {
      return cloneSeedUsers();
    }
    return parsed;
  } catch {
    return cloneSeedUsers();
  }
}

function saveUsers() {
  writeUserStorage(JSON.stringify(users));
}

function cloneSeedUsers() {
  return seedUsers.map((user) => ({ ...user, internalId: createInternalId() }));
}

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeSession(userId) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, userId);
  } catch {
    // sessão apenas em memória nesta aba
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function readUserStorage() {
  try {
    return localStorage.getItem(USERS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeUserStorage(value) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, value);
  } catch {
    alert("O navegador bloqueou o salvamento local. As alterações ficarão apenas nesta sessão.");
  }
}
