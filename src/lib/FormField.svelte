<script>
  import { AlertCircle } from "lucide-svelte";

  let {
    label = "",
    error = "",
    required = false,
    hint = "",
    children,
  } = $props();
