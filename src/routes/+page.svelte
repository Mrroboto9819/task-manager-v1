<script>
  import { onMount } from "svelte";
  import { Plus, Pencil, Trash2, UserPlus, Layers3, KanbanSquare, Clipboard } from "lucide-svelte";
  import Modal from "../lib/Modal.svelte";

  const STORAGE_KEYS = {
    tasks: "task-manager-v1:tasks",
    users: "task-manager-v1:users",
    statuses: "task-manager-v1:statuses",
  };

  const DEFAULT_STATUS_COLORS = ["#0f172a", "#0ea5e9", "#22c55e", "#f97316"];
  const DEFAULT_STATUSES = [
    {
      status: "TODO",
      color: DEFAULT_STATUS_COLORS[0],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      status: "PROGRESS",
      color: DEFAULT_STATUS_COLORS[1],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      status: "FINISHED",
      color: DEFAULT_STATUS_COLORS[2],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      status: "ARCHIVE",
      color: DEFAULT_STATUS_COLORS[3],
      show: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  ];

  let activeView = $state("tasks");
  let tasks = $state([]);
  let users = $state([]);
  let statuses = $state([]);

  let taskForm = $state({
    id: "",
    title: "",
    description: "",
    tags: "",
    asign: "",
    time: "",
    status: "todo",
  });

  let userForm = $state({
    id: "",
    name: "",
    lastname: "",
    rol: "",
  });

  let statusForm = $state({
    status: "",
    color: DEFAULT_STATUS_COLORS[0],
    show: true,
    order: 0,
  });

  let taskModalOpen = $state(false);
  let userModalOpen = $state(false);
  let statusModalOpen = $state(false);
  let taskModalMode = $state("create");
  let userModalMode = $state("create");
  let statusModalMode = $state("create");
  let filterStatus = $state("all");
  let filterTag = $state("");
  let filterFrom = $state("");
  let filterTo = $state("");

  const newId = () => crypto.randomUUID();

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

  function setDragPayload(event, payload) {
    if (!event?.dataTransfer) return;
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  }

  function getDragPayload(event) {
    const dt = event?.dataTransfer;
    if (!dt) return null;

    const raw = dt.getData("text/plain");

    if (!raw) return null;

    try { return JSON.parse(raw); } catch { return null; }
  }

  function saveCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function normalizeStatuses(items) {
    const now = new Date().toISOString();
    return items.map((item, index) => {
      const existingOrder = Number.isFinite(item.order) ? item.order : null;
      return {
        status: item.status,
        color: item.color || DEFAULT_STATUS_COLORS[index % DEFAULT_STATUS_COLORS.length],
        show: item.show ?? true,
        order: existingOrder ?? index + 1,
        created: item.created || now,
        updated: item.updated || now,
      };
    });
  }

  function hydrate() {
    tasks = loadCollection(STORAGE_KEYS.tasks, []);
    users = loadCollection(STORAGE_KEYS.users, []);
    statuses = normalizeStatuses(loadCollection(STORAGE_KEYS.statuses, DEFAULT_STATUSES));
  }

  function saveTasks() {
    saveCollection(STORAGE_KEYS.tasks, tasks);
  }

  function saveUsers() {
    saveCollection(STORAGE_KEYS.users, users);
  }

  function saveStatuses() {
    saveCollection(STORAGE_KEYS.statuses, statuses);
  }

  function openTaskModal(mode, task = null) {
    taskModalMode = mode;
    if (task) {
      taskForm = {
        id: task.id,
        title: task.title,
        description: task.description,
        tags: task.tags.join(", "),
        asign: task.asign || "",
        time: task.time || "",
        status: task.status,
      };
    } else {
      taskForm = {
        id: "",
        title: "",
        description: "",
        tags: "",
        asign: "",
        time: "",
        status: statuses[0]?.status || "todo",
      };
    }
    taskModalOpen = true;
  }

  function closeTaskModal() {
    taskModalOpen = false;
  }

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
      created: taskForm.id ? tasks.find((task) => task.id === taskForm.id)?.created : now,
      updated: now,
      time: taskForm.time.trim(),
      status: taskForm.status,
    };

    if (!payload.title) return;

    if (taskForm.id) {
      tasks = tasks.map((task) => (task.id === taskForm.id ? payload : task));
    } else {
      tasks = [payload, ...tasks];
    }
    saveTasks();
    closeTaskModal();
  }

  function removeTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
  }

  function openUserModal(mode, user = null) {
    userModalMode = mode;
    if (user) {
      userForm = { id: user.id, name: user.name, lastname: user.lastname, rol: user.rol };
    } else {
      userForm = { id: "", name: "", lastname: "", rol: "" };
    }
    userModalOpen = true;
  }

  function closeUserModal() {
    userModalOpen = false;
  }

  function upsertUser(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const payload = {
      id: userForm.id || newId(),
      name: userForm.name.trim(),
      lastname: userForm.lastname.trim(),
      rol: userForm.rol.trim(),
      created: userForm.id ? users.find((user) => user.id === userForm.id)?.created : now,
      updated: now,
    };

    if (!payload.name) return;

    if (userForm.id) {
      users = users.map((user) => (user.id === userForm.id ? payload : user));
    } else {
      users = [payload, ...users];
    }
    saveUsers();
    closeUserModal();
  }

  function removeUser(id) {
    users = users.filter((user) => user.id !== id);
    saveUsers();
  }

  function openStatusModal(mode, status = null) {
    statusModalMode = mode;
    statusForm = {
      status: status?.status || "",
      original: status?.status || "",
      color: status?.color || DEFAULT_STATUS_COLORS[0],
      show: status?.show ?? true,
      order: Number.isFinite(status?.order) ? status.order : statuses.length + 1,
    };
    statusModalOpen = true;
  }

  function closeStatusModal() {
    statusModalOpen = false;
  }

  function upsertStatus(event) {
    event.preventDefault();
    const now = new Date().toISOString();
    const value = statusForm.status.trim();
    if (!value) return;

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
          : item
      );
      tasks = tasks.map((task) =>
        task.status === statusForm.original ? { ...task, status: value, updated: now } : task
      );
      saveTasks();
    } else {
      statuses = [
        {
          status: value,
          color: statusForm.color,
          show: statusForm.show,
          order: Number(statusForm.order) || statuses.length + 1,
          created: now,
          updated: now,
        },
        ...statuses,
      ];
    }
    saveStatuses();
    closeStatusModal();
  }

  function removeStatus(status) {
    statuses = statuses.filter((item) => item.status !== status);
    tasks = tasks.map((task) =>
      task.status === status ? { ...task, status: statuses[0]?.status || "todo" } : task
    );
    saveTasks();
    saveStatuses();
  }

  function startDrag(event, id) {
    draggedId = id;
    setDragPayload(event, { kind: "task", id });
  }

  let draggedId = $state(null);
  let draggedStatus = $state(null);

  function dropOn(event, status) {
    event?.preventDefault?.();

    const payload = getDragPayload(event);

    // --- REORDER COLUMNS ---
    if (payload?.kind === "status" || draggedStatus) {
      reorderStatus(payload?.status || draggedStatus, status);
      draggedStatus = null;
      return;
    }

    // --- MOVE TASK TO STATUS ---
    if (payload?.kind === "task" || draggedId) {
      const id = payload?.id || draggedId;
      if (!id) return;

      tasks = tasks.map((task) =>
        task.id === id
          ? { ...task, status, updated: new Date().toISOString() }
          : task
      );

      draggedId = null;
      saveTasks();
    }
  }

  function startStatusDrag(event, status) {
    draggedStatus = status;
    setDragPayload(event, { kind: "status", status });
  }

  function reorderStatus(fromStatus, toStatus) {
    if (!fromStatus || !toStatus || fromStatus === toStatus) return;
    const fromIndex = statuses.findIndex((item) => item.status === fromStatus);
    const toIndex = statuses.findIndex((item) => item.status === toStatus);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...statuses];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    statuses = next;
    draggedStatus = null;
    saveStatuses();
  }

  const assignedUsers = () =>
    users.map((user) => `${user.name} ${user.lastname}`.trim()).filter(Boolean);

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
    const created = new Date(task.created || task.updated || Date.now()).getTime();
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
    tasks.filter((task) => matchesStatus(task) && matchesTag(task) && matchesDate(task));

  const tasksForStatus = (status) =>
    filteredTasks().filter((task) => task.status === status);

  function copyTagsSummary() {
    const lines = [];
    const sortedStatuses = statuses.slice().sort((a, b) => a.order - b.order);
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
  }

  onMount(() => {
    hydrate();
  });
