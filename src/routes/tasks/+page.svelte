<script>
  import { onMount } from "svelte";
  import {
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    Move,
    CheckCircle,
    Clipboard,
    Tag,
    Clock,
    Hash,
    AlertCircle,
    AlertTriangle,
    Eye,
  } from "lucide-svelte";
  import { taskStore, userStore, statusStore, settingsStore } from "../../lib/stores/index.js";
  import TaskModal from "../../lib/components/TaskModal.svelte";
  import TaskDetailModal from "../../lib/components/TaskDetailModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { marked } from "marked";
  import { toastStore } from "../../lib/toastStore.svelte.js";

  let allTasks = $derived(taskStore.tasks);
  let users = $derived(userStore.users);
  let visibleStatuses = $derived(statusStore.visible);
  let settings = $derived(settingsStore.settings);

  const flipDurationMs = 200;

  // Modal state
  let taskModalOpen = $state(false);
  let taskModalMode = $state("create");
  let selectedTask = $state(null);

  // Detail modal state
  let detailModalOpen = $state(false);
  let detailTask = $state(null);

  // Confirm modal state
  let confirmModalOpen = $state(false);
  let taskToDelete = $state(null);

  // Filter state
  let filterStatus = $state("all");
  let filterTag = $state("");
  let filterFrom = $state("");
  let filterTo = $state("");

  // DnD state - temporary items during drag
  let taskDndItems = $state({});

  // Format date helper
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Priority colors
  const priorityColors = {
    critical: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-500" },
    high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500" },
    medium: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500" },
    low: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500" },
  };

  function getPriorityColor(priority) {
    return priorityColors[priority] || priorityColors.medium;
  }

  // Filter functions
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

  // Get filtered tasks
  let filteredTasks = $derived(
    allTasks.filter((task) => matchesStatus(task) && matchesTag(task) && matchesDate(task))
  );

  // Get tasks for status
  function getTasksForStatus(status) {
    return filteredTasks.filter((task) => task.status === status);
  }

  // Get tasks for status with DnD support
  function getTasksForStatusDnd(status) {
    return taskDndItems[status] || getTasksForStatus(status);
  }

  // Task modal functions
  function openTaskModal() {
    taskDndItems = {}; // Clear DnD state
    taskModalMode = "create";
    selectedTask = null;
    taskModalOpen = true;
  }

  function editTask(task) {
    taskDndItems = {}; // Clear DnD state
    taskModalMode = "edit";
    selectedTask = task;
    taskModalOpen = true;
  }

  function viewTaskDetail(task) {
    taskDndItems = {}; // Clear DnD state
    detailTask = task;
    detailModalOpen = true;
  }

  function removeTask(task) {
    taskDndItems = {}; // Clear DnD state
    taskToDelete = task;
    confirmModalOpen = true;
  }

  function confirmDelete() {
    if (taskToDelete) {
      taskStore.delete(taskToDelete.id);
      taskToDelete = null;
    }
  }

  // Clear filters
  function clearFilters() {
    filterStatus = "all";
    filterTag = "";
    filterFrom = "";
    filterTo = "";
    toastStore.info("Filters cleared");
  }

  // Copy summary
  function copyTagsSummary() {
    const lines = [];
    visibleStatuses.forEach((statusItem) => {
      const list = getTasksForStatus(statusItem.status);
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
      toastStore.success("Summary copied to clipboard");
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
    toastStore.success("Summary copied to clipboard");
  }

  // Drag and drop handlers
  function handleTaskDndConsider(status, e) {
    const { items: newItems } = e.detail;
    taskDndItems = { ...taskDndItems, [status]: newItems };
  }

  function handleTaskDndFinalize(status, e) {
    const { items: newItems } = e.detail;
    const cleanItems = newItems.filter((item) => !item.isDndShadowItem);

    // Update each task with new status
    cleanItems.forEach((item) => {
      if (item.status !== status) {
        taskStore.updateStatus(item.id, status);
      }
    });

    // Clear temporary DnD state
    taskDndItems = {};
  }

  onMount(() => {
    // Component mounted
  });
</script>

<main class="min-h-screen px-6 pt-6 pb-10">
  <!-- Header with Title & Description -->
  <header class="mb-6">
    <h1 class="text-3xl font-bold text-foreground">All Tasks</h1>
    <p class="text-muted-foreground mt-1">View and manage all tasks with drag-and-drop</p>
  </header>

  <div class="space-y-6">
    <!-- Filters & Stats Card -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 class="text-lg font-semibold text-foreground">Filters & Stats</h2>
          <p class="text-sm text-muted-foreground">Filter tasks and view statistics</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={clearFilters}
          >
            Clear filters
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            onclick={copyTagsSummary}
          >
            <Clipboard size={14} />
            Copy summary
          </button>
          <button
            type="button"
            class="btn btn-primary shadow-sm"
            onclick={openTaskModal}
          >
            <Plus size={16} />
            New task
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid gap-3 md:grid-cols-4 mb-6">
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status
          <select
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            bind:value={filterStatus}
          >
            <option value="all">All</option>
            {#each visibleStatuses as statusItem}
              <option value={statusItem.status}>{statusItem.status}</option>
            {/each}
          </select>
        </label>
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tag
          <input
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="design"
            bind:value={filterTag}
          />
        </label>
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          From
          <input
            type="date"
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            bind:value={filterFrom}
          />
        </label>
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          To
          <input
            type="date"
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            bind:value={filterTo}
          />
        </label>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            Total tasks
          </p>
          <p class="mt-2 text-2xl font-bold text-foreground">
            {allTasks.length}
          </p>
        </div>
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            Filtered tasks
          </p>
          <p class="mt-2 text-2xl font-bold text-foreground">
            {filteredTasks.length}
          </p>
        </div>
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            Total users
          </p>
          <p class="mt-2 text-2xl font-bold text-foreground">
            {users.length}
          </p>
        </div>
      </div>
    </div>

    <!-- No results warning -->
    {#if allTasks.length > 0 && filteredTasks.length === 0}
      <div class="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-primary">
        No tasks match your filters. Try clearing the filters or adjusting the date range.
      </div>
    {/if}

    <!-- Kanban Board -->
    <div class="w-full overflow-x-auto pb-2 scroll-smooth">
      <div class="flex gap-4 min-w-max pb-4">
        {#each visibleStatuses as statusItem (statusItem.id)}
          <div
            class="flex w-[320px] flex-none flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all"
            style="min-height: calc(100vh - 400px);"
            role="list"
          >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span
                    class="h-2.5 w-2.5 rounded-full"
                    style={`background-color: ${statusItem.color}`}
                  ></span>
                  <h3 class="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    {statusItem.status}
                  </h3>
                </div>
                <div class="flex items-center gap-3">
                  <p class="text-[11px] text-muted-foreground">
                    Updated {statusItem.updated.slice(0, 10)}
                  </p>
                  <span class="rounded-full bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {getTasksForStatus(statusItem.status).length}
                  </span>
                </div>
              </div>

              <div
                class="flex flex-1 flex-col gap-6"
                use:dndzone={{
                  items: getTasksForStatusDnd(statusItem.status),
                  flipDurationMs,
                  type: "task",
                }}
                onconsider={(e) => handleTaskDndConsider(statusItem.status, e)}
                onfinalize={(e) => handleTaskDndFinalize(statusItem.status, e)}
              >
                {#each getTasksForStatusDnd(statusItem.status) as task (task.id)}
                  {@const priorityColor = getPriorityColor(task.priority || "medium")}
                  <article
                    animate:flip={{ duration: flipDurationMs }}
                    class={`group relative flex flex-col rounded-[20px] bg-background border p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] cursor-grab ${
                      task.blocked
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <!-- Drag handle -->
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity duration-200">
                      <GripVertical size={16} class="text-muted-foreground" />
                    </div>

                    <!-- Title with click to view details -->
                    <button
                      type="button"
                      class="text-left w-full mb-3"
                      onclick={() => viewTaskDetail(task)}
                    >
                      <h4 class="text-base font-bold text-foreground leading-tight break-words pr-6">
                        {task.title}
                      </h4>
                    </button>

                    <!-- Badges: Priority, Points, Time, Blocked -->
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                      <span class={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityColor.bg} ${priorityColor.border} ${priorityColor.text}`}>
                        <AlertCircle size={10} />
                        {task.priority || "medium"}
                      </span>

                      {#if task.points}
                        <span class="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Hash size={10} />
                          {task.points}
                        </span>
                      {/if}

                      {#if task.time}
                        <span class="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          <Clock size={10} />
                          {task.time}
                        </span>
                      {/if}

                      {#if task.blocked}
                        <span class="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
                          <AlertTriangle size={10} />
                          Blocked
                        </span>
                      {/if}
                    </div>

                    <!-- Description (markdown preview, truncated) -->
                    {#if task.description}
                      <button
                        type="button"
                        class="mb-3 text-xs text-muted-foreground text-left w-full prose prose-xs dark:prose-invert max-w-none overflow-hidden relative"
                        style="max-height: 3.6em; -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); mask-image: linear-gradient(to bottom, black 50%, transparent 100%);"
                        onclick={() => viewTaskDetail(task)}
                      >
                        {@html marked(task.description)}
                      </button>
                    {/if}

                    <!-- Tags -->
                    {#if task.tags && task.tags.length > 0}
                      <div class="flex flex-wrap gap-1.5 mb-3">
                        {#each task.tags.slice(0, 3) as tag}
                          <span class="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[9px] font-medium text-foreground">
                            <Tag size={8} />
                            {tag}
                          </span>
                        {/each}
                        {#if task.tags.length > 3}
                          <span class="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                            +{task.tags.length - 3}
                          </span>
                        {/if}
                      </div>
                    {/if}

                    <!-- Divider -->
                    <div class="my-3 border-t border-border"></div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between gap-2">
                      <!-- Left: Assigned user -->
                      <div class="flex items-center gap-2 min-w-0">
                        {#if task.asign}
                          <div
                            class="h-6 w-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary uppercase flex-shrink-0"
                            title={task.asign}
                          >
                            {task.asign[0]}
                          </div>
                          <span class="text-[10px] text-muted-foreground truncate">
                            {task.asign}
                          </span>
                        {:else}
                          <span class="text-[10px] text-muted-foreground italic">
                            Unassigned
                          </span>
                        {/if}
                      </div>

                      <!-- Right: Action Buttons -->
                      <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          class="btn btn-ghost px-2 py-1 text-[10px]"
                          onclick={(e) => {
                            e.stopPropagation();
                            viewTaskDetail(task);
                          }}
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost px-2 py-1 text-[10px]"
                          onclick={(e) => {
                            e.stopPropagation();
                            editTask(task);
                          }}
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500 hover:text-white"
                          onclick={(e) => {
                            e.stopPropagation();
                            removeTask(task);
                          }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </article>
                {:else}
                  <div class="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/30 transition-all duration-300 hover:border-primary hover:bg-primary/5">
                    <span class="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                      <Move size={14} class="opacity-50" />
                      Drop tasks here
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
  </div>
</main>

<!-- Task Modal -->
<TaskModal
  bind:open={taskModalOpen}
  mode={taskModalMode}
  task={selectedTask}
/>

<!-- Task Detail Modal -->
<TaskDetailModal
  bind:open={detailModalOpen}
  task={detailTask}
  onEdit={editTask}
  onDelete={removeTask}
/>

<!-- Confirm Delete Modal -->
<ConfirmModal
  bind:open={confirmModalOpen}
  title="Delete Task"
  message={taskToDelete ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.` : "Are you sure you want to delete this task?"}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onConfirm={confirmDelete}
/>
