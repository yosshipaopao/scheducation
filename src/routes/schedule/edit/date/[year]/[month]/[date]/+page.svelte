<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card, Toast, Toggle} from "flowbite-svelte";
    import {slide} from "svelte/transition";
    import {
        ChevronRightSolid,
        ChevronLeftSolid,
        CheckCircleOutline,
        TrashBinSolid
    } from "flowbite-svelte-icons";
    import type {SubjectData} from "$lib/server/schedule/newDB";

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
        id: number,
        hasNotUsed: boolean,
        unknown: boolean
    }[] = [];
    let resetSchedule: typeof schedule = [];
    const update = (d: typeof data.data) => {
        schedule = d.map(v => ({...v, hasNotUsed: notUsedSchedule.has(v.time)}));
        resetSchedule = d.map(v => ({...v, hasNotUsed: notUsedSchedule.has(v.time)}));
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
                errorToast.show = true;
                errorToast.msg = `保存に失敗しました。\n${res.status} ${res.statusText}`;
                setTimeout(() => errorToast.show = false, 3000);
            }
        }).catch(() => {
            errorToast.show = true;
            errorToast.msg = "保存に失敗しました";
            setTimeout(() => errorToast.show = false, 3000);
        });
    }
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
                <div class="flex gap-1 sm:gap-2">
                    <Card class="h-24 !p-2 aspect-square flex flex-col items-center justify-center">
                        <p class="text-2xl dark:text-white">{v.time + 1}</p>
                        <p class="text-2xl dark:text-white">{v.name}</p>
                    </Card>
                    <Card size="xl" class="grow flex flex-row !py-2 !px-4">
                        <div class="flex flex-col items-center justify-center mr-4 gap-2">
                            {#if !v.unknown}
                                <Toggle bind:checked={v.special} on:change={()=>{
                                if(v.hasNotUsed&&!v.special)v={...notUsedSchedule.get(v.time),hasNotUsed: true};
                                else if(v.hasNotUsed&&v.special)v={...resetSchedule[v.time],hasNotUsed: true};
                            }} disabled={v.unknown||!v.hasNotUsed}>Special
                                </Toggle>
                            {/if}
                        </div>
                        <div class="grow overflow-hidden">
                            {#if v.unknown}
                                <p>休み</p>
                            {:else if v.special}
                                editable
                                <p>{JSON.stringify(v)}</p>
                            {:else }
                                <p>{JSON.stringify(v)}</p>
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
                                        id:-1
                                    })
                                }}>
                                    <TrashBinSolid/>
                                    Add
                                </Button>
                            {:else }
                                <Button class="flex flex-col !p-2" on:click={()=>{
                                    if(v.time===schedule.length-1){schedule.pop();schedule=schedule;}
                                    else v=({
                                        time: v.time,
                                        name: "なし",
                                        teacher: "",
                                        room: "",
                                        info: "休み",
                                        special:true,
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