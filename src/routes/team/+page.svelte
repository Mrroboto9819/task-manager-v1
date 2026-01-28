<script>
  import {
    Plus,
    Pencil,
    Trash2,
    Mail,
    Briefcase,
    Users2,
    UserCheck,
    User,
  } from "lucide-svelte";
  import { userStore, taskStore } from "../../lib/stores/index.js";
  import UserModal from "../../lib/components/UserModal.svelte";
  import ConfirmModal from "../../lib/components/ConfirmModal.svelte";

  let users = $derived(userStore.users);
  let allTasks = $derived(taskStore.tasks);

  // Modal state
  let userModalOpen = $state(false);
  let userModalMode = $state("create");
  let selectedUser = $state(null);

  // Confirm modal state
  let confirmModalOpen = $state(false);
  let userToDelete = $state(null);

  // Get task count for user
  function getUserTaskCount(userName) {
    const fullName = userName.trim();
    return allTasks.filter((task) => task.asign === fullName).length;
  }

  // Get active tasks for user
  function getUserActiveTasks(userName) {
    const fullName = userName.trim();
    return allTasks.filter(
      (task) =>
        task.asign === fullName &&
        task.status !== "DONE" &&
        task.status !== "COMPLETE",
    ).length;
  }

  // Group users by role
  let usersByRole = $derived(() => {
    const grouped = {};
    users.forEach((user) => {
      const role = user.rol || "Unassigned";
      if (!grouped[role]) {
        grouped[role] = [];
      }
      grouped[role].push(user);
    });
    return grouped;
  });

  // User modal functions
  function openUserModal() {
    userModalMode = "create";
    selectedUser = null;
    userModalOpen = true;
  }

  function editUser(user) {
    userModalMode = "edit";
    selectedUser = user;
    userModalOpen = true;
  }

  function confirmDeleteUser(user) {
    userToDelete = user;
    confirmModalOpen = true;
  }

  function handleConfirmDelete() {
    if (userToDelete) {
      userStore.delete(userToDelete.id);
      userToDelete = null;
    }
  }

  // Get initials
  function getInitials(name, lastname) {
    const firstInitial = name?.charAt(0).toUpperCase() || "?";
    const lastInitial = lastname?.charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial;
  }

  // Get role color
  const roleColors = {
    Developer: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-500",
    },
    Designer: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-500",
    },
    "Product Manager": {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
    },
    "QA Engineer": {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-500",
    },
    "DevOps Engineer": {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-500",
    },
    "Scrum Master": {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-500",
    },
    "Team Lead": {
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      text: "text-pink-500",
    },
  };

  function getRoleColor(role) {
    return (
      roleColors[role] || {
        bg: "bg-muted",
        border: "border-border",
        text: "text-muted-foreground",
      }
    );
  }
</script>

<main class="min-h-screen px-6 pt-6 pb-10">
  <!-- Header -->
  <header class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Team</h1>
      <p class="text-muted-foreground mt-1">
        Manage your team members and their roles
      </p>
    </div>
    <button
      type="button"
      class="btn btn-primary shadow-sm"
      onclick={openUserModal}
    >
      <Plus size={16} />
      Add Member
    </button>
  </header>

  <div class="space-y-6">
    <!-- Stats Card -->
    {#if users.length > 0}
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-border bg-background px-4 py-3">
            <p
              class="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"
            >
              <Users2 size={12} />
              Total Members
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">
              {users.length}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-background px-4 py-3">
            <p
              class="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"
            >
              <Briefcase size={12} />
              Roles
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">
              {Object.keys(usersByRole()).length}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-background px-4 py-3">
            <p
              class="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"
            >
              <UserCheck size={12} />
              With Tasks
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">
              {users.filter(
                (u) => getUserTaskCount(`${u.name} ${u.lastname || ""}`) > 0,
              ).length}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Team Members List -->
    {#if users.length === 0}
      <div
        class="rounded-2xl border border-dashed border-border p-12 text-center"
      >
        <Users2
          size={48}
          class="mx-auto mb-4 text-muted-foreground opacity-50"
        />
        <h3 class="text-lg font-semibold text-foreground mb-2">
          No Team Members
        </h3>
        <p class="text-sm text-muted-foreground mb-4">
          Add team members to assign tasks and collaborate effectively.
        </p>
        <button type="button" class="btn btn-primary" onclick={openUserModal}>
          <Plus size={16} />
          Add First Member
        </button>
      </div>
    {:else}
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-foreground">Team Members</h2>
          <p class="text-sm text-muted-foreground">
            {users.length} member{users.length === 1 ? "" : "s"}
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {#each users as user (user.id)}
            {@const fullName = `${user.name} ${user.lastname || ""}`.trim()}
            {@const taskCount = getUserTaskCount(fullName)}
            {@const activeTasks = getUserActiveTasks(fullName)}
            {@const roleColor = getRoleColor(user.rol)}

            <article
              class="rounded-xl border border-border bg-background p-5 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-3 mb-4">
                <!-- Avatar and Info -->
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    class="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 text-primary flex items-center justify-center text-lg font-bold flex-shrink-0"
                  >
                    {getInitials(user.name, user.lastname)}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-bold text-foreground truncate">
                      {user.name}
                      {user.lastname || ""}
                    </h3>
                    {#if user.email}
                      <p
                        class="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5"
                      >
                        <Mail size={10} />
                        {user.email}
                      </p>
                    {/if}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    class="btn btn-ghost px-2 py-1 text-[10px]"
                    onclick={() => editUser(user)}
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-500 hover:text-white"
                    onclick={() => confirmDeleteUser(user)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <!-- Role Badge -->
              {#if user.rol}
                <div class="mb-3">
                  <span
                    class={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${roleColor.bg} ${roleColor.border} ${roleColor.text}`}
                  >
                    <Briefcase size={10} />
                    {user.rol}
                  </span>
                </div>
              {/if}

              <!-- Task Stats -->
              <div class="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <div class="rounded-lg bg-muted/50 px-3 py-2">
                  <p
                    class="text-[9px] uppercase tracking-wide text-muted-foreground"
                  >
                    Total Tasks
                  </p>
                  <p class="mt-1 text-lg font-bold text-foreground">
                    {taskCount}
                  </p>
                </div>
                <div class="rounded-lg bg-muted/50 px-3 py-2">
                  <p
                    class="text-[9px] uppercase tracking-wide text-muted-foreground"
                  >
                    Active
                  </p>
                  <p class="mt-1 text-lg font-bold text-primary">
                    {activeTasks}
                  </p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>

<!-- User Modal -->
<UserModal bind:open={userModalOpen} mode={userModalMode} user={selectedUser} />

<!-- Confirm Delete Modal -->
<ConfirmModal
  bind:open={confirmModalOpen}
  title="Remove Team Member"
  message={userToDelete
    ? `Are you sure you want to remove ${userToDelete.name} ${userToDelete.lastname || ""} from the team? This will not delete their assigned tasks.`
    : "Are you sure you want to remove this team member?"}
  confirmText="Remove"
  cancelText="Cancel"
  variant="danger"
  onConfirm={handleConfirmDelete}
/>
