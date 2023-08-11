<script lang='ts'>
    import type {PageData} from './$types';
    import {Button, ButtonGroup, Card, Select, Indicator} from "flowbite-svelte";
    import {
        ChevronLeftSolid,
        ChervonDoubleLeftSolid,
        ChervonDoubleRightSolid,
        ChevronRightSolid
    } from "flowbite-svelte-icons";
    import {goto} from "$app/navigation";
    import MonthSkeleton from "$lib/components/schedule/MonthSkeleton.svelte";
    import WeekSkeleton from "$lib/components/schedule/WeekSkeleton.svelte";
    import DateSkeleton from "$lib/components/schedule/DateSkeleton.svelte";
    import scheduleScript from "$lib/schedule";

    export let data: PageData;
    $:mode = data.slug.mode;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;

    const modes = [
        {value: "month", name: "Month"},
        {value: "week", name: "Week"},
        {value: "date", name: "Date"}
    ];
    const changeDate = (mode: string, year: number, month: number, date: number, width: number) => {
        let now = new Date(year, month - 1, date);
        if (mode == 'month') now.setMonth(now.getMonth() + width);
        else now.setDate(now.getDate() + width);
        return `/schedule/${mode}/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
    };
    const days = ["日", "月", "火", "水", "木", "金", "土"];

    const getDateInfo = (w: number) => {
        if (mode === "month") {
            const now = scheduleScript.restoreDate(w);
            const date = new Date(now.year, now.month - 1, now.date);
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                date: date.getDate(),
                day: date.getDay()
            };
        }
        const base = new Date(year, month - 1, date);
        base.setDate(base.getDate() + w);
        return {
            year: base.getFullYear(),
            month: base.getMonth() + 1,
            date: base.getDate(),
            day: base.getDay()
        };
    }
</script>
<svelte:head>
    <title>{`${mode} : ${year}/${month + (mode === "month" ? "" : `/${date}`)} | Scheducation`}</title>
</svelte:head>
<Card size="xl" class="h-fit">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <ButtonGroup>
            {#if mode === "week"}
                <Button pill class="!p-2" href={changeDate(mode,year,month,date,-7)}>
                    <ChervonDoubleLeftSolid/>
                </Button>
            {/if}
            <Button pill class="!p-2" href={changeDate(mode,year,month,date,-1)}>
                <ChevronLeftSolid/>
            </Button>
        </ButtonGroup>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{`${year}/${month}` + (mode === 'month' ? '' : `/${date}`)}</p>
            <div class="w-20 sm:w-24">
                <Select size="sm" items={modes} bind:value={mode}
                        on:change={()=>goto(`/schedule/${mode}/${year}/${month}/${date}`)}/>
            </div>
        </div>
        <ButtonGroup>
            <Button pill class="!p-2" href={changeDate(mode,year,month,date,1)}>
                <ChevronRightSolid/>
            </Button>
            {#if mode === "week"}
                <Button pill class="!p-2" href={changeDate(mode,year,month,date,7)}>
                    <ChervonDoubleRightSolid/>
                </Button>
            {/if}
        </ButtonGroup>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] grid grid-{mode==='date'?'rows':'cols'}-7 gap-1 sm:gap-2 mb-2">
            {#if mode === "month"}
                {#each days as v}
                    <Card class="h-8 !p-1 flex justify-center items-center">
                        <p class="text-lg dark:text-white">{v}</p>
                    </Card>
                {/each}
            {/if}
            {#await data.streamed.data}
                {#if mode === "month"}
                    <MonthSkeleton/>
                {:else if mode === "week"}
                    <WeekSkeleton/>
                {:else}
                    <DateSkeleton/>
                {/if}
            {:then value}
                {#if mode === "month"}
                    {#each value as v}
                        <Card href={`/schedule/date/${getDateInfo(v.date).year}/${getDateInfo(v.date).month}/${getDateInfo(v.date).date}`}
                              class="h-28 !p-4 relative dark:text-white flex flex-col items-center justify-center">
                            {#if v.special !== 0}
                                <Indicator color="red" border size="xl" placement="top-right"/>
                            {/if}
                            <p class="text-2xl">{`${getDateInfo(v.date).month}/${getDateInfo(v.date).date}(${days[getDateInfo(v.date).day]})`}</p>
                            <p class="text-2xl">{v.info.length ? v.info : "通常"}</p>
                        </Card>
                    {/each}
                {:else if mode === "week"}
                    {#each value as v,i}
                        <div class="flex flex-col gap-1 sm:gap-2">
                            <Card class="h-8 !p-1 flex justify-center items-center"
                                  href={`/schedule/date/${getDateInfo(i - 3).year}/${getDateInfo(i - 3).month}/${getDateInfo(i - 3).date}`}
                            >
                                <p class="text-lg dark:text-white">{`${getDateInfo(i - 3).month}/${getDateInfo(i - 3).date}(${days[getDateInfo(i - 3).day]})`}</p>
                            </Card>
                            {#each v as w}
                                <Card class="h-24 !p-2 dark:text-white relative flex items-center justify-center">
                                    {#if w.subject.special !== 0}
                                        <Indicator color="red" border size="xl" placement="top-right"/>
                                    {/if}
                                    <p class="text-2xl">{w.time + 1}</p>
                                    <p class="text-2xl">{w.subject.short}</p>
                                </Card>
                            {/each}
                        </div>
                    {/each}
                {:else}
                    {#each value as v}
                        <div class="flex gap-1 sm:gap-2">
                            <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                                <p class="text-2xl dark:text-white">{v.time + 1}</p>
                                <p class="text-2xl dark:text-white">{v.subject.short}</p>
                            </Card>
                            <Card size="xl" class="grow">
                                <p>{JSON.stringify(v)}</p>
                            </Card>
                        </div>
                    {/each}
                {/if}
            {:catch error}
                <p>{error.message}</p>
            {/await}
        </div>
    </div>
</Card>