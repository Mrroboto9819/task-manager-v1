<script>
  import {
    Plus,
    Pencil,
    Trash2,
    Play,
    CheckCircle,
    Calendar,
    Target,
    TrendingUp,
    Clock,
  } from "lucide-svelte";
  import { sprintStore, taskStore } from "../../lib/stores/index.js";
  import SprintModal from "../../lib/components/SprintModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";
  import { toastStore } from "../../lib/toastStore.svelte.js";
  import { marked } from "marked";
  import { _ } from "$lib/i18n";

  let sprints = $derived(sprintStore.sprints);
  let allTasks = $derived(taskStore.tasks);

  // Modal state
  let sprintModalOpen = $state(false);
  let sprintModalMode = $state("create");
  let selectedSprint = $state(null);

  // Confirm modal state
  let confirmModalOpen = $state(false);
  let confirmModalType = $state("delete"); // "delete" or "complete"
  let sprintToDelete = $state(null);
  let sprintToComplete = $state(null);

  // Group sprints by status
  let plannedSprints = $derived(sprints.filter((s) => s.status === "planned"));
  let activeSprints = $derived(sprints.filter((s) => s.status === "active"));
  let closedSprints = $derived(sprints.filter((s) => s.status === "closed"));

  // Sprint modal functions
  function openSprintModal() {
    sprintModalMode = "create";
    selectedSprint = null;
    sprintModalOpen = true;
  }

  function editSprint(sprint) {
    sprintModalMode = "edit";
    selectedSprint = sprint;
    sprintModalOpen = true;
  }

  function confirmDeleteSprint(sprint) {
    confirmModalType = "delete";
    sprintToDelete = sprint;
    sprintToComplete = null;
    confirmModalOpen = true;
  }

  function confirmCompleteSprint(sprint) {
    confirmModalType = "complete";
    sprintToComplete = sprint;
    sprintToDelete = null;
    confirmModalOpen = true;
  }

  function handleConfirm() {
    if (confirmModalType === "delete" && sprintToDelete) {
      sprintStore.delete(sprintToDelete.id);
      sprintToDelete = null;
    } else if (confirmModalType === "complete" && sprintToComplete) {
      sprintStore.complete(sprintToComplete.id);
      sprintToComplete = null;
    }
  }

  function activateSprint(sprintId) {
    sprintStore.activate(sprintId);
  }

  // Get tasks for sprint
  function getSprintTasks(sprintId) {
    return allTasks.filter((t) => t.sprintId === sprintId);
  }

  function getTotalPoints(tasks) {
    return tasks.reduce((sum, task) => {
      const points = parseInt(task.points) || 0;
      return sum + points;
    }, 0);
  }

  function getCompletedTasks(tasks) {
    return tasks.filter((t) => t.status === "DONE" || t.status === "COMPLETE");
  }

  function formatDate(dateString) {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getDaysRemaining(endDate) {
    if (!endDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0); // Reset to start of day
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Status badge colors
  const statusColors = {
    planned: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
    },
    active: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
    },
    closed: {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
    },
  };

  function getStatusColor(status) {
    return statusColors[status] || statusColors.planned;
  }
</script>

