<script lang="ts">
    import {Card} from "flowbite-svelte";
</script>

{#each [...Array(42).keys()] as v}
    <Card class="h-28 !p-4 relative dark:text-white animate-pulse">
        <div class="w-full h-6 bg-gray-500 rounded-xl"/>
    </Card>
{/each}