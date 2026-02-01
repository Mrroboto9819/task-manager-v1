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
    ListTodo,
  } from "lucide-svelte";
  import { taskStore, userStore, statusStore, settingsStore, sprintStore } from "../../lib/stores/index.js";
  import TaskModal from "../../lib/components/TaskModal.svelte";
  import TaskDetailModal from "../../lib/components/TaskDetailModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";
  import TaskTimer from "../../lib/components/TaskTimer.svelte";
  import Select from "../../lib/Select.svelte";
  import DatePicker from "../../lib/components/DatePicker.svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { marked } from "marked";
  import { toastStore } from "../../lib/toastStore.svelte.js";
  import { _ } from "$lib/i18n";
  import { formatBoardSummaryForClipboard, copyToClipboard } from "../../lib/utils/clipboard.js";

  let allTasks = $derived(taskStore.tasks);
  let users = $derived(userStore.users);
  let visibleStatuses = $derived(statusStore.visible);
  let settings = $derived(settingsStore.settings);
  let methodology = $derived(settingsStore.settings.methodology || "agile");

  // Status filter options for Select component
  let statusFilterOptions = $derived([
    { value: "all", label: $_("common.all") },
    ...visibleStatuses.map((s) => ({ value: s.status, label: s.status })),
  ]);

  // Sprint filter options for Select component
  let sprints = $derived(sprintStore.sprints);
  let sprintFilterOptions = $derived([
    { value: "all", label: $_("common.all") },
    { value: "backlog", label: $_("tasks.backlog") },
    ...sprints.map((s) => ({ value: s.id, label: s.name || `Sprint ${s.id.slice(0, 4)}` })),
  ]);

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
  let filterSprint = $state("all");
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

  function matchesSprint(task) {
    if (filterSprint === "all") return true;
    if (filterSprint === "backlog") return !task.sprintId;
    return task.sprintId === filterSprint;
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
    allTasks.filter((task) => matchesStatus(task) && matchesSprint(task) && matchesTag(task) && matchesDate(task))
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
    filterSprint = "all";
    filterTag = "";
    filterFrom = "";
    filterTo = "";
    toastStore.info($_("tasks.filtersCleared"));
  }

  // Copy summary
  async function copyTagsSummary() {
    const sprints = sprintStore.sprints;
    const text = formatBoardSummaryForClipboard(filteredTasks, visibleStatuses, { sprints });
    const success = await copyToClipboard(text);
    if (success) {
      toastStore.success($_("tasks.summaryCopied"));
    }
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
    <div class="flex items-center gap-3">
      <div class="rounded-xl bg-primary/10 border border-primary/30 p-2.5">
        <Clipboard size={24} class="text-primary" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-foreground">{$_("tasks.title")}</h1>
        <p class="text-muted-foreground mt-1">{$_("tasks.description")}</p>
      </div>
    </div>
  </header>

  <div class="space-y-6">
    <!-- Filters & Stats Card -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 class="text-lg font-semibold text-foreground">{$_("tasks.filtersStats")}</h2>
          <p class="text-sm text-muted-foreground">{$_("tasks.filtersDescription")}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={clearFilters}
          >
            {$_("tasks.clearFilters")}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            onclick={copyTagsSummary}
          >
            <Clipboard size={14} />
            {$_("tasks.copySummary")}
          </button>
          <button
            type="button"
            class="btn btn-primary shadow-sm"
            onclick={openTaskModal}
          >
            <Plus size={16} />
            {$_("tasks.newTask")}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid gap-3 mb-6 {methodology === 'agile' ? 'md:grid-cols-5' : 'md:grid-cols-4'}">
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {$_("tasks.filterStatus")}
          <div class="mt-2">
            <Select
              bind:value={filterStatus}
              options={statusFilterOptions}
              placeholder={$_("tasks.selectStatus")}
            />
          </div>
        </label>
        {#if methodology === "agile"}
          <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {$_("tasks.filterSprint")}
            <div class="mt-2">
              <Select
                bind:value={filterSprint}
                options={sprintFilterOptions}
                placeholder={$_("tasks.selectSprint")}
              />
            </div>
          </label>
        {/if}
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {$_("tasks.filterTag")}
          <input
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="design"
            bind:value={filterTag}
          />
        </label>
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {$_("tasks.filterFrom")}
          <div class="mt-2">
            <DatePicker
              bind:value={filterFrom}
              placeholder={$_("tasks.startDate")}
            />
          </div>
        </label>
        <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {$_("tasks.filterTo")}
          <div class="mt-2">
            <DatePicker
              bind:value={filterTo}
              placeholder={$_("tasks.endDate")}
            />
          </div>
        </label>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            {$_("tasks.totalTasks")}
          </p>
          <p class="mt-2 text-2xl font-bold text-foreground">
            {allTasks.length}
          </p>
        </div>
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            {$_("tasks.filteredTasks")}
          </p>
          <p class="mt-2 text-2xl font-bold text-foreground">
            {filteredTasks.length}
          </p>
        </div>
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            {$_("tasks.totalUsers")}
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
        {$_("tasks.noMatchFilters")}
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
                    {$_("tasks.updated")} {statusItem.updated.slice(0, 10)}
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
                        {$_(`tasks.priority.${task.priority || "medium"}`)}
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
                          {$_("tasks.blocked")}
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

                    <!-- Subtasks Progress -->
                    {#if task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0}
                      {@const completedSubtasks = task.subtasks.filter(st => st.completed).length}
                      {@const totalSubtasks = task.subtasks.length}
                      <div class="mb-3">
                        <div class="flex items-center gap-2 mb-1">
                          <ListTodo size={10} class="text-muted-foreground" />
                          <span class="text-[10px] font-medium text-muted-foreground">
                            {completedSubtasks}/{totalSubtasks} {$_("tasks.subtasks")}
                          </span>
                        </div>
                        <div class="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            class="h-full bg-primary transition-all duration-300"
                            style={`width: ${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`}
                          ></div>
                        </div>
                      </div>
                    {/if}

                    <!-- Timer -->
                    <div class="mb-3">
                      <TaskTimer
                        taskId={task.id}
                        elapsedSeconds={task.elapsedSeconds || 0}
                        isRunning={task.timerRunning || false}
                        onStart={(id) => taskStore.startTimer(id)}
                        onPause={(id, elapsed) => taskStore.pauseTimer(id, elapsed)}
                        onReset={(id) => taskStore.resetTimer(id)}
                        compact={true}
                      />
                    </div>

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
                            {$_("tasks.unassigned")}
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
                          title={$_("tasks.viewDetails")}
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
                          title={$_("common.edit")}
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
                          title={$_("common.delete")}
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
                      {$_("tasks.dropTasksHere")}
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
  title={$_("tasks.deleteTask")}
  message={taskToDelete ? $_("tasks.deleteTaskMessage", { values: { title: taskToDelete.title } }) : $_("confirmModal.defaultMessage")}
  confirmText={$_("common.delete")}
  cancelText={$_("common.cancel")}
  variant="danger"
  onConfirm={confirmDelete}
/>
