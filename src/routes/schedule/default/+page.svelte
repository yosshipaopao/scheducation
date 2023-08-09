<script lang="ts">
    import type {PageData} from './$types';
    import {Button, ButtonGroup, Card, Select} from "flowbite-svelte";
    import PlusSolid from "flowbite-svelte-icons/PlusSolid.svelte";
    import MinusSolid from "flowbite-svelte-icons/MinusSolid.svelte";
    import AddSubjectModal from "$lib/components/schedule/AddSubjectModal.svelte";

    export let data: PageData;
    const schedule = data.schedule;
    let subjects = data.subjects;
    let subjectsSelect:{name:string,value:string}[] = [];
    for(const key in subjects)subjectsSelect.push({name:subjects[key].name,value:key});
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    let openSubjectModal = false;
</script>

<Card size="xl" class="mt-4">
    <div class="w-full">
        <div class="w-full h-12 flex justify-between items-center mb-4">
            <Button on:click={()=>openSubjectModal=true}>科目を追加</Button>
            <Button>保存</Button>
        </div>
        <div class="w-full overflow-x-scroll">
            <div class="w-[960px] grid grid-cols-7 gap-1 sm:gap-2 my-2 ">
                {#each schedule as v,i}
                    <div class="flex flex-col gap-1 sm:gap-2">
                        <Card class="h-8 !p-1 flex justify-center items-center">
                            <p class="text-lg dark:text-white">{days[i]}</p>
                        </Card>
                        {#each v as w,i}
                            <Card class="h-24 dark:text-white !p-2 flex flex-col items-center justify-center">
                                <p class="text-2xl dark:text-white">{`${i+1}時間`}</p>
                                <Select bind:value={w.subject} items={subjectsSelect}/>
                            </Card>
                        {/each}
                        <div class="flex justify-center items-center">
                            <ButtonGroup divClass="w-full flex">
                                <Button pill={true} class="!p-2 w-full h-10" on:click={()=>{v.push({});v=v}}>
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
```