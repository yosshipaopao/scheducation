<script lang='ts'>
	import { unique } from 'drizzle-orm/pg-core';
import type { PageData } from './$types';
    import {Button, ButtonGroup, Card,Select,Indicator} from "flowbite-svelte";
    import {ChevronLeftSolid,ChervonDoubleLeftSolid,ChervonDoubleRightSolid,ChevronRightSolid} from "flowbite-svelte-icons";
	export let data: PageData;
	$:mode = data.slug.mode;
	$:year = data.slug.year;
	$:month = data.slug.month;
	$:date = data.slug.date;

    const modes = [
    {value:"month", name: "Month"},
    {value:"week", name: "Week"},
    {value:"date", name: "Date"}
  ]
</script>
<Card size="xl">
    <div class="w-full">
        <div class="w-full h-12 flex justify-between items-center mb-4">
            <ButtonGroup>
                <Button pill class="!p-2">
                    <ChervonDoubleLeftSolid/>
                </Button>
                <Button pill class="!p-2">
                    <ChevronLeftSolid/>
                </Button>
            </ButtonGroup>
            <div class="flex items-center gap-0 sm:gap-2">
                <p class="text-2xl dark:text-white">{`${year}/${month}`+`/${date}`}</p>
                <div class="w-20">
                    <Select size="sm" items={modes} bind:value={mode}/>
                </div>
            </div>
            <ButtonGroup>
                <Button pill class="!p-2">
                    <ChevronRightSolid/>
                </Button>
                <Button pill class="!p-2">
                    <ChervonDoubleRightSolid/>
                </Button>
            </ButtonGroup>
        </div>
        <div class="w-full overflow-x-scroll">
            <div class="w-[960px] grid grid-{mode=='date'?'rows':'cols'}-7 gap-1 sm:gap-2 my-2 ">
                {#if mode=="month"}
                    {#each data.data as v}
                        <Card href={`/schedule/date/${v.year}/${v.month}/${v.date}`} class="h-28 !p-4 relative dark:text-white">
                            {#if v.unique}
                                <Indicator color="red" border size="xl" placement="top-right"/>
                            {/if}
                            <p>{`${v.month}/${v.date}`}</p>
                            <p>{v.info}</p>
                        </Card>
                    {/each}
                {:else if mode=="week"}
                    {#each data.data as v}
                        <div class="flex flex-col gap-1 sm:gap-2">
                            <Card href={`/schedule/date/${v.year}/${v.month}/${v.date}`} class="h-8 !p-1 flex justify-center items-center">
                                <p class="text-lg dark:text-white">{v.date}</p>
                            </Card>
                            {#each v.data as w}
                                <Card class="h-24 dark:text-white">
                                    {JSON.stringify(w)}
                                </Card>
                            {/each}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</Card>