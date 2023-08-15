<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card, FloatingLabelInput, Toast, Toggle, Label} from "flowbite-svelte";
    import {slide} from "svelte/transition";
    import {
        ChevronRightSolid,
        ChevronLeftSolid,
        CheckCircleOutline,
        TrashBinSolid, AngleDownOutline
    } from "flowbite-svelte-icons";
    import type {SubjectData} from "$lib/server/schedule/newDB";
    import SubjectSelectModal from "$lib/components/schedule/SubjectSelectModal.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;
    //subject関係
    $:defaultSubjects = new Map<number, SubjectData>(data.defaultSubjects.map(v => [v.id, v]));
    $:notUsedSchedule = data.notUsedSchedule;
    let schedule: {
        time: number,
        name: string,
        teacher: string,
        room: string,
        info: string,
        special: boolean,
        wasSpecial: boolean,
        id: number,
        hasNotUsed: boolean,
        unknown: boolean
    }[] = [];
    let resetSchedule: typeof schedule = [];
    const update = (d: typeof data.data) => {
        schedule = d.map(v => ({...v, hasNotUsed: notUsedSchedule.has(v.time), wasSpecial: v.special}));
        resetSchedule = d.map(v => ({...v, hasNotUsed: notUsedSchedule.has(v.time), wasSpecial: v.special}));
    }
    $:update(data.data)

    interface MsgToast {
        show: boolean,
        msg: string
    }

    let successToast: MsgToast = {
        show: false,
        msg: ""
    };
    let errorToast: MsgToast = {
        show: false,
        msg: ""
    };
    const post = () => {
        const formData = new FormData();
        formData.append("data", JSON.stringify(schedule));
        fetch("", {
            method: "POST",
            body: formData,
        }).then((res) => {
            console.log(res);
            if (res.ok) {
                successToast.show = true;
                successToast.msg = "保存しました";
                setTimeout(() => successToast.show = false, 3000);
            } else {
                throw res.status+" "+res.statusText;
            }
        }).catch((e) => {
            errorToast.show = true;
            errorToast.msg = "保存に失敗しました\n" + e.toString();
            setTimeout(() => errorToast.show = false, 3000);
        });
    }
    const changeDate = (year: number, month: number, date: number, width: number) => {
        let now = new Date(year, month - 1, date);
        now.setDate(now.getDate() + width);
        return `/schedule/edit/date/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    };
    const SelectStyle = 'text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer'

    let openSubjectModal = false;

    let subjectSelect :{
        open: boolean,
        onChange: Function,
    }={
        open: false,
        onChange: (v: SubjectData)=>{}
    }
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
        <ButtonGroup>
            <Button on:click={() => {
                schedule = resetSchedule.map(v => ({...v}));
            }}>Reset
            </Button>
            <Button on:click={post}>Save</Button>
        </ButtonGroup>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] h-fit flex flex-col gap-2 mb-2">
            {#each schedule as v}
                <div class="flex gap-1 sm:gap-2 h-fit">
                    <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                        <p class="text-2xl dark:text-white">{v.time + 1}</p>
                        <p class="text-2xl dark:text-white">{v.name}</p>
                    </Card>
                    <Card size="xl" class="grow flex flex-row !py-2 !px-4">
                        {#if !v.unknown &&(v.hasNotUsed||!v.wasSpecial)}
                            <div class="flex flex-col items-center justify-center mr-4 gap-2">
                                <Toggle bind:checked={v.special} on:change={()=>{
                                    if(!v.hasNotUsed&&!v.special)v={...notUsedSchedule.get(v.time),hasNotUsed: true,special: false};
                                    else if(!v.hasNotUsed&&v.special)v={...resetSchedule[v.time],hasNotUsed: true,special: true};
                                }} >Special</Toggle>
                            </div>
                        {/if}
                        <div class="grow overflow-hidden grid grid-cols-2 items-center gap-4 h-fit">
                            {#if v.unknown}
                                <p>休み</p>
                            {:else }
                                {#if v.special}
                                    <button class="text-left" on:click={()=>{
                                        subjectSelect.onChange=(s=>{
                                            v={...v,...s};
                                        });
                                        subjectSelect.open=true;
                                    }}>
                                        <Label defaultClass="cursor-pointer">
                                            Subject
                                            <div class="w-full h-12 flex items-center justify-between {SelectStyle}">
                                                <p>{v.id ?? -1}</p>
                                                <AngleDownOutline class="w-3 h-3 mr-4"/>
                                            </div>
                                        </Label>
                                    </button>
                                {:else }
                                    <div class="flex flex-col gap-4 mt-2">
                                        <FloatingLabelInput label="教科名" size="small" disabled bind:value={v.name}/>
                                        <FloatingLabelInput label="教員名" size="small" disabled
                                                            bind:value={v.teacher}/>
                                    </div>
                                {/if}
                                <div class="flex flex-col gap-4 mt-2">
                                    <FloatingLabelInput label="教室" size="small" disabled={!v.special}
                                                        bind:value={v.room}/>
                                    <FloatingLabelInput label="備考" size="small" disabled={!v.special}
                                                        bind:value={v.info}/>
                                </div>
                            {/if}
                        </div>
                        <div class="flex items-center justify-center">
                            {#if v.unknown}
                                <Button class="flex flex-col !p-2" on:click={()=>{
                                    if(resetSchedule[v.time]&&!resetSchedule[v.time].unknown)v=resetSchedule[v.time]
                                    else v=({
                                        time: v.time,
                                        name: "",
                                        teacher: "",
                                        room: "",
                                        info: "",
                                        special:true,
                                        unknown:false,
                                        wasSpecial: true,
                                        id:-1
                                    })
                                }}>
                                    <TrashBinSolid/>
                                    Add
                                </Button>
                            {:else }
                                <Button class="flex flex-col !p-2" on:click={()=>{
                                    if(v.time===schedule.length-1){
                                        schedule.pop();
                                        schedule=schedule;
                                        while (schedule.length>0&&schedule[schedule.length-1].unknown)schedule.pop();
                                    }
                                    else v=({
                                        time: v.time,
                                        name: "なし",
                                        teacher: "",
                                        room: "",
                                        info: "休み",
                                        special:false,
                                        wasSpecial: false,
                                        unknown:true,
                                        id:-1
                                    })}}>
                                    <TrashBinSolid/>
                                    Delete
                                </Button>
                            {/if}
                        </div>
                    </Card>
                </div>
            {/each}
            <div>
                <Button class="flex flex-col !p-2" on:click={()=>{
                                    if(resetSchedule[schedule.length]&&!resetSchedule[schedule.length].unknown)schedule.push(resetSchedule[schedule.length])
                                    else schedule.push({
                                        time: schedule.length,
                                        name: "",
                                        teacher: "",
                                        room: "",
                                        info: "",
                                        special:true,
                                        wasSpecial: false,
                                        unknown:false,
                                        hasNotUsed: false,
                                        id:-1
                                    })
                                    schedule=schedule;
                                }}>
                    <TrashBinSolid/>
                    Add
                </Button>
            </div>
        </div>
    </div>
</Card>
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
<SubjectSelectModal bind:open={subjectSelect.open} bind:onChange={subjectSelect.onChange}/>