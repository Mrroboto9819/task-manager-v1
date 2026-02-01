<script lang="ts">
  import { onMount } from "svelte";
  import {
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    Move,
    ListTodo,
    KanbanSquare,
  } from "lucide-svelte";
  import {
    taskStore,
    sprintStore,
    statusStore,
    settingsStore,
  } from "../../lib/stores/index.js";
  import EmptyState from "../../lib/EmptyState.svelte";
  import SprintModal from "../../lib/components/SprintModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";
  import TaskTimer from "../../lib/components/TaskTimer.svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { marked } from "marked";
  import { _ } from "$lib/i18n";

  let activeSprint = $derived(
    sprintStore.sprints.find((s) => s.status === "active"),
  );
  let allSprints = $derived(sprintStore.sprints);
  let visibleStatuses = $derived(statusStore.visible);
  let settings = $derived(settingsStore.settings);

  let sprintScrollContainer = $state(null);
  const flipDurationMs = 200;

  // Modal state
  let sprintModalOpen = $state(false);
  let sprintModalMode = $state("create");
  let selectedSprint = $state(null);

  // Confirm modal state
  let confirmModalOpen = $state(false);
  let confirmModalType = $state("sprint"); // "sprint" or "task"
  let sprintToDelete = $state(null);
  let taskToDelete = $state(null);

  // Drag and drop state
  let taskDndItems = $state({});

  // Get sprint tasks and organize by status
  function getSprintTasks() {
    if (!activeSprint) return [];
    return taskStore.tasks.filter((t) => t.sprintId === activeSprint.id);
  }

  function getSprintTasksForStatus(status: string) {
    return getSprintTasks().filter((t) => t.status === status);
  }

  function getSprintTasksForStatusDnd(status: string) {
    return taskDndItems[status] || getSprintTasksForStatus(status);
  }

  function getTotalPoints(tasks: any[]) {
    return tasks.reduce((sum, task) => {
      const points = parseInt(task.points) || 0;
      return sum + points;
    }, 0);
  }

  // Sprint management
  function openSprintModal() {
    sprintModalMode = "create";
    selectedSprint = null;
    sprintModalOpen = true;
  }

  function editSprint(sprint: any) {
    sprintModalMode = "edit";
    selectedSprint = sprint;
    sprintModalOpen = true;
  }

  function activateSprint(id: string) {
    sprintStore.activate(id);
  }

  function completeSprint(id: string) {
    sprintStore.complete(id);
  }

  function removeSprint(sprint: any) {
    confirmModalType = "sprint";
    sprintToDelete = sprint;
    taskToDelete = null;
    confirmModalOpen = true;
  }

  function confirmDelete() {
    if (confirmModalType === "sprint" && sprintToDelete) {
      sprintStore.delete((sprintToDelete as any).id);
      sprintToDelete = null;
    } else if (confirmModalType === "task" && taskToDelete) {
      taskStore.delete((taskToDelete as any).id);
      taskToDelete = null;
    }
  }

  // Task management
  function openTaskModal() {
    // TODO: Implement task modal
    console.log("Open task modal");
  }

  function editTask(task: any) {
    // TODO: Implement edit task modal
    console.log("Edit task", task);
  }

  function removeTask(task: any) {
    confirmModalType = "task";
    taskToDelete = task;
    sprintToDelete = null;
    confirmModalOpen = true;
  }

  // Drag and drop handlers
  function handleTaskDndConsider(
    status: string,
    e: CustomEvent<DndEvent<any>>,
  ) {
    const { items: newItems } = e.detail;
    taskDndItems = { ...taskDndItems, [status]: newItems };
  }

  function handleTaskDndFinalize(
    status: string,
    e: CustomEvent<DndEvent<any>>,
  ) {
    const { items: newItems } = e.detail;

    // Filter out shadow items
    const cleanItems = newItems.filter((item) => !item.isDndShadowItem);

    // Update all tasks that changed status
    cleanItems.forEach((item) => {
      if (item.status !== status) {
        taskStore.updateStatus(item.id, status);
      }
    });

    // Clear temporary drag state
    taskDndItems = {};
  }

  // Scroll functions
  function scrollContainer(
    container: HTMLElement | null,
    direction: "left" | "right",
  ) {
    if (!container) return;
    const scrollAmount = 340;
    const targetScroll =
      container.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }

  onMount(() => {
    // Component mounted
  });
