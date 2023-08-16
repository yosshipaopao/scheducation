<script lang="ts">
    import type {PageData} from "./$types";
    import {goto} from "$app/navigation";
    import {Button, ButtonGroup, Card, Indicator, Select} from "flowbite-svelte";
    import {
        ChervonDoubleLeftSolid,
        ChervonDoubleRightSolid,
        ChevronLeftSolid,
        ChevronRightSolid
    } from "flowbite-svelte-icons";
    import WeekSkeleton from "$lib/components/schedule/WeekSkeleton.svelte";

    export let data: PageData;

    $: year = data.slug.year;
    $: month = data.slug.month;
    $: date = data.slug.date;


    const newDate = (year: number, month: number, date: number, w: number) => {
        const d = new Date(year, month - 1, date);
        d.setDate(d.getDate() + w);
        return `/schedule/week/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };
    const modes = [
        {value: 'month', name: 'Month'},
        {value: 'week', name: 'Week'},
        {value: 'date', name: 'Date'},
    ];
    let nextMode: string = 'week';
    const gotoNextMode = () => goto(nextMode === 'month' ? `/schedule/month/${year}/${month}` : `/schedule/${nextMode}/${year}/${month}/${date}`);

    const days = ["日", "月", "火", "水", "木", "金", "土"];
</script>
<svelte:head>
    <title>{year}/{month}/{date} | Week | Scheducation</title>
</svelte:head>
<Card size="xl" class="h-fit">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <ButtonGroup>
            <Button pill class="!p-2" href={newDate(year,month,date,-7)}>
                <ChervonDoubleLeftSolid/>
            </Button>
            <Button pill class="!p-2" href={newDate(year,month,date,-1)}>
                <ChevronLeftSolid/>
            </Button>
        </ButtonGroup>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{year}/{month}/{date}</p>
            <div class="w-20 sm:w-24">
                <Select size="sm" items={modes} bind:value={nextMode}
                        on:change={gotoNextMode}/>
            </div>
        </div>
        <ButtonGroup>
            <Button pill class="!p-2" href={newDate(year,month,date,1)}>
                <ChevronRightSolid/>
            </Button>
            <Button pill class="!p-2" href={newDate(year,month,date,7)}>
                <ChervonDoubleRightSolid/>
            </Button>
        </ButtonGroup>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {#await data.streamed.data}
                <WeekSkeleton/>
            {:then value}
                {#each value as v,i}
                    <div class="flex flex-col gap-1 sm:gap-2">
                        <Card class="h-8 !p-1 flex justify-center items-center"
                              href={(()=>{
                                const d = new Date(year, month - 1, date);
                                d.setDate(d.getDate()-3 + i);
                                return `/schedule/date/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                            })()}>{(() => {
                            const d = new Date(year, month - 1, date);
                            d.setDate(d.getDate() - 3 + i);
                            return days[d.getDay()];
                        })()}</Card>
                        {#each v as w}
                            <Card class="h-24 !p-2 dark:text-white relative flex items-center justify-center">
                                    {#if w.special}
                                        <Indicator color="red" border size="xl" placement="top-right"/>
                                    {/if}
                                {JSON.stringify(w)}
                            </Card>
                        {/each}
                    </div>
                {/each}
            {:catch error}
                <p>{error.message}</p>
            {/await}
        </div>
    </div>
</Card>