<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card, Checkbox, Select, Toast, Toggle} from "flowbite-svelte";
    import ChevronRightSolid from "flowbite-svelte-icons/ChevronRightSolid.svelte";
    import ChevronLeftSolid from "flowbite-svelte-icons/ChevronLeftSolid.svelte";
    import AddSubjectModal from "$lib/components/schedule/AddSubjectModal.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;

    let defaultSubjects = data.defaultSubjects;
    let defaultSubjectsSelect: {
        name: string,
        value: string
    }[] = defaultSubjects.map((v) => ({name: v.name, value: v.id}));
    let specialSubjects = data.specialSubjects;
    let specialSubjectsSelect: {
        name: string,
        value: string
    }[] = specialSubjects.map((v) => ({name: v.name, value: v.id}));
    let schedule = data.data.map(v => ({
        time: v.time,
        subject: v.subject.id,
        belongings: v.belongings,
        memo: v.memo,
        special: v.special !== 0
    }));
    const changeDate = (year: number, month: number, date: number, width: number) => {
        let now = new Date(year, month - 1, date);
        now.setDate(now.getDate() + width);
        return `/schedule/edit/date/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    };
    let openSubjectModal = false;
</script>
<Card size="xl">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <Button on:click={()=>openSubjectModal=true}>追加</Button>
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
        {#each schedule as v}
            <div class="flex gap-1 sm:gap-2">
                <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                    <p class="text-2xl dark:text-white">{v.time + 1}</p>
                </Card>
                <Card size="xl" class="grow flex flex-row">
                    <Toggle bind:checked={v.special}>特別</Toggle>
                    <div class="w-full flex flex-row gap-2">
                        <Select defaultClass='text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 {v.special?"w-24":"w-full"} transition-all' bind:value={v.subject} items={v.special?specialSubjectsSelect:defaultSubjectsSelect}/>
                        {#if v.special}
                            <div class="w-full bg-gray-500"/>
                        {/if}
                    </div>
                </Card>
            </div>
        {/each}
    </div>
</Card>
<AddSubjectModal bind:open={openSubjectModal} bind:subjects={specialSubjects}
                 bind:subjectsSelect={specialSubjectsSelect}/>
