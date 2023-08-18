<script lang="ts">
import {P} from "flowbite-svelte";
import {page} from "$app/stores";
</script>
<P>
    SettingUp
</P>
<p class="text-white">
    {JSON.stringify($page.data.session)}
</p>