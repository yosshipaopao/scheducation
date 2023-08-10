<script lang="ts">
    import {Card} from "flowbite-svelte";
</script>

{#each [...Array(7).keys()] as v}
    <div class="flex flex-col gap-1 sm:gap-2 animate-pulse">
        <Card class="h-8 !p-1 flex justify-center items-center animate-pulse">
            <div class="w-full h-6 bg-gray-500 rounded-xl"/>
        </Card>
        {#each [...Array(7).keys()] as w}
            <Card class="h-24 dark:text-white animate-pulse">
                <div class="w-full h-6 bg-gray-500 rounded-xl"/>
            </Card>
        {/each}
    </div>
{/each}