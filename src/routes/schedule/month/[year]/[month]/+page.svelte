<script lang="ts">
    import {Button, Card, Indicator, Select} from "flowbite-svelte";
    import type {PageData} from "./$types";
    import {goto} from "$app/navigation";
    import {
        ChevronLeftSolid,
        ChevronRightSolid
    } from "flowbite-svelte-icons";
    import MonthSkeleton from "$lib/components/schedule/MonthSkeleton.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;

    const newDate = (year: number, month: number, w: number) => {
        const d = new Date(year, month - 1 + w, 1);
        return `/schedule/month/${d.getFullYear()}/${d.getMonth() + 1}`;
    };
    const modes = [
        {value: 'month', name: 'Month'},
        {value: 'week', name: 'Week'},
        {value: 'date', name: 'Date'},
    ];
    let nextMode: string = 'month';
    const gotoNextMode = () => goto(nextMode === 'month' ? `/schedule/month/${year}/${month}` : `/schedule/${nextMode}/${year}/${month}/1`);

    const days = ["日", "月", "火", "水", "木", "金", "土"];
</script>

<svelte:head>
    <title>{year}/{month} | Month | Scheducation</title>
</svelte:head>
<Card size="xl" class="h-fit">
    <div class="h-12 flex justify-between items-center mb-4">
        <Button pill class="!p-2" href={newDate(year,month,-1)}>
            <ChevronLeftSolid/>
        </Button>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{year}/{month}</p>
            <div class="w-20 sm:w-24">
                <Select size="sm" items={modes} bind:value={nextMode}
                        on:change={gotoNextMode}/>
            </div>
        </div>
        <Button pill class="!p-2" href={newDate(year,month,1)}>
            <ChevronRightSolid/>
        </Button>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {#each days as v}
                <Card class="h-8 !p-1 flex justify-center items-center">
                    <p class="text-lg dark:text-white">{v}</p>
                </Card>
            {/each}
            {#await data.streamed.data}
                <MonthSkeleton/>
            {:then value}
                {#each value as v}
                    <Card href={`/schedule/date/${Math.round(v.date/10000)}/${Math.round(v.date%10000/100)}/${v.date%100}`}
                          class="h-28 !p-4 relative dark:text-white flex flex-col items-center justify-center {v.holiday?'dark:!text-slate-500 text-slate-200 bg-gray-100 dark:bg-gray-950':''}" color="default">
                        {#if v.special&&!v.holiday}
                            <Indicator color="red" border size="xl" placement="top-right"/>
                        {/if}
                        <p>{Math.round(v.date%10000/100)}/{v.date%100}</p>
                        <p class="text-2xl">{v.info!==""?v.info:""}</p>
                    </Card>
                {/each}
            {:catch error}
                <p>{error.message}</p>
            {/await}
        </div>
    </div>
</Card>