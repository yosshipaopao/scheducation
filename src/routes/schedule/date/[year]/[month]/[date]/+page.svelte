<script lang="ts">
    import type {PageData} from "./$types";
    import {goto} from "$app/navigation";
    import {Button, Card, Indicator, Select} from "flowbite-svelte";
    import {
        ChevronLeftSolid,
        ChevronRightSolid
    } from "flowbite-svelte-icons";
    import DateSkeleton from "$lib/components/schedule/DateSkeleton.svelte";

    export let data: PageData;

    $: year = data.slug.year;
    $: month = data.slug.month;
    $: date = data.slug.date;


    const newDate = (year: number, month: number, date: number, w: number) => {
        const d = new Date(year, month - 1, date);
        d.setDate(d.getDate() + w);
        return `/schedule/date/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };
    const modes = [
        {value: 'month', name: 'Month'},
        {value: 'week', name: 'Week'},
        {value: 'date', name: 'Date'},
    ];
    let nextMode: string = 'date';
    const gotoNextMode = () => goto(nextMode === 'month' ? `/schedule/month/${year}/${month}` : `/schedule/${nextMode}/${year}/${month}/${date}`);

    const days = ["日", "月", "火", "水", "木", "金", "土"];
</script>
<svelte:head>
    <title>{year}/{month}/{date} | Date | Scheducation</title>
</svelte:head>
<Card size="xl" class="h-fit">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <Button pill class="!p-2" href={newDate(year,month,date,-1)}>
            <ChevronLeftSolid/>
        </Button>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{year}/{month}/{date}</p>
            <div class="w-20 sm:w-24">
                <Select size="sm" items={modes} bind:value={nextMode}
                        on:change={gotoNextMode}/>
            </div>
        </div>
        <Button pill class="!p-2" href={newDate(year,month,date,1)}>
            <ChevronRightSolid/>
        </Button>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] grid grid-rows-7 gap-1 sm:gap-2 my-2">
            {#await data.streamed.data}
                <DateSkeleton/>
            {:then value}
                {#each value as v}
                    <div class="flex gap-1 sm:gap-2">
                        <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center relative">
                            {#if v.special}
                                <Indicator color="red" border size="xl" placement="top-right"/>
                            {/if}
                            <p class="text-2xl dark:text-white">{v.time + 1}</p>
                            <p class="text-2xl dark:text-white">{v.name}</p>
                        </Card>
                        <Card size="xl" class="grow grid grid-cols-2 items-center">
                            <div>
                                <p>先生:{v.teacher}</p>
                                <p>教室:{v.room}</p>
                            </div>
                            <div>
                                <p>備考:{v.info}</p>
                            </div>
                        </Card>
                    </div>
                {/each}
            {:catch error}
                <p>{error.message}</p>
            {/await}
        </div>
    </div>
</Card>