</script>

<main class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10">
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Task Manager</p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
          Build your day, drag and drop.
        </h1>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        {#each ["tasks", "users", "statuses"] as view}
          <button
            type="button"
            class={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              activeView === view
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            onclick={() => (activeView = view)}
          >
            {#if view === "tasks"}
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

    {#if activeView === "tasks"}
      <section class="flex flex-col gap-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Tasks</h2>
              <p class="text-sm text-slate-500">Store tasks locally with UUIDs.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
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
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
              <select
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterStatus}
              >
                <option value="all">All</option>
                {#each statuses.slice().sort((a, b) => a.order - b.order) as statusItem}
                  <option value={statusItem.status}>{statusItem.status}</option>
                {/each}
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tag
              <input
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="design"
                bind:value={filterTag}
              />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              From
              <input
                type="date"
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterFrom}
              />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              To
              <input
                type="date"
                class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                bind:value={filterTo}
              />
            </label>
          </div>
          <div class="mt-6 grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wide text-slate-400">Total tasks</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{tasks.length}</p>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wide text-slate-400">Filtered tasks</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{filteredTasks().length}</p>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wide text-slate-400">Total users</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{users.length}</p>
            </div>
          </div>
        </div>

        <section class="flex gap-4 overflow-x-auto pb-2">
          {#each statuses
            .filter((item) => item.show !== false)
            .slice()
            .sort((a, b) => a.order - b.order) as statusItem}
            <div
              class="flex min-h-[420px] w-[320px] flex-none flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              role="list"
              ondragover={(event) => {
                event.preventDefault();
                if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
              }}
              ondrop={(event) => dropOn(event, statusItem.status)}
            >
              <div class="flex items-center justify-between">
                <div
                  class="cursor-grab"
                  draggable="true"
                  ondragstart={(event) => startStatusDrag(event, statusItem.status)}
                  ondragend={() => (draggedStatus = null)}
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 rounded-full"
                      style={`background-color: ${statusItem.color}`}
                    ></span>
                    <h3 class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {statusItem.status}
                    </h3>
                  </div>
                  <p class="text-[11px] text-slate-400">Updated {statusItem.updated.slice(0, 10)}</p>
                </div>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                  {tasksForStatus(statusItem.status).length}
                </span>
              </div>
              <div class="mt-4 flex flex-1 flex-col gap-3">
                {#each tasksForStatus(statusItem.status) as task}
                  <article
                    class="group cursor-grab rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm transition hover:border-slate-300"
                    draggable="true"
                    ondragstart={(event) => startDrag(event, task.id)}
                    ondragend={() => (draggedId = null)}
                  >
                    <div class="flex flex-col gap-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex-1">
                          <h4 class="text-sm font-semibold text-slate-900">{task.title}</h4>
                          {#if task.description}
                            <p class="mt-1 text-xs text-slate-600">{task.description}</p>
                          {/if}
                        </div>
                        <div class="flex gap-2 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                          onclick={() => openTaskModal("edit", task)}
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          class="flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-500 transition hover:border-rose-300"
                          onclick={() => removeTask(task.id)}
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                      <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span class="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500">
                          {task.asign || "Unassigned"}
                        </span>
                        {#if (task.tags || []).length}
                          <div class="flex flex-wrap gap-2">
                            {#each task.tags as tag}
                              <span class="rounded-full bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                                {tag}
                              </span>
                            {/each}
                          </div>
                        {:else}
                          <span class="text-[10px] uppercase tracking-wide text-slate-400">
                            No tags
                          </span>
                        {/if}
                        <span class="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                          ID {task.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </article>
                {:else}
                  <div class="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200">
                    <span class="text-xs uppercase tracking-[0.3em] text-slate-300">
                      Drop tasks here
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </section>
      </section>
    {/if}

    {#if activeView === "users"}
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
            <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">
                    {user.name} {user.lastname}
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
              <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Created {user.created.slice(0, 10)}</span>
                <span>ID: {user.id.slice(0, 8)}</span>
              </div>
            </div>
          {:else}
            <div class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Add users so tasks can be assigned.
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if activeView === "statuses"}
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          {#each statuses.slice().sort((a, b) => a.order - b.order) as statusItem}
            <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 rounded-full"
                      style={`background-color: ${statusItem.color}`}
                    ></span>
                    <h3 class="font-semibold text-slate-900">{statusItem.status}</h3>
                  </div>
                  <p class="text-xs text-slate-500">Updated {statusItem.updated.slice(0, 10)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
                    onclick={() => {
                      statuses = statuses.map((item) =>
                        item.status === statusItem.status
                          ? { ...item, show: !item.show, updated: new Date().toISOString() }
                          : item
                      );
                      saveStatuses();
                    }}
                  >
                    {statusItem.show ? "Hide" : "Show"}
                  </button>
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
            <div class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Add statuses to build your workflow.
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
  onClose={closeTaskModal}
>
  <form id="task-form" class="flex flex-col gap-4" onsubmit={upsertTask}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Title
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Ship drag and drop MVP"
        bind:value={taskForm.title}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Description
      <textarea
        class="mt-2 min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="What needs to be done."
        bind:value={taskForm.description}
      ></textarea>
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Tags (comma separated)
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="design, urgent"
        bind:value={taskForm.tags}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Assign
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
      Status
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
      Time
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="2h"
        bind:value={taskForm.time}
      />
    </label>
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

<Modal open={userModalOpen} title={userModalMode === "edit" ? "Edit user" : "New user"} onClose={closeUserModal}>
  <form id="user-form" class="flex flex-col gap-4" onsubmit={upsertUser}>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Name
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Alex"
        bind:value={userForm.name}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Lastname
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Morgan"
        bind:value={userForm.lastname}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Role
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
      Status
      <input
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="blocked"
        bind:value={statusForm.status}
        required
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Color
      <input
        type="color"
        class="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
        bind:value={statusForm.color}
      />
    </label>
    <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      Order
      <input
        type="number"
        min="1"
        class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        bind:value={statusForm.order}
      />
    </label>
    <label class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-slate-300 text-slate-900"
        bind:checked={statusForm.show}
      />
      Show on board
    </label>
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
