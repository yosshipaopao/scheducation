<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card} from "flowbite-svelte";
    import ChevronRightSolid from "flowbite-svelte-icons/ChevronRightSolid.svelte";
    import ChevronLeftSolid from "flowbite-svelte-icons/ChevronLeftSolid.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;

    let subjects = data.subjects;
    let subjectsSelect:{name:string,value:string}[] = subjects.map((v)=>({name:v.name,value:v.id}));
    const changeDate = (year: number, month: number, date: number, width: number) => {
        let now = new Date(year, month - 1, date);
        now.setDate(now.getDate() + width);
        return `/schedule/edit/date/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    };
</script>
<Card size="xl">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <Button>追加</Button>
            <Button pill class="!p-2" href={changeDate(year,month,date,-1)}>
                <ChevronLeftSolid/>
            </Button>
        <div class="flex items-center gap-0 sm:gap-2">
            <p class="text-2xl dark:text-white">{`${year}/${month}/${date}`}</p>
        </div>
            <Button pill class="!p-2" href={changeDate(year,month,date,1)}>
                <ChevronRightSolid/>
            </Button>
        <Button>Save</Button>
    </div>
    <div class="w-full h-fit flex flex-col gap-2">
        {#each data.data as v}
            <div class="flex gap-1 sm:gap-2">
                <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                    <p class="text-2xl dark:text-white">{v.time+1}</p>
                    <p class="text-2xl dark:text-white">{v.subject.short}</p>
                </Card>
                <Card size="xl" class="grow">
                    <p>{JSON.stringify(v)}</p>
                </Card>
            </div>
        {/each}
    </div>
</Card>