</script>

<main class="w-full px-6 pt-6 pb-10">
  <!-- Header with Title & Description -->
  <header class="mb-6">
    <div class="flex items-center gap-3">
      <div class="rounded-xl bg-primary/10 border border-primary/30 p-2.5">
        <KanbanSquare size={24} class="text-primary" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-foreground">{$_("sprint.title")}</h1>
        <p class="text-muted-foreground mt-1">
          {$_("sprint.description")}
        </p>
      </div>
    </div>
  </header>

  <div class="space-y-6">
    <!-- Active Sprint Card -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 class="text-lg font-semibold text-foreground">{$_("sprint.activeSprint")}</h2>
          <p class="text-sm text-muted-foreground">
            {$_("sprint.currentStatus")}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-primary shadow-sm"
          onclick={openSprintModal}
        >
          <Plus size={16} />
          {$_("sprint.newSprint")}
        </button>
      </div>

      {#if activeSprint}
        <div class="rounded-xl border border-border bg-background p-6">
          <div class="flex flex-col gap-5">
            <!-- Sprint Header -->
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                >
                  {$_("sprint.activeSprint")}
                </p>
                <h3 class="mt-2 text-2xl font-bold text-foreground">
                  {activeSprint.name}
                </h3>
                <p
                  class="mt-2 text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span>{activeSprint.start}</span>
                  <span>→</span>
                  <span>{activeSprint.end}</span>
                </p>
              </div>

              <!-- Stats Cards -->
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="rounded-xl border border-border bg-card px-5 py-3 shadow-sm"
                >
                  <p
                    class="text-[11px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprint.items")}
                  </p>
                  <p class="mt-1 text-xl font-bold text-foreground">
                    {getSprintTasks().length}
                  </p>
                </div>
                <div
                  class="rounded-xl border border-border bg-card px-5 py-3 shadow-sm"
                >
                  <p
                    class="text-[11px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprint.points")}
                  </p>
                  <p class="mt-1 text-xl font-bold text-foreground">
                    {getTotalPoints(getSprintTasks())}
                  </p>
                </div>
              </div>
            </div>

            <!-- Sprint Goal -->
            {#if activeSprint.goal && activeSprint.goal.trim()}
              <div class="rounded-lg border border-border bg-card/50 p-4">
                <div
                  class="prose prose-sm dark:prose-invert max-w-none text-foreground"
                >
                  {@html marked(activeSprint.goal)}
                </div>
              </div>
            {/if}

            <!-- Actions -->
            <div
              class="flex items-center justify-end pt-2 border-t border-border"
            >
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                onclick={() => completeSprint(activeSprint.id)}
              >
                {$_("sprint.closeSprint")}
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="rounded-xl border border-border bg-background">
          <EmptyState
            icon="calendar"
            title={$_("sprint.noActiveSprint")}
            description={$_("sprint.noActiveSprintDesc")}
            actionText={$_("sprint.createSprint")}
            onAction={openSprintModal}
          />
        </div>
      {/if}
    </div>

    <!-- All Sprints List -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-4">
        <h3 class="text-base font-semibold text-foreground">{$_("sprint.allSprints")}</h3>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        {#each allSprints as sprint}
          <div
            class="rounded-xl border border-border bg-background p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col gap-4">
              <!-- Sprint Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-bold text-foreground text-base">
                      {sprint.name}
                    </h4>
                    <span
                      class={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold ${
                        sprint.status === "active"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : sprint.status === "closed"
                            ? "border-border bg-muted text-muted-foreground"
                            : "border-primary/30 bg-primary/10 text-primary"
                      }`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  <p
                    class="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <span>{sprint.start}</span>
                    <span>→</span>
                    <span>{sprint.end}</span>
                  </p>
                </div>
              </div>

              <!-- Sprint Goal -->
              {#if sprint.goal && sprint.goal.trim()}
                <div class="rounded-lg border border-border bg-card/30 p-3">
                  <div
                    class="prose prose-xs dark:prose-invert max-w-none text-foreground line-clamp-3"
                  >
                    {@html marked(sprint.goal)}
                  </div>
                </div>
              {/if}

              <!-- Actions -->
              <div
                class="flex flex-wrap items-center gap-2 pt-2 border-t border-border"
              >
                {#if sprint.status !== "active"}
                  <button
                    type="button"
                    class="btn btn-primary px-3 py-1.5 text-xs flex-none"
                    onclick={() => activateSprint(sprint.id)}
                  >
                    {$_("sprint.start")}
                  </button>
                {/if}
                {#if sprint.status === "active"}
                  <button
                    type="button"
                    class="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex-none"
                    onclick={() => completeSprint(sprint.id)}
                  >
                    {$_("sprint.close")}
                  </button>
                {/if}
                <button
                  type="button"
                  class="btn btn-secondary px-3 py-1.5 text-xs flex-none"
                  onclick={() => editSprint(sprint)}
                >
                  <Pencil size={12} />
                  {$_("common.edit")}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex-none ml-auto"
                  onclick={() => removeSprint(sprint)}
                >
                  <Trash2 size={12} />
                  {$_("sprint.remove")}
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground col-span-2"
          >
            {$_("sprint.noSprintsYet")}
          </div>
        {/each}
      </div>
    </div>

    <!-- Kanban Board (only show if there's an active sprint) -->
    {#if activeSprint}
      <div class="flex items-stretch gap-3">
        {#if settings.showScrollButtons}
          <div class="flex flex-col justify-center">
            <button
              type="button"
              class="flex items-center justify-center rounded-full bg-card border border-border p-2 shadow-sm transition hover:bg-background hover:border-primary/50"
              onclick={() => scrollContainer(sprintScrollContainer, "left")}
              aria-label="Scroll left"
            >
              <ChevronLeft
                size={20}
                class="text-muted-foreground hover:text-primary"
              />
            </button>
          </div>
        {/if}

        <div
          bind:this={sprintScrollContainer}
          class={`flex-1 pb-2 scroll-smooth ${
            settings.showScrollButtons ? "overflow-x-hidden" : "overflow-x-auto"
          }`}
        >
          <section class="flex min-w-max gap-4 pb-4">
            {#each visibleStatuses as statusItem (statusItem.id)}
              <div
                class="flex w-[320px] flex-none flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all"
                style="min-height: calc(100vh - 450px);"
                role="list"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span
                        class="h-2.5 w-2.5 rounded-full"
                        style={`background-color: ${statusItem.color}`}
                      ></span>
                      <h3
                        class="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground"
                      >
                        {statusItem.status}
                      </h3>
                    </div>
                    <p class="text-[11px] text-muted-foreground mt-1">
                      {$_("sprint.updated")} {statusItem.updated.slice(0, 10)}
                    </p>
                  </div>
                  <span
                    class="rounded-full bg-background px-2 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {getSprintTasksForStatus(statusItem.status).length}
                  </span>
                </div>

                <div
                  class="flex flex-1 flex-col gap-3"
                  use:dndzone={{
                    items: getSprintTasksForStatusDnd(statusItem.status),
                    flipDurationMs,
                    type: "task",
                  }}
                  onconsider={(e) =>
                    handleTaskDndConsider(statusItem.status, e)}
                  onfinalize={(e) =>
                    handleTaskDndFinalize(statusItem.status, e)}
                >
                  {#each getSprintTasksForStatusDnd(statusItem.status) as task (task.id)}
                    <article
                      animate:flip={{ duration: flipDurationMs }}
                      class={`group cursor-grab rounded-xl border-2 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                        task.blocked
                          ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10"
                          : "border-border bg-background hover:border-primary hover:bg-card"
                      }`}
                    >
                      <div class="flex flex-col gap-3">
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex items-start gap-2 flex-1">
                            <div
                              class="mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity duration-200"
                            >
                              <GripVertical
                                size={14}
                                class="text-muted-foreground"
                              />
                            </div>
                            <div class="flex-1">
                              <h4 class="text-sm font-semibold text-foreground">
                                {task.title}
                              </h4>
                              {#if task.description}
                                <p
                                  class="mt-1 text-xs text-muted-foreground line-clamp-2"
                                >
                                  {task.description}
                                </p>
                              {/if}
                              {#if task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0}
                                {@const completedSubtasks = task.subtasks.filter(st => st.completed).length}
                                {@const totalSubtasks = task.subtasks.length}
                                <div class="mt-2">
                                  <div class="flex items-center gap-2 mb-1">
                                    <ListTodo size={10} class="text-muted-foreground" />
                                    <span class="text-[10px] font-medium text-muted-foreground">
                                      {completedSubtasks}/{totalSubtasks}
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
                            </div>
                          </div>
                          <div
                            class="flex gap-2 opacity-0 transition group-hover:opacity-100"
                          >
                            <button
                              type="button"
                              class="btn btn-secondary px-2 py-1 text-[10px]"
                              onclick={() => editTask(task)}
                            >
                              <Pencil size={12} />
                              {$_("common.edit")}
                            </button>
                            <button
                              type="button"
                              class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500/10"
                              onclick={() => removeTask(task)}
                            >
                              <Trash2 size={12} />
                              {$_("common.delete")}
                            </button>
                          </div>
                        </div>
                        <div
                          class="flex items-center gap-2 text-[11px] text-muted-foreground overflow-x-auto scrollbar-hide"
                        >
                          <span
                            class="flex-none rounded-full bg-card border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground"
                          >
                            {task.type || "story"}
                          </span>
                          <span
                            class="flex-none rounded-full bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] uppercase tracking-wide text-primary"
                          >
                            {task.points || "0"} {$_("sprint.pts")}
                          </span>
                          <span
                            class="flex-none rounded-full bg-card border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground"
                          >
                            {task.priority || "medium"}
                          </span>
                          {#if task.blocked}
                            <span
                              class="flex-none rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-500"
                            >
                              {$_("sprint.blocked")}
                            </span>
                          {/if}
                          <div class="flex-none ml-auto">
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
                        </div>
                      </div>
                    </article>
                  {:else}
                    <div
                      class="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/30 transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    >
                      <span
                        class="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2"
                      >
                        <Move size={14} class="opacity-50" />
                        {$_("sprint.dropTasksHere")}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </section>
        </div>

        {#if settings.showScrollButtons}
          <div class="flex flex-col justify-center">
            <button
              type="button"
              class="flex items-center justify-center rounded-full bg-card border border-border p-2 shadow-sm transition hover:bg-background hover:border-primary/50"
              onclick={() => scrollContainer(sprintScrollContainer, "right")}
              aria-label="Scroll right"
            >
              <ChevronRight
                size={20}
                class="text-muted-foreground hover:text-primary"
              />
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>

<!-- Sprint Modal -->
<SprintModal
  bind:open={sprintModalOpen}
  mode={sprintModalMode}
  sprint={selectedSprint}
/>

<!-- Confirm Delete Modal -->
<ConfirmModal
  bind:open={confirmModalOpen}
  title={confirmModalType === "sprint" ? $_("sprint.deleteSprint") : $_("tasks.deleteTask")}
  message={confirmModalType === "sprint" && sprintToDelete
    ? $_("sprint.deleteSprintMessage", { values: { name: sprintToDelete.name } })
    : confirmModalType === "task" && taskToDelete
      ? $_("sprint.deleteTaskMessage", { values: { title: taskToDelete.title } })
      : $_("confirmModal.defaultMessage")}
  confirmText={$_("common.delete")}
  cancelText={$_("common.cancel")}
  variant="danger"
  onConfirm={confirmDelete}
/>
