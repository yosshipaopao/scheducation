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
</script>
<Card size="xl" class="mt-4">
    <div class="w-full">
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
                    <Select size="sm" items={modes} bind:value={mode} on:change={()=>goto(`/schedule/${mode}/${year}/${month}/${date}`)}/>
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
        <div class="w-full overflow-x-scroll">
            <div class="w-[960px] grid grid-{mode==='date'?'rows':'cols'}-7 gap-1 sm:gap-2 my-2 ">
                {#each data.data as v}
                    {#if mode === "month"}
                        <Card href={`/schedule/date/${v.year}/${v.month}/${v.date}`}
                              class="h-28 !p-4 relative dark:text-white">
                            {#if v.unique}
                                <Indicator color="red" border size="xl" placement="top-right"/>
                            {/if}
                            <p>{`${v.month}/${v.date}`}</p>
                            <p>{v.info}</p>
                        </Card>
                    {:else if mode === "week"}
                        <div class="flex flex-col gap-1 sm:gap-2">
                            <Card href={`/schedule/date/${v.year}/${v.month}/${v.date}`}
                                  class="h-8 !p-1 flex justify-center items-center">
                                <p class="text-lg dark:text-white">{v.date}</p>
                            </Card>
                            {#each v.data as w}
                                <Card class="h-24 dark:text-white">
                                    {JSON.stringify(w)}
                                </Card>
                            {/each}
                        </div>
                    {:else}
                        <div class="flex gap-1 sm:gap-2">
                            <Card class="h-24 aspect-square flex flex-col items-center justify-center">
                                <p class="text-2xl dark:text-white">{v.hour}</p>
                                <p class="text-2xl dark:text-white">{v.subject}</p>
                            </Card>
                            <Card size="xl" class="grow">
                                <p>{JSON.stringify(v)}</p>
                            </Card>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
</Card>