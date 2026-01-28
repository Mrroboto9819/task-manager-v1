<script>
  import { fade } from "svelte/transition";

  let {
    visible = false,
    status = "checking",
    progress = 0,
    version = "",
  } = $props();

  const statusMessages = {
    checking: "Checking for updates...",
    downloading: `Downloading update ${version}...`,
    installing: "Installing update...",
    restarting: "Update complete! Restarting...",
  };
</script>

{#if visible}
  <div
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-midnight dark:bg-noir transition-colors duration-300"
    transition:fade={{ duration: 300 }}
  >
    <div class="flex flex-col items-center space-y-8">
      <!-- Logo/Icon Area -->
      <div class="relative">
        <div class="absolute inset-0 animate-ping opacity-20">
          <div class="h-24 w-24 rounded-full bg-ocean"></div>
        </div>
        <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-midnight to-ocean dark:from-ocean dark:to-pearl shadow-2xl shadow-ocean/50">
          <svg class="h-12 w-12 text-pearl dark:text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
      </div>

      <!-- Status Text -->
      <div class="text-center">
        <h1 class="text-2xl font-bold text-pearl mb-2">
          Task Manager
        </h1>
        <p class="text-lg text-pearl/80">
          {statusMessages[status]}
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="w-80">
        <div class="h-2 w-full overflow-hidden rounded-full bg-midnight/50 dark:bg-pearl/20">
          <div
            class="h-full rounded-full bg-gradient-to-r from-ocean to-pearl dark:from-pearl dark:to-ocean transition-all duration-500 ease-out"
            style="width: {progress}%"
          ></div>
        </div>
        {#if status === "downloading" && progress > 0}
          <p class="mt-2 text-center text-sm text-pearl/60">
            {progress}% complete
          </p>
        {/if}
      </div>

      <!-- Fun Loading Animation -->
      <div class="flex space-x-2">
        {#each Array(3) as _, i}
          <div
            class="h-2 w-2 animate-bounce rounded-full bg-ocean dark:bg-pearl"
            style="animation-delay: {i * 150}ms"
          ></div>
        {/each}
      </div>
    </div>

    <!-- Version Info Footer -->
    {#if version}
      <div class="absolute bottom-8 text-sm text-pearl/50">
        Updating to version {version}
      </div>
    {/if}
  </div>
{/if}

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.5rem);
    }
  }

  .animate-bounce {
    animation: bounce 1s infinite;
  }
</style>
