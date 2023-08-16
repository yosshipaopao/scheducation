<script lang="ts">
    import type {PageData} from "./$types";
    import {Button, Card, Label, Toast} from "flowbite-svelte";
    import SubjectSelectModal from "$lib/components/schedule/SubjectSelectModal.svelte";
    import {AngleDownOutline, CheckCircleOutline,TrashBinSolid,PlusSolid} from "flowbite-svelte-icons";
    import AddSubjectModal from "$lib/components/schedule/AddSubjectModal.svelte";
    import {slide} from "svelte/transition";

    export let data: PageData;

    let defaultSchedule: any[][] = [[], [], [], [], [], [], []];
    let schedule: any[][] = [[], [], [], [], [], [], []];
    const update = (d: typeof data.data) => {
        schedule = d.map(v => v.map(w => ({...w})));
        defaultSchedule = d.map(v => v.map(w => ({...w})));
    }
    $:update(data.data);

    const save=async ()=>{
        const formData = new FormData();
        formData.append("data", JSON.stringify(schedule));
        const res = await fetch("", {
            method: "POST",
            body: formData
        });
        if (res.ok) {
            successToast.msg = "保存しました";
            successToast.show = true;
            setTimeout(() => successToast.show = false, 3000);
        } else {
            errorToast.msg = "保存に失敗しました\n"+res.status+" "+res.statusText;
            errorToast.show = true;
            setTimeout(() => errorToast.show = false, 3000);
        }
    }

    const SelectStyle = 'text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer'
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    let addSubjectModal = {
        open: false,
        onChange: (subject: any) => {
            console.log(subject);
            successToast.msg = "追加しました";
            successToast.show = true;
            setTimeout(() => successToast.show = false, 3000);
        },
        onFail: (msg: string) => {
            errorToast.msg = msg;
            errorToast.show = true;
            setTimeout(() => errorToast.show = false, 3000);
        }
    }
    let subjectSelect = {
        open: false,
        onChange: (subject: any) => {
            console.log(subject);
        }
    }
    let successToast = {
        show: false,
        msg: ""
    }
    let errorToast = {
        show: false,
        msg: ""
    }
</script>
<svelte:head>
    <title>default | edit Scheducation</title>
</svelte:head>
<Card size="xl" class="h-fit">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <Button on:click={()=>addSubjectModal.open=true}>Add</Button>
        <div>
            <p>default</p>
        </div>
        <Button on:click={save}>Save</Button>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {#each schedule as v,i}
                <div class="flex flex-col gap-1 sm:gap-2">
                    <Card class="h-8 !p-1 flex justify-center items-center">{days[i]}</Card>
                    {#each v as w}
                        <Card class="h-24 !p-2 dark:text-white relative flex flex-col items-center justify-center">
                            <button class="text-left w-full" on:click={()=>{
                                        subjectSelect.onChange=(s=>{
                                            console.log(s);
                                            w={...w,...s};
                                        });
                                        subjectSelect.open=true;
                                    }}><Label defaultClass="cursor-pointer">
                                Subject
                                <div class="w-full h-12 flex items-center justify-between {SelectStyle}">
                                    <p>{w.name}</p>
                                    <AngleDownOutline class="w-3 h-3 mr-4"/>
                                </div>
                            </Label>
                            </button>
                        </Card>
                    {/each}
                    <div class="flex gap-4">
                        <Button class="w-full p-2" color="primary" size="sm" on:click={()=>{
                            v.push(defaultSchedule[i][v.length]??{name:"休み",id:-1,time:v.length,date:i});
                            v=v;
                        }}><PlusSolid/>
                        </Button>
                        <Button class="w-full p-2" color="red" size="sm" on:click={()=>{
                            v.pop();
                            while (v.length>0&&v[v.length-1].id===-1){v.pop();}
                            v=v;
                        }}><TrashBinSolid/>
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</Card>
<SubjectSelectModal bind:open={subjectSelect.open} bind:onChange={subjectSelect.onChange} restAble={true}/>
<AddSubjectModal bind:open={addSubjectModal.open} bind:onChange={addSubjectModal.onChange} bind:onFail={addSubjectModal.onFail}/>
<div class="fixed w-72 h-auto bottom-6 right-6 pointer-events-none gap-4 flex flex-col">
    <Toast transition={slide} bind:open={successToast.show} color="blue">
        <CheckCircleOutline slot="icon"/>
        {successToast.msg}
    </Toast>
    <Toast transition={slide} bind:open={errorToast.show} color="red">
        <p slot="icon">!</p>
        <p>{errorToast.msg}</p>
    </Toast>
</div>