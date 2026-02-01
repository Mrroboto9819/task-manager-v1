<script>
  import {
    Plus,
    Settings,
    Trash2,
    Pencil,
    Tag,
    LayoutGrid,
    Palette,
    Eye,
    EyeOff,
    GripVertical,
    Lock,
  } from "lucide-svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { statusStore, tagStore } from "../../lib/stores/index.js";
  import StatusModal from "../../lib/components/StatusModal.svelte";
  import TagModal from "../../lib/components/TagModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";
  import StandardSwitch from "../../lib/StandardSwitch.svelte";
  import { _ } from "$lib/i18n";

  let statuses = $derived(statusStore.statuses);
  let tags = $derived(tagStore.tags);
  const flipDurationMs = 200;

  // Drag and drop state
  let draggingItems = $state(null);
  let visibleStatuses = $derived(draggingItems || statuses);

  // Active tab
  let activeTab = $state("statuses");

  // Status modal state
  let statusModalOpen = $state(false);
  let statusModalMode = $state("create");
  let selectedStatus = $state(null);

  // Tag modal state
  let tagModalOpen = $state(false);
  let tagModalMode = $state("create");
  let selectedTag = $state(null);

  // Confirm modal state
  let confirmModalOpen = $state(false);
  let confirmModalType = $state("delete-status"); // "delete-status" or "delete-tag"
  let itemToDelete = $state(null);

  // Status functions
  function openStatusModal() {
    statusModalMode = "create";
    selectedStatus = null;
    statusModalOpen = true;
  }

  function editStatus(status) {
    statusModalMode = "edit";
    selectedStatus = status;
    statusModalOpen = true;
  }

  function confirmDeleteStatus(status) {
    confirmModalType = "delete-status";
    itemToDelete = status;
    confirmModalOpen = true;
  }

  function toggleStatusVisibility(id) {
    const status = statusStore.getById(id);
    if (status) {
      statusStore.update(id, { show: !status.show });
    }
  }

  // Tag functions
  function openTagModal() {
    tagModalMode = "create";
    selectedTag = null;
    tagModalOpen = true;
  }

  function editTag(tag) {
    tagModalMode = "edit";
    selectedTag = tag;
    tagModalOpen = true;
  }

  function confirmDeleteTag(tag) {
    confirmModalType = "delete-tag";
    itemToDelete = tag;
    confirmModalOpen = true;
  }

  // Confirm delete handler
  function handleConfirmDelete() {
    if (!itemToDelete) return;

    if (confirmModalType === "delete-status") {
      statusStore.delete(itemToDelete.id);
    } else if (confirmModalType === "delete-tag") {
      tagStore.delete(itemToDelete.id);
    }

    itemToDelete = null;
  }

  function getConfirmModalConfig() {
    if (confirmModalType === "delete-status" && itemToDelete) {
      return {
        title: $_("settings.statuses.deleteTitle"),
        message: $_("settings.statuses.deleteMessage", { values: { name: itemToDelete.status } }),
      };
    } else if (confirmModalType === "delete-tag" && itemToDelete) {
      return {
        title: $_("settings.tags.deleteTitle"),
        message: $_("settings.tags.deleteMessage", { values: { name: itemToDelete.name } }),
      };
    }
    return {
      title: $_("confirmModal.defaultTitle"),
      message: $_("confirmModal.defaultMessage"),
    };
  }

  let modalConfig = $derived(getConfirmModalConfig());

  // Drag and drop handlers
  function handleDndConsider(e) {
    console.log("DND Consider:", e.detail);
    draggingItems = e.detail.items;
  }

  function handleDndFinalize(e) {
    console.log("DND Finalize:", e.detail);
    draggingItems = e.detail.items;
    statusStore.updateOrder(e.detail.items);
    draggingItems = null;
  }
</script>

