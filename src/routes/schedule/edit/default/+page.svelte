<script lang="ts">
    import type {ActionData, PageData} from './$types';
    import {Button, ButtonGroup, Card, Input, Select, Toast} from "flowbite-svelte";
    import {PlusSolid,MinusSolid,CheckCircleOutline} from "flowbite-svelte-icons";
    import AddSubjectModal from "$lib/components/schedule/AddSubjectModal.svelte";
    import {slide} from "svelte/transition";

    export let data: PageData;
    let schedule = data.schedule;
    let subjects = data.subjects;
    let subjectsSelect: { name: string, value: string }[] = subjects.map((v) => ({name: v.name, value: v.id}));
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    let openSubjectModal = false;
    export let form: ActionData;
    let successToast = form?.success ?? false;
    if (successToast) setTimeout(() => successToast = false, 5000);
</script>

<Card size="xl">
    <div class="w-full">
        <div class="w-full h-12 flex justify-between items-center mb-4">
            <Button on:click={()=>openSubjectModal=true}>科目を追加</Button>
            <form method="POST">
                <input type="hidden" name="schedule" value={JSON.stringify(schedule)}/>
                <input type="hidden" name="subjects" value={JSON.stringify(subjects)}/>
                <Button type="submit">保存</Button>
            </form>
        </div>
        <div class="w-full overflow-x-scroll">
            <div class="w-[960px] grid grid-cols-7 gap-1 sm:gap-2 my-2 ">
                {#each schedule as v,i}
                    <div class="flex flex-col gap-1 sm:gap-2">
                        <Card class="h-8 !p-1 flex justify-center items-center">
                            <p class="text-lg dark:text-white">{days[i]}</p>
                        </Card>
                        {#each v as w}
                            <Card class="h-24 dark:text-white !p-2 flex flex-col items-center justify-center">
                                <Select bind:value={w.subject} items={subjectsSelect}/>
                                <Input bind:value={w.belongings}/><!-- todo belongings、ない -->
                            </Card>
                        {/each}
                        <div class="flex justify-center items-center">
                            <ButtonGroup divClass="w-full flex">
                                <Button pill={true} class="!p-2 w-full h-10" on:click={()=>{v.push({
                                    date: i,
                                    time: v.length,
                                    subject: ""
                                });v=v}}>
                                    <PlusSolid/>
                                </Button>
                                <Button pill={true} class="!p-2 w-full h-10" on:click={()=>v.length-=1}>
                                    <MinusSolid/>
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</Card>
<AddSubjectModal bind:open={openSubjectModal} bind:subjects={subjects} bind:subjectsSelect={subjectsSelect}/>
<Toast simple transition={slide} bind:open={successToast} position="bottom-right" color="gray"
       divClass='w-full max-w-xs p-4 text-gray-500 bg-white shadow dark:text-blue-400 dark:bg-blue-800 gap-3'>
    <CheckCircleOutline slot="icon"/>
    保存しました
</Toast>
