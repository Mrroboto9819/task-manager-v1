<script>
  import { Plus, Heading, FileText, Type, Hash, AlertCircle, Target, Tag, User, Activity, Layers3, Clock, CheckCircle2, Eye } from "lucide-svelte";
  import Modal from "../Modal.svelte";
  import Switch from "../Switch.svelte";
  import TagInput from "./TagInput.svelte";
  import { taskStore, userStore, statusStore, sprintStore } from "../stores/index.js";
  import { marked } from "marked";

  let {
    open = $bindable(false),
    mode = "create",
    task = null,
  } = $props();

  let formData = $state({
    id: "",
    title: "",
    description: "",
    tags: "",
    asign: "",
    time: "",
    status: "",
    type: "story",
    points: "",
    priority: "medium",
    epic: "",
    sprintId: "",
    blocked: false,
    blocker: "",
    acceptance: "",
  });

  let showPreview = $state("write"); // "write", "split", or "preview"

  // Get data from stores
  let users = $derived(userStore.users);
  let statuses = $derived(statusStore.statuses);
  let sprints = $derived(sprintStore.sprints);

  // Initialize form when modal opens or task changes
  $effect(() => {
    if (open) {
      if (mode === "edit" && task) {
        formData = {
          id: task.id,
          title: task.title,
          description: task.description || "",
          tags: Array.isArray(task.tags) ? task.tags.join(", ") : "",
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
        // Get active sprint for new tasks
        const activeSprint = sprints.find((s) => s.status === "active");
        formData = {
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
          sprintId: activeSprint?.id || "",
          blocked: false,
          blocker: "",
          acceptance: "",
        };
      }
      showPreview = "write"; // Reset preview mode
    }
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Task title is required");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      asign: formData.asign.trim(),
      time: formData.time.trim(),
      status: formData.status,
      type: formData.type,
      points: String(formData.points || "").trim(),
      priority: formData.priority,
      epic: formData.epic.trim(),
      sprintId: formData.sprintId,
      blocked: Boolean(formData.blocked),
      blocker: formData.blocker.trim(),
      acceptance: formData.acceptance.trim(),
    };

    if (mode === "edit" && formData.id) {
      taskStore.update(formData.id, payload);
    } else {
      taskStore.create(payload);
    }

    closeModal();
  }

  function closeModal() {
    open = false;
  }

  // Handle Tab key in textareas - inserts tab instead of moving focus
  function handleTextareaKeydown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert tab character at cursor position
      textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

      // Move cursor after the inserted tab
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      // Trigger input event to update bound value
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Get assigned users
  let assignedUsers = $derived(
    users.map((user) => `${user.name} ${user.lastname}`.trim()).filter(Boolean)
  );
</script>

{#snippet modalChildren()}
  <form id="task-form" class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Heading size={14} class="text-muted-foreground" />
        Title
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Ship drag and drop MVP"
        bind:value={formData.title}
        required
      />
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <FileText size={14} class="text-muted-foreground" />
          Description (Markdown)
        </div>
        <div class="flex gap-1 rounded-lg bg-muted/30 p-1 border border-border">
          <button
            type="button"
            class={`px-3 py-1 text-xs font-medium rounded transition-all ${
              showPreview === "write"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onclick={() => (showPreview = "write")}
            title="Editor only"
          >
            Write
          </button>
          <button
            type="button"
            class={`px-3 py-1 text-xs font-medium rounded transition-all ${
              showPreview === "split"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onclick={() => (showPreview = "split")}
            title="Side by side"
          >
            Split
          </button>
          <button
            type="button"
            class={`px-3 py-1 text-xs font-medium rounded transition-all ${
              showPreview === "preview"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onclick={() => (showPreview = "preview")}
            title="Preview only"
          >
            <Eye size={12} class="inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {#if showPreview === "write"}
        <textarea
          class="mt-2 min-h-[200px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono resize-y"
          placeholder="What needs to be done. Markdown is supported."
          bind:value={formData.description}
          onkeydown={handleTextareaKeydown}
        ></textarea>
      {:else if showPreview === "split"}
        <div class="mt-2 flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <textarea
              class="min-h-[200px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono resize-y"
              placeholder="What needs to be done. Markdown is supported."
              bind:value={formData.description}
              onkeydown={handleTextareaKeydown}
            ></textarea>
          </div>
          <div class="flex-1">
            <div class="min-h-[200px] w-full rounded-lg border border-border px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-background">
              {#if formData.description}
                {@html marked(formData.description)}
              {:else}
                <span class="text-muted-foreground italic">No description to preview.</span>
              {/if}
            </div>
          </div>
        </div>
      {:else if showPreview === "preview"}
        <div class="mt-2 min-h-[200px] w-full rounded-lg border border-border px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-background">
          {#if formData.description}
            {@html marked(formData.description)}
          {:else}
            <span class="text-muted-foreground italic">No description to preview.</span>
          {/if}
        </div>
      {/if}
    </label>

    <div class="grid gap-4 md:grid-cols-3">
      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div class="flex items-center gap-2 mb-1">
          <Type size={14} class="text-muted-foreground" />
          Type
        </div>
        <select
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          bind:value={formData.type}
        >
          <option value="story">Story</option>
          <option value="bug">Bug</option>
          <option value="chore">Chore</option>
        </select>
      </label>
      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div class="flex items-center gap-2 mb-1">
          <Hash size={14} class="text-muted-foreground" />
          Points
        </div>
        <input
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="3"
          bind:value={formData.points}
        />
      </label>
      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div class="flex items-center gap-2 mb-1">
          <AlertCircle size={14} class="text-muted-foreground" />
          Priority
        </div>
        <select
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          bind:value={formData.priority}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
    </div>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Target size={14} class="text-muted-foreground" />
        Epic
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Growth"
        bind:value={formData.epic}
      />
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Tag size={14} class="text-muted-foreground" />
        Tags
      </div>
      <div class="mt-2">
        <TagInput bind:value={formData.tags} />
      </div>
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <User size={14} class="text-muted-foreground" />
        Assign
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        bind:value={formData.asign}
      >
        <option value="">Unassigned</option>
        {#each assignedUsers as person}
          <option value={person}>{person}</option>
        {/each}
      </select>
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Activity size={14} class="text-muted-foreground" />
        Status
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        bind:value={formData.status}
      >
        {#each statuses as statusItem}
          <option value={statusItem.status}>{statusItem.status}</option>
        {/each}
      </select>
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Layers3 size={14} class="text-muted-foreground" />
        Sprint
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        bind:value={formData.sprintId}
      >
        <option value="">Backlog</option>
        {#each sprints as sprint}
          <option value={sprint.id}>{sprint.name}</option>
        {/each}
      </select>
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Clock size={14} class="text-muted-foreground" />
        Time
      </div>
      <input
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="2h"
        bind:value={formData.time}
      />
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <CheckCircle2 size={14} class="text-muted-foreground" />
        Acceptance criteria
      </div>
      <textarea
        class="mt-2 min-h-[90px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Given..., when..., then..."
        bind:value={formData.acceptance}
        onkeydown={handleTextareaKeydown}
      ></textarea>
    </label>

    <Switch bind:checked={formData.blocked} label="Status: Blocked" />

    {#if formData.blocked}
      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Blocker reason
        <input
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Waiting on API access"
          bind:value={formData.blocker}
        />
      </label>
    {/if}
  </form>
{/snippet}

{#snippet modalFooter()}
  <div class="flex items-center justify-end gap-2">
    <button type="button" class="btn btn-secondary" onclick={closeModal}>
      Cancel
    </button>
    <button type="submit" form="task-form" class="btn btn-primary">
      <Plus size={16} />
      {mode === "edit" ? "Save Changes" : "Create Task"}
    </button>
  </div>
{/snippet}

<Modal
  {open}
  title={mode === "edit" ? "Edit Task" : "New Task"}
  size="xl"
  onClose={closeModal}
  children={modalChildren}
  footer={modalFooter}
/>
