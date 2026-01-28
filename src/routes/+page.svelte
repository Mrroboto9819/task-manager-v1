<script>
  import { onMount } from "svelte";
  import {
    Plus,
    Pencil,
    Trash2,
    UserPlus,
    Layers3,
    KanbanSquare,
    Clipboard,
    Type,
    FileText,
    Hash,
    AlertCircle,
    Target,
    Tag,
    User,
    List,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Briefcase,
    Palette,
    ListOrdered,
    Eye,
    Calendar,
    Activity,
    Heading,
    GripVertical,
    CheckCircle,
    MessageSquare,
    Paperclip,
    Move,
    ChevronLeft,
    ChevronRight,
  } from "lucide-svelte";
  import { marked } from "marked";
  import Modal from "../lib/Modal.svelte";
  import Switch from "../lib/Switch.svelte";
  import gsap from "gsap";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  /**
   * @typedef {Object} Task
   * @property {string} id
   * @property {string} title
   * @property {string} description
   * @property {string} status
   * @property {number} [order]
   * @property {string} [created]
   * @property {string} [updated]
   * @property {string[]} [tags]
   * @property {string} [priority]
   * @property {string} [type]
   * @property {string} [points]
   * @property {string} [asign]
   * @property {string} [epic]
   * @property {string} [sprintId]
   * @property {boolean} [blocked]
   * @property {string} [blocker]
   * @property {string} [acceptance]
   * @property {string} [time]
   */

  /**
   * @typedef {Object} Status
   * @property {string} id
   * @property {string} status
   * @property {string} color
   * @property {boolean} show
   * @property {number} order
   * @property {string} created
   * @property {string} updated
   */

  const STORAGE_KEYS = {
    tasks: "task-manager-v1:tasks",
    users: "task-manager-v1:users",
    statuses: "task-manager-v1:statuses",
    sprints: "task-manager-v1:sprints",
  };

  const DEFAULT_STATUS_COLORS = [
    "#0f172a",
    "#0ea5e9",
    "#f59e0b",
    "#22c55e",
    "#8b5cf6",
  ];
  const DEFAULT_STATUSES = [
    {
      id: "BACKLOG",
      status: "BACKLOG",
      color: DEFAULT_STATUS_COLORS[0],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: "READY",
      status: "READY",
      color: DEFAULT_STATUS_COLORS[1],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: "IN PROGRESS",
      status: "IN PROGRESS",
      color: DEFAULT_STATUS_COLORS[2],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: "REVIEW",
      status: "REVIEW",
      color: DEFAULT_STATUS_COLORS[3],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: "DONE",
      status: "DONE",
      color: DEFAULT_STATUS_COLORS[4],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  ];

  let activeView = $state("tasks");
  /** @type {Task[]} */
  let tasks = $state([]);
  /** @type {any[]} */
  let users = $state([]);
  /** @type {Status[]} */
  let statuses = $state([]);
  /** @type {any[]} */
  let sprints = $state([]);

  let taskForm = $state({
    id: "",
    title: "",
    description: "",
    tags: "",
    asign: "",
    time: "",
    status: "BACKLOG",
    type: "story",
    points: "",
    priority: "medium",
    epic: "",
    sprintId: "",
    blocked: false,
    blocker: "",
    acceptance: "",
  });

  let userForm = $state({
    id: "",
    name: "",
    lastname: "",
    rol: "",
  });

  let statusForm = $state({
    status: "",
    original: "",
    color: DEFAULT_STATUS_COLORS[0],
    show: true,
    order: 0,
  });

  let sprintForm = $state({
    id: "",
    name: "",
    goal: "",
    start: "",
    end: "",
    status: "planned",
  });

  let taskModalOpen = $state(false);
  let showPreview = $state("write");
  let userModalOpen = $state(false);
  let statusModalOpen = $state(false);
  let sprintModalOpen = $state(false);
  let confirmDeleteModalOpen = $state(false);
  let taskToDelete = $state(null);
  let taskModalMode = $state("create");
  let userModalMode = $state("create");
  let statusModalMode = $state("create");
  let sprintModalMode = $state("create");
  let filterStatus = $state("all");
  let filterTag = $state("");
  let filterFrom = $state("");
  let filterTo = $state("");
  let statusMessage = $state("");
  let statusKind = $state("info");
  let statusTimer = $state(null);
  let taskDndItems = $state({});
  let appVersion = $state("dev");

  // Scroll containers for status columns
  let sprintScrollContainer = $state(null);
  let tasksScrollContainer = $state(null);

  // Drag and drop config
  const flipDurationMs = 200;

  const newId = () => crypto.randomUUID();

  // Scroll functions for horizontal scrolling
  function scrollContainer(container, direction) {
    if (!container) return;
    const scrollAmount = 340; // Width of one column (320px) + gap (20px)
    const targetScroll =
      container.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }

  function loadCollection(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function saveCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function notify(message, kind = "info", timeout = 2400) {
    statusMessage = message;
    statusKind = kind;
    if (statusTimer) clearTimeout(statusTimer);
    if (timeout) {
      statusTimer = setTimeout(() => {
        statusMessage = "";
      }, timeout);
    }
  }

  // Remove duplicates by ID
  function removeDuplicates(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (seen.has(item.id)) {
        console.warn(`Duplicate ID found and removed: ${item.id}`);
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  function normalizeStatuses(items) {
    const now = new Date().toISOString();
    const usedIds = new Set();
    const usedStatusNames = new Set();

    // First pass: remove items with duplicate status names
    const uniqueItems = items.filter((item) => {
      if (usedStatusNames.has(item.status)) {
        console.warn(`Duplicate status name found and removed: ${item.status}`);
        return false;
      }
      usedStatusNames.add(item.status);
      return true;
    });

    return uniqueItems.map((item, index) => {
      const existingOrder = Number.isFinite(item.order) ? item.order : null;
      const baseId = item.id || item.status || `status-${index + 1}`;
      let nextId = baseId;
      let suffix = 2;
      while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(nextId);
      return {
        id: nextId,
        status: item.status,
        color:
          item.color ||
          DEFAULT_STATUS_COLORS[index % DEFAULT_STATUS_COLORS.length],
        show: item.show ?? true,
        order: existingOrder ?? index + 1,
        created: item.created || now,
        updated: item.updated || now,
      };
    });
  }

  function normalizeTasks(items) {
    const now = new Date().toISOString();
    const usedIds = new Set();
    let changed = false;
    const normalized = items.map((task) => {
      const safeTask = task && typeof task === "object" ? task : {};
      if (safeTask !== task) changed = true;
      let id =
        typeof safeTask.id === "string" && safeTask.id.trim()
          ? safeTask.id
          : newId();
      if (id !== safeTask.id) changed = true;
      while (usedIds.has(id)) {
        id = newId();
        changed = true;
      }
      usedIds.add(id);
      return {
        id,
        title: safeTask.title || "",
        description: safeTask.description || "",
        tags: Array.isArray(safeTask.tags) ? safeTask.tags : [],
        asign: safeTask.asign || "",
        created: safeTask.created || now,
        updated: safeTask.updated || now,
        time: safeTask.time || "",
        status: safeTask.status || "BACKLOG",
        type: safeTask.type || "story",
        points: safeTask.points ?? "",
        priority: safeTask.priority || "medium",
        epic: safeTask.epic || "",
        sprintId: safeTask.sprintId || "",
        blocked: Boolean(safeTask.blocked),
        blocker: safeTask.blocker || "",
        acceptance: safeTask.acceptance || "",
      };
    });
    return { items: normalized, changed };
  }

  function normalizeSprints(items) {
    const now = new Date().toISOString();
    const usedIds = new Set();
    let changed = false;
    const normalized = items.map((sprint) => {
      const safeSprint = sprint && typeof sprint === "object" ? sprint : {};
      if (safeSprint !== sprint) changed = true;
      let id =
        typeof safeSprint.id === "string" && safeSprint.id.trim()
          ? safeSprint.id
          : newId();
      if (id !== safeSprint.id) changed = true;
      while (usedIds.has(id)) {
        id = newId();
        changed = true;
      }
      usedIds.add(id);
      return {
        id,
        name: safeSprint.name || "Sprint",
        goal: safeSprint.goal || "",
        start: safeSprint.start || now.slice(0, 10),
        end: safeSprint.end || now.slice(0, 10),
        status: safeSprint.status || "planned",
        created: safeSprint.created || now,
        updated: safeSprint.updated || now,
      };
    });
    return { items: normalized, changed };
  }

  function hydrate() {
    const loadedTasks = loadCollection(STORAGE_KEYS.tasks, []);
    const loadedUsers = loadCollection(STORAGE_KEYS.users, []);
    const loadedStatuses = loadCollection(
      STORAGE_KEYS.statuses,
      DEFAULT_STATUSES,
    );
    const loadedSprints = loadCollection(STORAGE_KEYS.sprints, []);

    const normalizedTasks = normalizeTasks(loadedTasks);
    tasks = normalizedTasks.items;
    users = removeDuplicates(loadedUsers);
    statuses = normalizeStatuses(loadedStatuses).sort(
      (a, b) => a.order - b.order,
    );
    const normalizedSprints = normalizeSprints(loadedSprints);
    sprints = normalizedSprints.items;
    if (normalizedTasks.changed) {
      saveTasks();
    }
    if (normalizedSprints.changed) {
      saveSprints();
    }

    // Save cleaned data back if duplicates were found
    const tasksHadDuplicates = loadedTasks.length !== tasks.length;
    const usersHadDuplicates = loadedUsers.length !== users.length;
    const sprintsHadDuplicates = loadedSprints.length !== sprints.length;

    if (tasksHadDuplicates) {
      saveTasks();
      console.warn("Cleaned duplicate tasks from storage");
    }
    if (usersHadDuplicates) {
      saveUsers();
      console.warn("Cleaned duplicate users from storage");
    }
    if (sprintsHadDuplicates) {
      saveSprints();
      console.warn("Cleaned duplicate sprints from storage");
    }

    notify("Loaded local data.", "info", 1400);
  }

  function saveTasks() {
    // Remove duplicates before saving
    tasks = removeDuplicates(tasks);
    saveCollection(STORAGE_KEYS.tasks, tasks);
  }

  function saveUsers() {
    users = removeDuplicates(users);
    saveCollection(STORAGE_KEYS.users, users);
  }

  function saveStatuses() {
    statuses = removeDuplicates(statuses);
    saveCollection(STORAGE_KEYS.statuses, statuses);
  }

  function saveSprints() {
    sprints = removeDuplicates(sprints);
    saveCollection(STORAGE_KEYS.sprints, sprints);
  }

  /**
   * @param {string} mode
   * @param {Task | null} [task]
   */
  function openTaskModal(mode, task = null) {
    taskModalMode = mode;
    showPreview = "write";
    if (task) {
      taskForm = {
        id: task.id,
        title: task.title,
        description: task.description,
        tags: (task.tags || []).join(", "),
        asign: task.asign || "",
        time: task.time || "",
        status: task.status,
        type: task.type || "story",
        points: task.points ?? "",
        priority: task.priority || "medium",
        epic: task.epic || "",
        sprintId: task.sprintId || "",
        blocked: Boolean(task.blocked),
        blocker: task.blocker || "",
        acceptance: task.acceptance || "",
      };
    } else {
      taskForm = {
        id: "",
        title: "",
        description: "",
        tags: "",
        asign: "",
        time: "",
        status: statuses[0]?.status || "BACKLOG",
        type: "story",
        points: "",
        priority: "medium",
        epic: "",
        sprintId: activeSprint()?.id || "",
        blocked: false,
        blocker: "",
        acceptance: "",
      };
    }
    taskModalOpen = true;
  }

  function closeTaskModal() {
    taskModalOpen = false;
  }

  /** @param {Event} event */
  function upsertTask(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const payload = {
      id: taskForm.id || newId(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      tags: taskForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      asign: taskForm.asign.trim(),
      created: taskForm.id
        ? tasks.find((task) => task.id === taskForm.id)?.created
        : now,
      updated: now,
      time: taskForm.time.trim(),
      status: taskForm.status,
      type: taskForm.type,
      points: String(taskForm.points || "").trim(),
      priority: taskForm.priority,
      epic: taskForm.epic.trim(),
      sprintId: taskForm.sprintId,
      blocked: Boolean(taskForm.blocked),
      blocker: taskForm.blocker.trim(),
      acceptance: taskForm.acceptance.trim(),
    };

    if (!payload.title) {
      notify("Task title is required.", "warning");
      return;
    }

    if (taskForm.id) {
      tasks = tasks.map((task) => (task.id === taskForm.id ? payload : task));
      notify("Task updated.", "success");
    } else {
      tasks = [payload, ...tasks];
      notify("Task created.", "success");
    }
    saveTasks();
    closeTaskModal();
  }

  function openConfirmDeleteModal(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    taskToDelete = task;
    confirmDeleteModalOpen = true;
  }

  function closeConfirmDeleteModal() {
    confirmDeleteModalOpen = false;
    taskToDelete = null;
  }

  function confirmDeleteTask() {
    if (!taskToDelete) return;
    tasks = tasks.filter((task) => task.id !== taskToDelete.id);
    saveTasks();
    notify("Task removed.", "warning");
    closeConfirmDeleteModal();
  }

  function removeTask(id) {
    openConfirmDeleteModal(id);
  }

  /**
   * @param {string} mode
   * @param {any} [user]
   */
  function openUserModal(mode, user = null) {
    userModalMode = mode;
    if (user) {
      userForm = {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        rol: user.rol,
      };
    } else {
      userForm = { id: "", name: "", lastname: "", rol: "" };
    }
    userModalOpen = true;
  }

  function closeUserModal() {
    userModalOpen = false;
  }

  /** @param {Event} event */
  function upsertUser(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const payload = {
      id: userForm.id || newId(),
      name: userForm.name.trim(),
      lastname: userForm.lastname.trim(),
      rol: userForm.rol.trim(),
      created: userForm.id
        ? users.find((user) => user.id === userForm.id)?.created
        : now,
      updated: now,
    };

    if (!payload.name) {
      notify("User name is required.", "warning");
      return;
    }

    if (userForm.id) {
      users = users.map((user) => (user.id === userForm.id ? payload : user));
      notify("User updated.", "success");
    } else {
      users = [payload, ...users];
      notify("User created.", "success");
    }
    saveUsers();
    closeUserModal();
  }

  function removeUser(id) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    if (
      !confirm(
        `Remove user "${user.name} ${user.lastname}". This cannot be undone.`,
      )
    )
      return;
    users = users.filter((user) => user.id !== id);
    saveUsers();
    notify("User removed.", "warning");
  }

  /**
   * @param {string} mode
   * @param {Status | null} [status]
   */
  function openStatusModal(mode, status = null) {
    statusModalMode = mode;
    statusForm = {
      status: status?.status || "",
      original: status?.status || "",
      color: status?.color || DEFAULT_STATUS_COLORS[0],
      show: status?.show ?? true,
      order: Number.isFinite(status?.order)
        ? status.order
        : statuses.length + 1,
    };
    statusModalOpen = true;
  }

  function closeStatusModal() {
    statusModalOpen = false;
  }

  /**
   * @param {string} mode
   * @param {any} [sprint]
   */
  function openSprintModal(mode, sprint = null) {
    sprintModalMode = mode;
    if (sprint) {
      sprintForm = {
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal || "",
        start: sprint.start || "",
        end: sprint.end || "",
        status: sprint.status || "planned",
      };
    } else {
      sprintForm = {
        id: "",
        name: "",
        goal: "",
        start: "",
        end: "",
        status: "planned",
      };
    }
    sprintModalOpen = true;
  }

  function closeSprintModal() {
    sprintModalOpen = false;
  }

  /** @param {Event} event */
  function upsertSprint(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const payload = {
      id: sprintForm.id || newId(),
      name: sprintForm.name.trim(),
      goal: sprintForm.goal.trim(),
      start: sprintForm.start,
      end: sprintForm.end,
      status: sprintForm.status,
      created: sprintForm.id
        ? sprints.find((s) => s.id === sprintForm.id)?.created
        : now,
      updated: now,
    };

    if (!payload.name) {
      notify("Sprint name is required.", "warning");
      return;
    }

    if (sprintForm.id) {
      sprints = sprints.map((sprint) =>
        sprint.id === sprintForm.id
          ? payload
          : payload.status === "active" && sprint.status === "active"
            ? { ...sprint, status: "planned", updated: now }
            : sprint,
      );
      notify("Sprint updated.", "success");
    } else {
      sprints = [
        payload,
        ...sprints.map((sprint) =>
          payload.status === "active" && sprint.status === "active"
            ? { ...sprint, status: "planned", updated: now }
            : sprint,
        ),
      ];
      notify("Sprint created.", "success");
    }
    saveSprints();
    closeSprintModal();
  }

  function removeSprint(id) {
    const sprint = sprints.find((item) => item.id === id);
    if (!sprint) return;
    const count = tasks.filter((task) => task.sprintId === id).length;
    if (
      !confirm(
        `Remove sprint "${sprint.name}"? ${count} item(s) will move to backlog.`,
      )
    )
      return;
    sprints = sprints.filter((item) => item.id !== id);
    tasks = tasks.map((task) =>
      task.sprintId === id ? { ...task, sprintId: "" } : task,
    );
    saveSprints();
    saveTasks();
    notify("Sprint removed.", "warning");
  }

  function activateSprint(id) {
    const sprint = sprints.find((item) => item.id === id);
    if (!sprint) return;
    sprints = sprints.map((item) => ({
      ...item,
      status:
        item.id === id
          ? "active"
          : item.status === "active"
            ? "planned"
            : item.status,
      updated: new Date().toISOString(),
    }));
    saveSprints();
    notify(`Sprint "${sprint.name}" is now active.`, "success");
  }

  function completeSprint(id) {
    const sprint = sprints.find((item) => item.id === id);
    if (!sprint) return;
    sprints = sprints.map((item) =>
      item.id === id
        ? { ...item, status: "closed", updated: new Date().toISOString() }
        : item,
    );
    saveSprints();
    notify(`Sprint "${sprint.name}" closed.`, "success");
  }

  /** @param {Event} event */
  function upsertStatus(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const value = statusForm.status.trim();
    if (!value) {
      notify("Status name is required.", "warning");
      return;
    }
    const normalizedValue = value.toLowerCase();
    const hasDuplicate = statuses.some(
      (item) =>
        item.status.toLowerCase() === normalizedValue &&
        item.status !== statusForm.original,
    );
    if (hasDuplicate) {
      notify("Status name already exists.", "warning");
      return;
    }

    if (statusForm.original) {
      statuses = statuses.map((item) =>
        item.status === statusForm.original
          ? {
              ...item,
              status: value,
              color: statusForm.color,
              show: statusForm.show,
              order: Number(statusForm.order) || item.order,
              updated: now,
            }
          : item,
      );
      tasks = tasks.map((task) =>
        task.status === statusForm.original
          ? { ...task, status: value, updated: now }
          : task,
      );
      saveTasks();
      notify("Status updated.", "success");
    } else {
      statuses = [
        {
          id: value,
          status: value,
          color: statusForm.color,
          show: statusForm.show,
          order: Number(statusForm.order) || statuses.length + 1,
          created: now,
          updated: now,
        },
        ...statuses,
      ];
      notify("Status created.", "success");
    }
    saveStatuses();
    closeStatusModal();
  }

  function resetLocalData() {
    if (
      !confirm(
        "Reset local data to defaults? This will remove all tasks, users, sprints, and custom statuses. This cannot be undone.",
      )
    )
      return;

    // Clear localStorage completely
    localStorage.removeItem(STORAGE_KEYS.tasks);
    localStorage.removeItem(STORAGE_KEYS.users);
    localStorage.removeItem(STORAGE_KEYS.statuses);
    localStorage.removeItem(STORAGE_KEYS.sprints);

    // Reset to defaults
    tasks = [];
    users = [];
    statuses = normalizeStatuses(DEFAULT_STATUSES).sort(
      (a, b) => a.order - b.order,
    );
    sprints = [];

    // Save clean data
    saveTasks();
    saveUsers();
    saveStatuses();
    saveSprints();
    notify("Local data reset.", "warning", 1600);
  }

  function removeStatus(status) {
    const fallbackStatus =
      statuses.find((item) => item.status !== status)?.status || "BACKLOG";
    const affected = tasks.filter((task) => task.status === status).length;
    if (
      !confirm(
        `Remove status "${status}"? ${affected} task(s) will move to "${fallbackStatus}".`,
      )
    )
      return;
    statuses = statuses.filter((item) => item.status !== status);
    tasks = tasks.map((task) =>
      task.status === status ? { ...task, status: fallbackStatus } : task,
    );
    saveTasks();
    saveStatuses();
    notify("Status removed.", "warning");
  }

  // Drag and Drop handlers for tasks using svelte-dnd-action
  function handleTaskDndConsider(status, e, isSprint = false) {
    const { items: newItems } = e.detail;
    taskDndItems = { ...taskDndItems, [status]: newItems };
  }

  function handleTaskDndFinalize(status, e, isSprint = false) {
    const { items: newItems } = e.detail;
    const now = new Date().toISOString();
    const cleanItems = newItems.filter((item) => !item.isDndShadowItem);
    const newItemIds = new Set(cleanItems.map((item) => item.id));
    const otherTasks = tasks.filter((task) => !newItemIds.has(task.id));
    const updatedItems = cleanItems.map((item, index) => ({
      ...item,
      status,
      order: index + 1,
      updated: now,
    }));

    tasks = [...otherTasks, ...updatedItems];
    taskDndItems = {};
    saveTasks();
  }


  const assignedUsers = () =>
    users.map((user) => `${user.name} ${user.lastname}`.trim()).filter(Boolean);

  const activeSprint = () =>
    sprints.find((sprint) => sprint.status === "active") || null;

  const backlogItems = () => tasks.filter((task) => !task.sprintId);

  const sprintItems = () => {
    const sprint = activeSprint();
    if (!sprint) return [];
    return tasks.filter((task) => task.sprintId === sprint.id);
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function matchesStatus(task) {
    return filterStatus === "all" ? true : task.status === filterStatus;
  }

  function matchesTag(task) {
    if (!filterTag.trim()) return true;
    const needle = filterTag.trim().toLowerCase();
    return (task.tags || []).some((tag) => tag.toLowerCase().includes(needle));
  }

  function matchesDate(task) {
    if (!filterFrom && !filterTo) return true;
    const created = new Date(
      task.created || task.updated || Date.now(),
    ).getTime();
    if (Number.isNaN(created)) return true;
    if (filterFrom) {
      const fromDate = new Date(`${filterFrom}T00:00:00`).getTime();
      if (created < fromDate) return false;
    }
    if (filterTo) {
      const toDate = new Date(`${filterTo}T23:59:59`).getTime();
      if (created > toDate) return false;
    }
    return true;
  }

  const filteredTasks = () =>
    tasks.filter(
      (task) => matchesStatus(task) && matchesTag(task) && matchesDate(task),
    );

  const tasksForStatus = (status) =>
    filteredTasks()
      .filter((task) => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sprintTasksForStatus = (status) =>
    sprintItems()
      .filter((task) => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

  const tasksForStatusDnd = (status) =>
    taskDndItems[status] || tasksForStatus(status);

  const sprintTasksForStatusDnd = (status) =>
    taskDndItems[status] || sprintTasksForStatus(status);

  // Return visible statuses sorted by order
  const visibleStatuses = () =>
    statuses
      .filter((statusItem) => statusItem.show !== false)
      .sort((a, b) => a.order - b.order);

  const totalPoints = (items) =>
    items.reduce((sum, item) => sum + (Number(item.points) || 0), 0);

  const sprintNameFor = (id) =>
    sprints.find((sprint) => sprint.id === id)?.name || "";

  function moveToSprint(id, sprintId) {
    tasks = tasks.map((task) =>
      task.id === id
        ? { ...task, sprintId, updated: new Date().toISOString() }
        : task,
    );
    saveTasks();
    notify(
      sprintId ? "Item added to sprint." : "Item moved to backlog.",
      "success",
    );
  }

  function copyTagsSummary() {
    const lines = [];
    const sortedStatuses = statuses
      .filter((statusItem) => statusItem.show !== false)
      .slice()
      .sort((a, b) => a.order - b.order);
    sortedStatuses.forEach((statusItem) => {
      const list = tasksForStatus(statusItem.status);
      lines.push(`${statusItem.status}:`);
      if (list.length === 0) {
        lines.push("- (no tasks)");
      } else {
        list.forEach((task) => {
          const detail = task.description ? `: ${task.description}` : "";
          lines.push(`- ${task.title}${detail}`);
        });
      }
      lines.push("");
    });
    const text = lines.join("\n").trim();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      notify("Summary copied to clipboard.", "success");
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    notify("Summary copied to clipboard.", "success");
  }

  async function checkForUpdates() {
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      const update = await check();
      if (update?.available) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (error) {
      console.debug("Updater not available.", error);
    }
  }

  async function loadAppVersion() {
    try {
      const { getVersion } = await import("@tauri-apps/api/app");
      appVersion = await getVersion();
    } catch {
      appVersion = "dev";
    }
  }

  onMount(() => {
    hydrate();
    gsap.from("main", { opacity: 0, duration: 0.6, ease: "power2.out" });
    gsap.from("header", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out",
    });
    loadAppVersion();
    checkForUpdates();
  });
</script>

<main
  class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10"
>
  <div class="fixed right-6 top-6 z-50 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm backdrop-blur">
    v{appVersion}
  </div>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-500">
          Task Manager
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
          Build your day, drag and drop.
        </h1>
      </div>
      <div
        class={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          statusMessage
            ? statusKind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : statusKind === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-500"
            : "border-transparent text-transparent"
        }`}
        role="status"
        aria-live="polite"
      >
        {statusMessage || "Status ready"}
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
          onclick={resetLocalData}
          title="Reset local data"
        >
          <AlertTriangle size={14} />
          Dev reset
        </button>
        {#each ["sprint", "backlog", "tasks", "users", "statuses"] as view}
          <button
            type="button"
            class={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              activeView === view
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            onclick={() => (activeView = view)}
          >
            {#if view === "sprint"}
              <KanbanSquare size={14} />
            {:else if view === "backlog"}
              <Clipboard size={14} />
            {:else if view === "tasks"}
              <KanbanSquare size={14} />
            {:else if view === "users"}
              <UserPlus size={14} />
            {:else}
              <Layers3 size={14} />
            {/if}
            {view}
          </button>
        {/each}
      </div>
    </header>

    {#if activeView === "sprint"}
      <section class="flex flex-col gap-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Sprint board</h2>
              <p class="text-sm text-slate-500">
                Focus on the active sprint and move work to done.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
                onclick={() => openSprintModal("create")}
              >
                <Plus size={16} />
                New sprint
              </button>
            </div>
          </div>

          {#if activeSprint()}
            <div
              class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm"
            >
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p
                    class="text-xs uppercase tracking-[0.3em] text-emerald-700"
                  >
                    Active sprint
                  </p>
                  <h3 class="mt-2 text-lg font-semibold text-emerald-900">
                    {activeSprint().name}
                  </h3>
                  {#if activeSprint().goal}
                    <p class="mt-1 text-emerald-800">{activeSprint().goal}</p>
                  {/if}
                  <p class="mt-2 text-xs text-emerald-700">
                    {activeSprint().start} → {activeSprint().end}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <div
                    class="rounded-xl border border-emerald-200 bg-white px-4 py-3"
                  >
                    <p
                      class="text-[11px] uppercase tracking-wide text-emerald-600"
                    >
                      Items
                    </p>
                    <p class="mt-1 text-lg font-semibold text-emerald-900">
                      {sprintItems().length}
                    </p>
                  </div>
                  <div
                    class="rounded-xl border border-emerald-200 bg-white px-4 py-3"
                  >
                    <p
                      class="text-[11px] uppercase tracking-wide text-emerald-600"
                    >
                      Points
                    </p>
                    <p class="mt-1 text-lg font-semibold text-emerald-900">
                      {totalPoints(sprintItems())}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400"
                    onclick={() => completeSprint(activeSprint().id)}
                  >
                    Close sprint
                  </button>
                </div>
              </div>
            </div>
          {:else}
            <div
              class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500"
            >
              No active sprint found. Create a new sprint, add tasks to it, and
              activate it to start your iteration.
            </div>
          {/if}
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-base font-semibold text-slate-900">Sprints</h3>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            {#each sprints as sprint}
              <div
                class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h4 class="font-semibold text-slate-900">{sprint.name}</h4>
                    <p class="text-xs text-slate-500">
                      {sprint.start} → {sprint.end}
                    </p>
                    {#if sprint.goal}
                      <p class="mt-1 text-xs text-slate-500">{sprint.goal}</p>
                    {/if}
                    <span
                      class="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500"
                    >
                      {sprint.status}
                    </span>
                  </div>
                  <div class="flex flex-col gap-2">
                    {#if sprint.status !== "active"}
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded-full border border-emerald-200 px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-700 transition hover:border-emerald-300"
                        onclick={() => activateSprint(sprint.id)}
                      >
                        Start
                      </button>
                    {/if}
                    {#if sprint.status === "active"}
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded-full border border-amber-200 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-700 transition hover:border-amber-300"
                        onclick={() => completeSprint(sprint.id)}
                      >
                        Close
                      </button>
                    {/if}
                    <button
                      type="button"
                      class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                      onclick={() => openSprintModal("edit", sprint)}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      class="flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-500 transition hover:border-rose-300"
                      onclick={() => removeSprint(sprint.id)}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
              >
                No sprints created yet. Start a new sprint cycle to manage your
                team's workload.
              </div>
            {/each}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button
            type="button"
            class="hidden lg:flex flex-none items-center justify-center rounded-full bg-white border-2 border-slate-300 p-2 shadow-lg transition hover:bg-slate-50 hover:border-slate-400"
            onclick={() => scrollContainer(sprintScrollContainer, "left")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} class="text-slate-600" />
          </button>
          <section
            bind:this={sprintScrollContainer}
            class="status-dnd flex flex-1 gap-4 overflow-x-auto lg:overflow-x-hidden pb-2 scroll-smooth"
          >
            {#each visibleStatuses() as statusItem (statusItem.id)}
              <div
                class="flex min-h-[420px] w-[320px] flex-none flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all"
                role="list"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span
                        class="h-2.5 w-2.5 rounded-full"
                        style={`background-color: ${statusItem.color}`}
                      ></span>
                      <h3
                        class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500"
                      >
                        {statusItem.status}
                      </h3>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">
                      Updated {statusItem.updated.slice(0, 10)}
                    </p>
                  </div>
                  <span
                    class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500"
                  >
                    {sprintTasksForStatus(statusItem.status).length}
                  </span>
                </div>
                <div
                  class="mt-4 flex flex-1 flex-col gap-3"
                  use:dndzone={{
                    items: sprintTasksForStatusDnd(statusItem.status),
                    flipDurationMs,
                    type: "task"
                  }}
                  onconsider={(e) => handleTaskDndConsider(statusItem.status, e, true)}
                  onfinalize={(e) => handleTaskDndFinalize(statusItem.status, e, true)}
                >
                  {#each sprintTasksForStatusDnd(statusItem.status) as task (task.id)}
                    <article
                      animate:flip={{ duration: flipDurationMs }}
                      class={`group cursor-grab rounded-xl border-2 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                        task.blocked
                          ? "border-rose-300 bg-rose-50/60 hover:border-rose-400 hover:bg-rose-50/80"
                          : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-white"
                      }`}
                    >
                      <div class="flex flex-col gap-3">
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex items-start gap-2 flex-1">
                            <div class="mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity duration-200">
                              <GripVertical size={14} class="text-slate-500" />
                            </div>
                            <div class="flex-1">
                              <h4 class="text-sm font-semibold text-slate-900">
                                {task.title}
                              </h4>
                              {#if task.description}
                                <p class="mt-1 text-xs text-slate-600">
                                  {task.description}
                                </p>
                              {/if}
                            </div>
                          </div>
                          <div
                            class="flex gap-2 opacity-0 transition group-hover:opacity-100"
                          >
                            <button
                              type="button"
                              class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                              onclick={() => openTaskModal("edit", task)}
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              class="flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                              onclick={() => removeTask(task.id)}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                        <div
                          class="flex items-center gap-2 text-[11px] text-slate-500 overflow-x-auto scrollbar-hide"
                        >
                          <span
                            class="flex-none rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500"
                          >
                            {task.type}
                          </span>
                          <span
                            class="flex-none rounded-full bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wide text-white"
                          >
                            {task.points || "0"} pts
                          </span>
                          <span
                            class="flex-none rounded-full bg-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-600"
                          >
                            {task.priority}
                          </span>
                          {#if task.blocked}
                            <span
                              class="flex-none rounded-full bg-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-700"
                            >
                              Blocked
                            </span>
                          {/if}
                          <span
                            class="flex-none ml-auto text-[10px] uppercase tracking-wide text-slate-400"
                          >
                            ID {task.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </article>
                  {:else}
                    <div
                      class="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/20"
                    >
                      <span
                        class="text-xs uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2"
                      >
                        <Move size={14} class="opacity-50" />
                        Drop tasks here
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </section>
          <button
            type="button"
            class="hidden lg:flex flex-none items-center justify-center rounded-full bg-white border-2 border-slate-300 p-2 shadow-lg transition hover:bg-slate-50 hover:border-slate-400"
            onclick={() => scrollContainer(sprintScrollContainer, "right")}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} class="text-slate-600" />
          </button>
        </div>
      </section>
    {/if}

    {#if activeView === "backlog"}
      <section class="flex flex-col gap-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                Product backlog
              </h2>
              <p class="text-sm text-slate-500">
                Prioritize and prepare items for the next sprint.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                onclick={() => openTaskModal("create")}
              >
                <Plus size={16} />
                New backlog item
              </button>
            </div>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Backlog items
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {backlogItems().length}
              </p>
            </div>
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Active sprint
              </p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {activeSprint() ? activeSprint().name : "None"}
              </p>
            </div>
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Points in backlog
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {totalPoints(backlogItems())}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">Backlog list</h3>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            {#each backlogItems() as task}
              <article
                class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-slate-900">{task.title}</h4>
                    {#if task.description}
                      <p class="mt-1 text-xs text-slate-600">
                        {task.description}
                      </p>
                    {/if}
                    <div
                      class="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"
                    >
                      <span
                        class="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500"
                      >
                        {task.type}
                      </span>
                      <span
                        class="rounded-full bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wide text-white"
                      >
                        {task.points || "0"} pts
                      </span>
                      <span
                        class="rounded-full bg-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-600"
                      >
                        {task.priority}
                      </span>
                      {#if task.epic}
                        <span
                          class="rounded-full bg-indigo-100 px-2 py-1 text-[10px] uppercase tracking-wide text-indigo-700"
                        >
                          {task.epic}
                        </span>
                      {/if}
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    {#if activeSprint()}
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded-full border border-emerald-200 px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-700 transition hover:border-emerald-300"
                        onclick={() => moveToSprint(task.id, activeSprint().id)}
                      >
                        Add to sprint
                      </button>
                    {/if}
                    <button
                      type="button"
                      class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                      onclick={() => openTaskModal("edit", task)}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            {:else}
              <div
                class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
              >
                Backlog is empty. Add items to plan your next sprint.
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    {#if activeView === "tasks"}
      <section class="flex flex-col gap-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Tasks</h2>
              <p class="text-sm text-slate-500">
                Store tasks locally with UUIDs.
              </p>
              <p class="mt-1 text-xs text-slate-400">
                Tip: drag task cards between columns. Drag column titles to
                reorder.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300"
                onclick={() => {
                  filterStatus = "all";
                  filterTag = "";
                  filterFrom = "";
                  filterTo = "";
                  notify("Filters cleared.", "info");
                }}
              >
                Clear filters
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300"
                onclick={copyTagsSummary}
              >
                <Clipboard size={14} />
                Copy summary
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                onclick={() => openTaskModal("create")}
              >
                <Plus size={16} />
                New task
              </button>
            </div>
          </div>
          <div class="mt-5 grid gap-3 md:grid-cols-4">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
              <select
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterStatus}
              >
                <option value="all">All</option>
                {#each statuses
                  .slice()
                  .sort((a, b) => a.order - b.order) as statusItem}
                  <option value={statusItem.status}>{statusItem.status}</option>
                {/each}
              </select>
            </label>
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Tag
              <input
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="design"
                bind:value={filterTag}
              />
            </label>
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              From
              <input
                type="date"
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterFrom}
              />
            </label>
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              To
              <input
                type="date"
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterTo}
              />
            </label>
          </div>
          <div class="mt-6 grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Total tasks
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {tasks.length}
              </p>
            </div>
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Filtered tasks
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {filteredTasks().length}
              </p>
            </div>
            <div
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Total users
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        {#if tasks.length > 0 && filteredTasks().length === 0}
          <div
            class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700"
          >
            No tasks match your filters. Try clearing the filters or adjusting
            the date range.
          </div>
        {/if}

        <div class="flex items-center gap-4">
          <button
            type="button"
            class="hidden lg:flex flex-none items-center justify-center rounded-full bg-white border-2 border-slate-300 p-2 shadow-lg transition hover:bg-slate-50 hover:border-slate-400"
            onclick={() => scrollContainer(tasksScrollContainer, "left")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} class="text-slate-600" />
          </button>
          <section
            bind:this={tasksScrollContainer}
            class="status-dnd flex flex-1 gap-4 overflow-x-auto lg:overflow-x-hidden pb-2 scroll-smooth"
          >
            {#each visibleStatuses() as statusItem (statusItem.id)}
              <div
                class="flex min-h-[420px] w-[320px] flex-none flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all"
                role="list"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 rounded-full"
                      style={`background-color: ${statusItem.color}`}
                    ></span>
                    <h3
                      class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500"
                    >
                      {statusItem.status}
                    </h3>
                  </div>
                  <div class="flex items-center gap-3">
                    <p class="text-[11px] text-slate-400">
                      Updated {statusItem.updated.slice(0, 10)}
                    </p>
                    <span
                      class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500"
                    >
                      {tasksForStatus(statusItem.status).length}
                    </span>
                  </div>
                </div>
                <div
                  class="mt-4 flex flex-1 flex-col gap-6"
                  use:dndzone={{
                    items: tasksForStatusDnd(statusItem.status),
                    flipDurationMs,
                    type: "task"
                  }}
                  onconsider={(e) => handleTaskDndConsider(statusItem.status, e, false)}
                  onfinalize={(e) => handleTaskDndFinalize(statusItem.status, e, false)}
                >
                  {#each tasksForStatusDnd(statusItem.status) as task (task.id)}
                    <article
                      animate:flip={{ duration: flipDurationMs }}
                      class="group relative flex flex-col rounded-[20px] bg-white border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 active:scale-[0.98] cursor-grab"
                    >
                      <!-- Top Accents -->
                      <div class="mb-4 flex gap-2">
                        <div class="h-1 w-12 rounded-full bg-rose-400"></div>
                        <div class="h-1 w-12 rounded-full bg-rose-200"></div>
                        <div class="h-1 w-12 rounded-full bg-rose-200"></div>
                      </div>

                      <!-- Dates -->
                      <div class="mb-2 text-xs font-medium text-slate-400">
                        {formatDate(task.created || new Date().toISOString())} —
                        {formatDate(task.updated || new Date().toISOString())}
                      </div>

                      <!-- Title -->
                      <div class="mb-2 flex items-start gap-2">
                        <div class="mt-1 opacity-0 group-hover:opacity-40 transition-opacity duration-200">
                          <GripVertical size={16} class="text-slate-500" />
                        </div>
                        <div class="mt-1 text-slate-800">
                          <CheckCircle size={18} strokeWidth={2.5} />
                        </div>
                        <h3
                          class="text-lg font-bold text-slate-800 leading-tight break-words flex-1 cursor-pointer"
                          role="button"
                          tabindex="0"
                          onclick={() => openTaskModal("edit", task)}
                          onkeydown={(e) =>
                            e.key === "Enter" && openTaskModal("edit", task)}
                        >
                          {task.title}
                        </h3>
                      </div>

                      <!-- Description -->
                      {#if task.description}
                        <div
                          class="mb-6 pl-7 text-sm text-slate-500 line-clamp-3 prose prose-xs prose-slate max-w-none cursor-pointer"
                          role="button"
                          tabindex="0"
                          onclick={() => openTaskModal("edit", task)}
                          onkeydown={(e) =>
                            e.key === "Enter" && openTaskModal("edit", task)}
                        >
                          {@html marked.parse(task.description)}
                        </div>
                      {:else}
                        <div class="mb-6"></div>
                      {/if}

                      <!-- Divider -->
                      <div class="my-2 border-t border-slate-100"></div>

                      <!-- Footer -->
                      <div class="mt-2 flex items-center justify-between pl-2">
                        <!-- Left: Avatars -->
                        <div class="flex items-center gap-2">
                          {#if task.asign}
                            <div
                              class="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 uppercase"
                              title={task.asign}
                            >
                              {task.asign[0]}
                            </div>
                          {/if}
                        </div>

                        <!-- Right: Action Buttons -->
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            class="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                            onclick={(e) => {
                              e.stopPropagation();
                              openTaskModal("edit", task);
                            }}
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            class="flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-[10px] uppercase tracking-wide text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                            onclick={(e) => {
                              e.stopPropagation();
                              removeTask(task.id);
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>

                      <!-- Bottom Accent -->
                      <div
                        class="absolute bottom-0 left-6 h-1 w-12 rounded-t-full bg-indigo-500"
                      ></div>
                    </article>
                  {:else}
                    <div
                      class="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/20"
                    >
                      <span
                        class="text-xs uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2"
                      >
                        <Move size={14} class="opacity-50" />
                        Drop tasks here
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </section>
          <button
            type="button"
            class="hidden lg:flex flex-none items-center justify-center rounded-full bg-white border-2 border-slate-300 p-2 shadow-lg transition hover:bg-slate-50 hover:border-slate-400"
            onclick={() => scrollContainer(tasksScrollContainer, "right")}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} class="text-slate-600" />
          </button>
        </div>
      </section>
    {/if}

    {#if activeView === "users"}
      <section
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Users</h2>
            <p class="text-sm text-slate-500">Manage assignees for tasks.</p>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            onclick={() => openUserModal("create")}
          >
            <UserPlus size={16} />
            New user
          </button>
        </div>
        <div class="mt-6 grid gap-3 md:grid-cols-2">
          {#each users as user}
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">
                    {user.name}
                    {user.lastname}
                  </h3>
                  <p class="text-xs text-slate-500">{user.rol || "No role"}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                    onclick={() => openUserModal("edit", user)}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-500 transition hover:border-rose-300"
                    onclick={() => removeUser(user.id)}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
              <div
                class="mt-3 flex items-center justify-between text-[11px] text-slate-500"
              >
                <span>Created {user.created.slice(0, 10)}</span>
                <span>ID: {user.id.slice(0, 8)}</span>
              </div>
            </div>
          {:else}
            <div
              class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
            >
              Add users so tasks can be assigned.
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if activeView === "statuses"}
      <section
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Statuses</h2>
            <p class="text-sm text-slate-500">Customize your task workflow.</p>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
            onclick={() => openStatusModal("create")}
          >
            <Plus size={16} />
            New status
          </button>
        </div>
        <div class="mt-6 grid gap-3 md:grid-cols-2">
          {#each statuses
            .slice()
            .sort((a, b) => a.order - b.order) as statusItem}
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 rounded-full"
                      style={`background-color: ${statusItem.color}`}
                    ></span>
                    <h3 class="font-semibold text-slate-900">
                      {statusItem.status}
                    </h3>
                  </div>
                  <p class="text-xs text-slate-500">
                    Updated {statusItem.updated.slice(0, 10)}
                  </p>
                </div>
                <div class="flex flex-col gap-2">
                  <div
                    class="flex items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-wide text-slate-500"
                  >
                    <span>{statusItem.show ? "Visible" : "Hidden"}</span>
                    <Switch
                      checked={statusItem.show ?? true}
                      aria-label={`Toggle visibility for ${statusItem.status}`}
                      onchange={() => {
                        statuses = statuses.map((item) =>
                          item.status === statusItem.status
                            ? {
                                ...item,
                                show: !item.show,
                                updated: new Date().toISOString(),
                              }
                            : item,
                        );
                        saveStatuses();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                    onclick={() => openStatusModal("edit", statusItem)}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-500 transition hover:border-rose-300"
                    onclick={() => removeStatus(statusItem.status)}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
              <div class="mt-3 text-[11px] text-slate-500">
                Created {statusItem.created.slice(0, 10)}
              </div>
            </div>
          {:else}
            <div
              class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
            >
              Add statuses to define your workflow stages like "To Do", "In
              Progress", "Done".
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</main>

<Modal
  open={taskModalOpen}
  title={taskModalMode === "edit" ? "Edit task" : "New task"}
  size="xl"
  onClose={closeTaskModal}
>
  <form id="task-form" class="flex flex-col gap-4" onsubmit={upsertTask}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Heading size={14} class="text-slate-400" />
        Title
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Ship drag and drop MVP"
        bind:value={taskForm.title}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <FileText size={14} class="text-slate-400" />
          Description
        </div>
        <div class="flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all {showPreview ===
            'write'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'}"
            onclick={() => (showPreview = "write")}
            title="Editor only"
          >
            Write
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all {showPreview ===
            'split'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'}"
            onclick={() => (showPreview = "split")}
            title="Side by side"
          >
            Split
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all {showPreview ===
            'preview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'}"
            onclick={() => (showPreview = "preview")}
            title="Preview only"
          >
            Preview
          </button>
        </div>
      </div>

      {#if showPreview === "write"}
        <textarea
          class="mt-2 min-h-[200px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 font-mono resize-y"
          placeholder="What needs to be done. Markdown is supported."
          bind:value={taskForm.description}
        ></textarea>
      {:else if showPreview === "split"}
        <div class="mt-2 flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <textarea
              class="min-h-[200px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 font-mono resize-y"
              placeholder="What needs to be done. Markdown is supported."
              bind:value={taskForm.description}
            ></textarea>
          </div>
          <div class="flex-1">
            <div
              class="min-h-[200px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm prose prose-sm prose-slate max-w-none overflow-y-auto bg-slate-50"
            >
              {#if taskForm.description}
                {@html marked.parse(taskForm.description)}
              {:else}
                <span class="text-slate-400 italic"
                  >No description to preview.</span
                >
              {/if}
            </div>
          </div>
        </div>
      {:else if showPreview === "preview"}
        <div
          class="mt-2 min-h-[200px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm prose prose-sm prose-slate max-w-none overflow-y-auto bg-slate-50"
        >
          {#if taskForm.description}
            {@html marked.parse(taskForm.description)}
          {:else}
            <span class="text-slate-400 italic">No description to preview.</span
            >
          {/if}
        </div>
      {/if}
    </label>
    <div class="grid gap-4 md:grid-cols-3">
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <div class="flex items-center gap-2 mb-1">
          <Type size={14} class="text-slate-400" />
          Type
        </div>
        <select
          class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          bind:value={taskForm.type}
        >
          <option value="story">Story</option>
          <option value="bug">Bug</option>
          <option value="chore">Chore</option>
        </select>
      </label>
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <div class="flex items-center gap-2 mb-1">
          <Hash size={14} class="text-slate-400" />
          Points
        </div>
        <input
          class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="3"
          bind:value={taskForm.points}
        />
      </label>
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <div class="flex items-center gap-2 mb-1">
          <AlertCircle size={14} class="text-slate-400" />
          Priority
        </div>
        <select
          class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          bind:value={taskForm.priority}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
    </div>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Target size={14} class="text-slate-400" />
        Epic
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Growth"
        bind:value={taskForm.epic}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Tag size={14} class="text-slate-400" />
        Tags (comma separated)
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="design, urgent"
        bind:value={taskForm.tags}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <User size={14} class="text-slate-400" />
        Assign
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={taskForm.asign}
      >
        <option value="">Unassigned</option>
        {#each assignedUsers() as person}
          <option value={person}>{person}</option>
        {/each}
      </select>
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Activity size={14} class="text-slate-400" />
        Status
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={taskForm.status}
      >
        {#each statuses as statusItem}
          <option value={statusItem.status}>{statusItem.status}</option>
        {/each}
      </select>
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Layers3 size={14} class="text-slate-400" />
        Sprint
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={taskForm.sprintId}
      >
        <option value="">Backlog</option>
        {#each sprints as sprint}
          <option value={sprint.id}>{sprint.name}</option>
        {/each}
      </select>
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Clock size={14} class="text-slate-400" />
        Time
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="2h"
        bind:value={taskForm.time}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <CheckCircle2 size={14} class="text-slate-400" />
        Acceptance criteria
      </div>
      <textarea
        class="mt-2 min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Given..., when..., then..."
        bind:value={taskForm.acceptance}
      ></textarea>
    </label>
    <Switch bind:checked={taskForm.blocked} label="Status: Blocked" />
    {#if taskForm.blocked}
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        Blocker reason
        <input
          class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="Waiting on API access"
          bind:value={taskForm.blocker}
        />
      </label>
    {/if}
  </form>
  <div class="flex items-center justify-end gap-2" slot="footer">
    <button
      type="button"
      class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      onclick={closeTaskModal}
    >
      Cancel
    </button>
    <button
      type="submit"
      form="task-form"
      class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
    >
      <Plus size={16} />
      Save task
    </button>
  </div>
</Modal>

<Modal
  open={userModalOpen}
  title={userModalMode === "edit" ? "Edit user" : "New user"}
  onClose={closeUserModal}
>
  <form id="user-form" class="flex flex-col gap-4" onsubmit={upsertUser}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <User size={14} class="text-slate-400" />
        Name
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Alex"
        bind:value={userForm.name}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Type size={14} class="text-slate-400" />
        Lastname
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Morgan"
        bind:value={userForm.lastname}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Briefcase size={14} class="text-slate-400" />
        Role
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Designer"
        bind:value={userForm.rol}
      />
    </label>
  </form>
  <div class="flex items-center justify-end gap-2" slot="footer">
    <button
      type="button"
      class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      onclick={closeUserModal}
    >
      Cancel
    </button>
    <button
      type="submit"
      form="user-form"
      class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
    >
      <UserPlus size={16} />
      Save user
    </button>
  </div>
</Modal>

<Modal
  open={statusModalOpen}
  title={statusModalMode === "edit" ? "Edit status" : "New status"}
  onClose={closeStatusModal}
>
  <form id="status-form" class="flex flex-col gap-4" onsubmit={upsertStatus}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Heading size={14} class="text-slate-400" />
        Status
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="blocked"
        bind:value={statusForm.status}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Palette size={14} class="text-slate-400" />
        Color
      </div>
      <input
        type="color"
        class="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
        bind:value={statusForm.color}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <ListOrdered size={14} class="text-slate-400" />
        Order
      </div>
      <input
        type="number"
        min="1"
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={statusForm.order}
      />
    </label>
    <Switch bind:checked={statusForm.show} label="Show on board" />
  </form>
  <div class="flex items-center justify-end gap-2" slot="footer">
    <button
      type="button"
      class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      onclick={closeStatusModal}
    >
      Cancel
    </button>
    <button
      type="submit"
      form="status-form"
      class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
    >
      <Plus size={16} />
      Save status
    </button>
  </div>
</Modal>

<Modal
  open={sprintModalOpen}
  title={sprintModalMode === "edit" ? "Edit sprint" : "New sprint"}
  onClose={closeSprintModal}
>
  <form id="sprint-form" class="flex flex-col gap-4" onsubmit={upsertSprint}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Heading size={14} class="text-slate-400" />
        Sprint name
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Sprint 12"
        bind:value={sprintForm.name}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Target size={14} class="text-slate-400" />
        Goal
      </div>
      <textarea
        class="mt-2 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Ship onboarding flow"
        bind:value={sprintForm.goal}
      ></textarea>
    </label>
    <div class="grid gap-4 md:grid-cols-2">
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <div class="flex items-center gap-2 mb-1">
          <Calendar size={14} class="text-slate-400" />
          Start date
        </div>
        <input
          type="date"
          class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          bind:value={sprintForm.start}
        />
      </label>
      <label
        class="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <div class="flex items-center gap-2 mb-1">
          <Calendar size={14} class="text-slate-400" />
          End date
        </div>
        <input
          type="date"
          class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          bind:value={sprintForm.end}
        />
      </label>
    </div>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="flex items-center gap-2 mb-1">
        <Activity size={14} class="text-slate-400" />
        Status
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={sprintForm.status}
      >
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
      </select>
    </label>
  </form>
  <div class="flex items-center justify-end gap-2" slot="footer">
    <button
      type="button"
      class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      onclick={closeSprintModal}
    >
      Cancel
    </button>
    <button
      type="submit"
      form="sprint-form"
      class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
    >
      <Plus size={16} />
      Save sprint
    </button>
  </div>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
  open={confirmDeleteModalOpen}
  title="Confirm Delete"
  size="sm"
  onClose={closeConfirmDeleteModal}
>
  {#if taskToDelete}
    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        Are you sure you want to delete the task
        <strong class="text-slate-900">"{taskToDelete.title}"</strong>?
      </p>
      <p class="text-sm text-slate-500">This action cannot be undone.</p>
    </div>
  {/if}

  <div slot="footer" class="flex gap-3">
    <button
      type="button"
      class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      onclick={closeConfirmDeleteModal}
    >
      Cancel
    </button>
    <button
      type="button"
      class="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
      onclick={confirmDeleteTask}
    >
      Delete Task
    </button>
  </div>
</Modal>

<style>
  /* Draggable cursor states */
  :global([data-dnd-action-draggable-wrapper]) {
    cursor: grab;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global([data-dnd-action-draggable-wrapper]:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  :global([data-dnd-action-draggable-wrapper]:active) {
    cursor: grabbing;
  }

  /* Placeholder/hint for where item will land */
  :global([data-is-dnd-shadow-item-hint]) {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 2px dashed rgba(59, 130, 246, 0.4) !important;
    border-radius: 12px !important;
    opacity: 1;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  :global([data-is-dnd-shadow-item-hint]::before) {
    content: "Drop here";
    position: absolute;
    font-size: 11px;
    font-weight: 600;
    color: rgba(59, 130, 246, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    pointer-events: none;
  }

  /* The original item being dragged */
  :global([data-is-dnd-shadow-item]) {
    opacity: 0.4;
    transform: scale(0.95);
    filter: grayscale(0.3);
    transition: all 0.2s ease;
  }

  /* Active drop zone highlighting */
  :global([data-dnd-zone].dnd-active) {
    background: rgba(59, 130, 246, 0.02);
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.15);
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  /* Smooth scrolling for status columns */
  :global(.status-dnd[data-dnd-zone]) {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable both-edges;
    scroll-behavior: smooth;
  }

  /* Item being actively dragged (flying element) */
  :global(.dnd-action-dragged-el) {
    opacity: 0.95 !important;
    transform: rotate(3deg) scale(1.05) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), 0 10px 20px rgba(0, 0, 0, 0.15) !important;
    border: 2px solid rgba(59, 130, 246, 0.3) !important;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    z-index: 9999 !important;
    cursor: grabbing !important;
  }

  /* Pulse animation for drop zones when dragging */
  @keyframes pulse-drop-zone {
    0%, 100% {
      box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.15);
    }
    50% {
      box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3);
    }
  }

  :global([data-dnd-zone]:has([data-is-dnd-shadow-item-hint])) {
    animation: pulse-drop-zone 2s ease-in-out infinite;
  }
</style>