<main class="min-h-screen px-6 pt-6 pb-10">
  <!-- Header -->
  <header class="mb-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="rounded-xl bg-primary/10 border border-primary/30 p-2.5">
        <Calendar size={24} class="text-primary" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-foreground">{$_("sprints.title")}</h1>
        <p class="text-muted-foreground mt-1">
          {$_("sprints.description")}
        </p>
      </div>
    </div>
    <button
      type="button"
      class="btn btn-primary shadow-sm"
      onclick={openSprintModal}
    >
      <Plus size={16} />
      {$_("sprints.newSprint")}
    </button>
  </header>

  <div class="space-y-8">
    <!-- Active Sprints -->
    {#if activeSprints.length > 0}
      <section>
        <h2
          class="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <Play size={20} class="text-primary" />
          {$_("sprints.activeSprint")}
        </h2>
        <div class="grid gap-4">
          {#each activeSprints as sprint (sprint.id)}
            {@const sprintTasks = getSprintTasks(sprint.id)}
            {@const completedTasks = getCompletedTasks(sprintTasks)}
            {@const totalPoints = getTotalPoints(sprintTasks)}
            {@const completedPoints = getTotalPoints(completedTasks)}
            {@const daysRemaining = getDaysRemaining(sprint.end)}
            {@const statusColor = getStatusColor(sprint.status)}

            <article
              class="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 shadow-sm"
            >
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-foreground">
                      {sprint.name}
                    </h3>
                    <span
                      class={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-secondary px-3 py-2 text-sm"
                    onclick={() => editSprint(sprint)}
                  >
                    <Pencil size={14} />
                    {$_("common.edit")}
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary px-3 py-2 text-sm"
                    onclick={() => confirmCompleteSprint(sprint)}
                  >
                    <CheckCircle size={14} />
                    {$_("sprints.complete")}
                  </button>
                </div>
              </div>

              <!-- Sprint Goal -->
              {#if sprint.goal}
                <div class="mb-4 space-y-2">
                  <h4 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Target size={12} />
                    {$_("sprints.sprintGoal")}
                  </h4>
                  <div class="rounded-lg border border-border bg-background p-4 prose prose-sm dark:prose-invert max-w-none">
                    {@html marked(sprint.goal)}
                  </div>
                </div>
              {/if}

              <!-- Sprint Stats -->
              <div class="grid gap-4 sm:grid-cols-4 mt-4">
                <div
                  class="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p
                    class="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.tasks")}
                  </p>
                  <p class="mt-2 text-2xl font-bold text-foreground">
                    {completedTasks.length}/{sprintTasks.length}
                  </p>
                </div>
                <div
                  class="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p
                    class="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.points")}
                  </p>
                  <p class="mt-2 text-2xl font-bold text-foreground">
                    {completedPoints}/{totalPoints}
                  </p>
                </div>
                <div
                  class="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p
                    class="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"
                  >
                    <Calendar size={12} />
                    {$_("sprints.startDate")}
                  </p>
                  <p class="mt-2 text-sm font-semibold text-foreground">
                    {formatDate(sprint.start)}
                  </p>
                </div>
                <div
                  class="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p
                    class="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"
                  >
                    <Clock size={12} />
                    {$_("sprints.daysLeft")}
                  </p>
                  <p
                    class="mt-2 text-2xl font-bold {daysRemaining !== null &&
                    daysRemaining < 3
                      ? 'text-rose-500'
                      : 'text-foreground'}"
                  >
                    {daysRemaining !== null ? daysRemaining : "—"}
                  </p>
                </div>
              </div>

              <!-- Progress Bar -->
              {#if sprintTasks.length > 0}
                <div class="mt-4">
                  <div
                    class="flex items-center justify-between text-xs text-muted-foreground mb-2"
                  >
                    <span>{$_("sprints.progress")}</span>
                    <span
                      >{Math.round(
                        (completedTasks.length / sprintTasks.length) * 100,
                      )}%</span
                    >
                  </div>
                  <div class="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary transition-all duration-300"
                      style={`width: ${(completedTasks.length / sprintTasks.length) * 100}%`}
                    ></div>
                  </div>
                </div>
              {/if}
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Planned Sprints -->
    {#if plannedSprints.length > 0}
      <section>
        <h2
          class="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <Calendar size={20} class="text-primary" />
          {$_("sprints.plannedSprints")}
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each plannedSprints as sprint (sprint.id)}
            {@const sprintTasks = getSprintTasks(sprint.id)}
            {@const totalPoints = getTotalPoints(sprintTasks)}
            {@const statusColor = getStatusColor(sprint.status)}

            <article
              class="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-foreground">
                      {sprint.name}
                    </h3>
                    <span
                      class={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Sprint Goal -->
              {#if sprint.goal}
                <div class="mb-4 space-y-2">
                  <h4 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Target size={10} />
                    {$_("sprints.sprintGoal")}
                  </h4>
                  <div class="rounded-lg border border-border bg-background p-3 prose prose-xs dark:prose-invert max-w-none">
                    {@html marked(sprint.goal)}
                  </div>
                </div>
              {/if}

              <div class="grid grid-cols-3 gap-3 mb-4">
                <div
                  class="rounded-lg border border-border bg-background px-3 py-2"
                >
                  <p
                    class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.tasks")}
                  </p>
                  <p class="mt-1 text-lg font-bold text-foreground">
                    {sprintTasks.length}
                  </p>
                </div>
                <div
                  class="rounded-lg border border-border bg-background px-3 py-2"
                >
                  <p
                    class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.points")}
                  </p>
                  <p class="mt-1 text-lg font-bold text-foreground">
                    {totalPoints}
                  </p>
                </div>
                <div
                  class="rounded-lg border border-border bg-background px-3 py-2"
                >
                  <p
                    class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.starts")}
                  </p>
                  <p class="mt-1 text-[10px] font-semibold text-foreground">
                    {formatDate(sprint.start)}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="btn btn-primary flex-1 px-3 py-2 text-sm"
                  onclick={() => activateSprint(sprint.id)}
                >
                  <Play size={14} />
                  {$_("sprints.activate")}
                </button>
                <button
                  type="button"
                  class="btn btn-secondary px-3 py-2 text-sm"
                  onclick={() => editSprint(sprint)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost px-3 py-2 text-sm text-rose-500 hover:bg-rose-500 hover:text-white"
                  onclick={() => confirmDeleteSprint(sprint)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Closed Sprints -->
    {#if closedSprints.length > 0}
      <section>
        <h2
          class="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <CheckCircle size={20} class="text-muted-foreground" />
          {$_("sprints.completedSprints")}
        </h2>
        <div class="grid gap-3 md:grid-cols-3">
          {#each closedSprints as sprint (sprint.id)}
            {@const sprintTasks = getSprintTasks(sprint.id)}
            {@const completedTasks = getCompletedTasks(sprintTasks)}
            {@const statusColor = getStatusColor(sprint.status)}

            <article
              class="rounded-xl border border-border bg-card p-4 shadow-sm opacity-75 hover:opacity-100 transition-opacity"
            >
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-bold text-foreground truncate">
                    {sprint.name}
                  </h3>
                  <span
                    class={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusColor.bg} ${statusColor.border} ${statusColor.text} mt-1`}
                  >
                    {sprint.status}
                  </span>
                </div>
                <button
                  type="button"
                  class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500 hover:text-white flex-shrink-0"
                  onclick={() => confirmDeleteSprint(sprint)}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div
                  class="rounded-lg border border-border bg-background px-2 py-2"
                >
                  <p
                    class="text-[9px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.completed")}
                  </p>
                  <p class="mt-1 text-sm font-bold text-foreground">
                    {completedTasks.length}/{sprintTasks.length}
                  </p>
                </div>
                <div
                  class="rounded-lg border border-border bg-background px-2 py-2"
                >
                  <p
                    class="text-[9px] uppercase tracking-wide text-muted-foreground"
                  >
                    {$_("sprints.ended")}
                  </p>
                  <p class="mt-1 text-[9px] font-semibold text-foreground">
                    {formatDate(sprint.end)}
                  </p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Empty State -->
    {#if sprints.length === 0}
      <div
        class="rounded-2xl border border-dashed border-border p-12 text-center"
      >
        <TrendingUp
          size={48}
          class="mx-auto mb-4 text-muted-foreground opacity-50"
        />
        <h3 class="text-lg font-semibold text-foreground mb-2">
          {$_("sprints.noSprints")}
        </h3>
        <p class="text-sm text-muted-foreground mb-4">
          {$_("sprints.createFirstDesc")}
        </p>
        <button type="button" class="btn btn-primary" onclick={openSprintModal}>
          <Plus size={16} />
          {$_("sprints.createFirst")}
        </button>
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

<!-- Confirm Modal -->
<ConfirmModal
  bind:open={confirmModalOpen}
  title={confirmModalType === "complete" ? $_("sprints.completeSprint") : $_("sprint.deleteSprint")}
  message={confirmModalType === "complete" && sprintToComplete
    ? $_("sprints.completeSprintMessage", { values: { name: sprintToComplete.name } })
    : confirmModalType === "delete" && sprintToDelete
      ? $_("sprints.deleteSprintMessage", { values: { name: sprintToDelete.name } })
      : $_("confirmModal.defaultMessage")}
  confirmText={confirmModalType === "complete" ? $_("sprints.completeSprint") : $_("common.delete")}
  cancelText={$_("common.cancel")}
  variant={confirmModalType === "complete" ? "info" : "danger"}
  onConfirm={handleConfirm}
/>