<main class="min-h-screen px-6 pt-6 pb-10">
  <!-- Header -->
  <header class="mb-6">
    <div class="flex items-center gap-3 mb-2">
      <div class="rounded-xl bg-primary/10 border border-primary/30 p-2.5">
        <Settings size={24} class="text-primary" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-foreground">{$_("settings.title")}</h1>
        <p class="text-muted-foreground mt-1">
          {$_("settings.description")}
        </p>
      </div>
    </div>
  </header>

  <!-- Tabs -->
  <div class="mb-6 border-b border-border">
    <div class="flex gap-1">
      <button
        type="button"
        class="px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2"
        class:border-primary={activeTab === "statuses"}
        class:text-primary={activeTab === "statuses"}
        class:border-transparent={activeTab !== "statuses"}
        class:text-muted-foreground={activeTab !== "statuses"}
        onclick={() => (activeTab = "statuses")}
      >
        <LayoutGrid size={16} />
        {$_("settings.tabs.statuses")}
        <span
          class="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
        >
          {statuses.length}
        </span>
      </button>
      <button
        type="button"
        class="px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2"
        class:border-primary={activeTab === "tags"}
        class:text-primary={activeTab === "tags"}
        class:border-transparent={activeTab !== "tags"}
        class:text-muted-foreground={activeTab !== "tags"}
        onclick={() => (activeTab = "tags")}
      >
        <Tag size={16} />
        {$_("settings.tabs.tags")}
        <span
          class="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
        >
          {tags.length}
        </span>
      </button>
    </div>
  </div>

  <!-- Status Columns Tab -->
  {#if activeTab === "statuses"}
    <div class="space-y-4">
      <!-- Header with action button -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-foreground">{$_("settings.statuses.title")}</h2>
          <p class="text-sm text-muted-foreground mt-1">
            {$_("settings.statuses.description")}
          </p>
        </div>
        <button type="button" class="btn btn-primary" onclick={openStatusModal}>
          <Plus size={16} />
          {$_("settings.statuses.newStatus")}
        </button>
      </div>

      <!-- Status List -->
      <div class="space-y-3">
        {#if statuses.length === 0}
          <div
            class="rounded-2xl border border-dashed border-border p-12 text-center"
          >
            <LayoutGrid
              size={48}
              class="mx-auto mb-4 text-muted-foreground opacity-50"
            />
            <h3 class="text-lg font-semibold text-foreground mb-2">
              {$_("settings.statuses.noStatuses")}
            </h3>
            <p class="text-sm text-muted-foreground mb-4">
              {$_("settings.statuses.createFirstDesc")}
            </p>
            <button
              type="button"
              class="btn btn-primary"
              onclick={openStatusModal}
            >
              <Plus size={16} />
              {$_("settings.statuses.createFirst")}
            </button>
          </div>
        {:else}
          <div
            use:dndzone={{ items: visibleStatuses, flipDurationMs }}
            onconsider={handleDndConsider}
            onfinalize={handleDndFinalize}
            class="space-y-3 outline-none"
          >
            {#each visibleStatuses as status (status.id)}
              <article
                animate:flip={{ duration: flipDurationMs }}
                class="rounded-xl border border-border bg-card p-5 flex items-center justify-between transition-all group cursor-move hover:border-primary/50"
              >
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <GripVertical
                    size={18}
                    class="text-muted-foreground flex-shrink-0"
                  />
                  <div
                    class="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-card"
                    style="background-color: {status.color}; ring-color: {status.color}40"
                  ></div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-bold text-foreground flex items-center gap-2">
                      {status.status}
                      {#if status.isSystem}
                        <Lock size={14} class="text-muted-foreground" title={$_("settings.statuses.systemStatus")} />
                      {/if}
                    </h3>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {$_("settings.statuses.created")} {new Date(status.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3 flex-shrink-0">
                  <div
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50"
                  >
                    {#if status.show}
                      <Eye size={14} class="text-primary" />
                      <span class="text-xs font-medium text-foreground"
                        >{$_("settings.statuses.visible")}</span
                      >
                    {:else}
                      <EyeOff size={14} class="text-muted-foreground" />
                      <span class="text-xs font-medium text-muted-foreground"
                        >{$_("settings.statuses.hidden")}</span
                      >
                    {/if}
                    <StandardSwitch
                      checked={status.show}
                      color={status.color}
                      onchange={() => toggleStatusVisibility(status.id)}
                    />
                  </div>

                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="btn btn-ghost px-2 py-1 text-[10px]"
                      onclick={() => editStatus(status)}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {#if !status.isSystem}
                      <button
                        type="button"
                        class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500 hover:text-white"
                        onclick={() => confirmDeleteStatus(status)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    {/if}
                  </div>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Info Box -->
      <div class="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p class="text-sm text-foreground">
          <span class="font-semibold">💡 Tip:</span> {$_("settings.statuses.tip")}
        </p>
      </div>
    </div>
  {/if}

  <!-- Tags Tab -->
  {#if activeTab === "tags"}
    <div class="space-y-4">
      <!-- Header with action button -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-foreground">{$_("settings.tags.title")}</h2>
          <p class="text-sm text-muted-foreground mt-1">
            {$_("settings.tags.description")}
          </p>
        </div>
        <button type="button" class="btn btn-primary" onclick={openTagModal}>
          <Plus size={16} />
          {$_("settings.tags.newTag")}
        </button>
      </div>

      <!-- Tags Grid -->
      {#if tags.length === 0}
        <div
          class="rounded-2xl border border-dashed border-border p-12 text-center"
        >
          <Tag
            size={48}
            class="mx-auto mb-4 text-muted-foreground opacity-50"
          />
          <h3 class="text-lg font-semibold text-foreground mb-2">{$_("settings.tags.noTags")}</h3>
          <p class="text-sm text-muted-foreground mb-4">
            {$_("settings.tags.createFirstDesc")}
          </p>
          <button type="button" class="btn btn-primary" onclick={openTagModal}>
            <Plus size={16} />
            {$_("settings.tags.createFirst")}
          </button>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each tags as tag (tag.id)}
            <article
              class="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all group"
            >
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <div
                    class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium mb-2"
                    style="background-color: {tag.color}15; border-color: {tag.color}40; color: {tag.color}"
                  >
                    <Tag size={12} />
                    {tag.name}
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {$_("settings.tags.created")} {new Date(tag.created).toLocaleDateString()}
                  </p>
                </div>

                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    type="button"
                    class="btn btn-ghost px-2 py-1 text-[10px]"
                    onclick={() => editTag(tag)}
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500 hover:text-white"
                    onclick={() => confirmDeleteTag(tag)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-2 border-t border-border">
                <Palette size={12} class="text-muted-foreground" />
                <code class="text-xs text-muted-foreground font-mono"
                  >{tag.color}</code
                >
              </div>
            </article>
          {/each}
        </div>
      {/if}

      <!-- Info Box -->
      <div class="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p class="text-sm text-foreground">
          <span class="font-semibold">💡 Tip:</span> {$_("settings.tags.tip")}
        </p>
      </div>
    </div>
  {/if}
</main>

<!-- Status Modal -->
<StatusModal
  bind:open={statusModalOpen}
  mode={statusModalMode}
  status={selectedStatus}
/>

<!-- Tag Modal -->
<TagModal bind:open={tagModalOpen} mode={tagModalMode} tag={selectedTag} />

<!-- Confirm Delete Modal -->
<ConfirmModal
  bind:open={confirmModalOpen}
  title={modalConfig.title}
  message={modalConfig.message}
  confirmText={$_("common.delete")}
  cancelText={$_("common.cancel")}
  variant="danger"
  onConfirm={handleConfirmDelete}
/>
