<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card, Select} from "flowbite-svelte";
    import DateSkeleton from "$lib/components/schedule/DateSkeleton.svelte";
    import ChevronRightSolid from "flowbite-svelte-icons/ChevronRightSolid.svelte";
    import ChevronLeftSolid from "flowbite-svelte-icons/ChevronLeftSolid.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;

    let subjects = data.subjects;
    let subjectsSelect:{name:string,value:string}[] = [];
    for(const key in subjects)subjectsSelect.push({name:subjects[key].name,value:key});
    const changeDate = (year: number, month: number, date: number, width: number) => {
        let now = new Date(year, month - 1, date);
        now.setDate(now.getDate() + width);
        return `/schedule/edit/date/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    };
</script>
<Card size="xl">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <ButtonGroup>
            <Button pill class="!p-2" href={changeDate(year,month,date,-1)}>
                <ChevronLeftSolid/>
            </Button>
        </ButtonGroup>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{`${year}/${month}/${date}`}</p>
        </div>
        <ButtonGroup>
            <Button pill class="!p-2" href={changeDate(year,month,date,1)}>
                <ChevronRightSolid/>
            </Button>
        </ButtonGroup>
    </div>
    <div class="w-full overflow-x-scroll">
        {#each data.data as v}
            <div class="flex gap-1 sm:gap-2">
                <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                    <p class="text-2xl dark:text-white">{v.hour}</p>
                    <p class="text-2xl dark:text-white">{v.subject.short}</p>
                </Card>
                <Card size="xl" class="grow">
                    <p>{JSON.stringify(v)}</p>
                </Card>
            </div>
        {/each}
    </div>
</Card>
