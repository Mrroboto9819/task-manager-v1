<script>
  import { Plus, Heading, User, Mail, Briefcase } from "lucide-svelte";
  import Modal from "../Modal.svelte";
  import { userStore } from "../stores/index.js";

  let {
    open = $bindable(false),
    mode = "create",
    user = null,
  } = $props();

  let formData = $state({
    id: "",
    name: "",
    lastname: "",
    email: "",
    rol: "",
  });

  // Initialize form when modal opens or user changes
  $effect(() => {
    if (open) {
      if (mode === "edit" && user) {
        formData = {
          id: user.id,
          name: user.name || "",
          lastname: user.lastname || "",
          email: user.email || "",
          rol: user.rol || "",
        };
      } else {
        formData = {
          id: "",
          name: "",
          lastname: "",
          email: "",
          rol: "",
        };
      }
    }
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      rol: formData.rol.trim(),
    };

    if (mode === "edit" && formData.id) {
      userStore.update(formData.id, payload);
    } else {
      userStore.create(payload);
    }

    closeModal();
  }

  function closeModal() {
    open = false;
  }
</script>

{#snippet modalChildren()}
  <form id="user-form" class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div class="flex items-center gap-2 mb-1">
          <User size={14} class="text-muted-foreground" />
          First Name
        </div>
        <input
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="John"
          bind:value={formData.name}
          required
        />
      </label>

      <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div class="flex items-center gap-2 mb-1">
          <User size={14} class="text-muted-foreground" />
          Last Name
        </div>
        <input
          class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Doe"
          bind:value={formData.lastname}
        />
      </label>
    </div>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Mail size={14} class="text-muted-foreground" />
        Email
      </div>
      <input
        type="email"
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="john.doe@example.com"
        bind:value={formData.email}
      />
    </label>

    <label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <div class="flex items-center gap-2 mb-1">
        <Briefcase size={14} class="text-muted-foreground" />
        Role
      </div>
      <select
        class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        bind:value={formData.rol}
      >
        <option value="">Select a role</option>
        <option value="Developer">Developer</option>
        <option value="Designer">Designer</option>
        <option value="Product Manager">Product Manager</option>
        <option value="QA Engineer">QA Engineer</option>
        <option value="DevOps Engineer">DevOps Engineer</option>
        <option value="Scrum Master">Scrum Master</option>
        <option value="Team Lead">Team Lead</option>
      </select>
    </label>
  </form>
{/snippet}

{#snippet modalFooter()}
  <div class="flex items-center justify-end gap-2">
    <button type="button" class="btn btn-secondary" onclick={closeModal}>
      Cancel
    </button>
    <button type="submit" form="user-form" class="btn btn-primary">
      <Plus size={16} />
      {mode === "edit" ? "Save Changes" : "Add Member"}
    </button>
  </div>
{/snippet}

<Modal
  {open}
  title={mode === "edit" ? "Edit Team Member" : "Add Team Member"}
  onClose={closeModal}
  children={modalChildren}
  footer={modalFooter}
/>
