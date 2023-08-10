<script lang="ts">
    import {Card} from "flowbite-svelte";
</script>

{#each [...Array(7).keys()] as v}
    <div class="flex gap-1 sm:gap-2">
        <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center gap-2 animate-pulse">
            <div class="w-full h-6 bg-gray-500 rounded-xl"/>
            <div class="w-full h-6 bg-gray-500 rounded-xl"/>
        </Card>
        <Card size="xl" class="grow">
            <div class="w-full h-6 bg-gray-500 rounded-xl animate-pulse"/>
        </Card>
    </div>
{/each}