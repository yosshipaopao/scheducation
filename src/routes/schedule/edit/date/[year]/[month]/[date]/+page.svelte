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
    $:notUsedSchedule = data.notUsedSchedule
    let schedule: {
        time: number,
        name: string,
        teacher: string,
        room: string,
        info: string,
        special: boolean,
        id: number,
        hasNotUsed: boolean,
        useNotUsed: boolean
    }[] = [];
    let defaultSchedule: typeof schedule = [];
    const update = (d: typeof data.data) => {
        schedule = d.map(v => ({...v, id: -1, hasNotUsed: notUsedSchedule.has(v.time), useNotUsed:false}));
        defaultSchedule = d.map(v => ({...v, id: -1, hasNotUsed: notUsedSchedule.has(v.time), useNotUsed:false}));
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
                    <Card size="xl" class="grow flex flex-row !p-2">
                        <div class="aspect-square h-full flex flex-col items-center justify-center">
                            <Toggle bind:checked={v.special} on:change={()=>{
                                }}>Special</Toggle>
                            {#if v.hasNotUsed&&!v.special}
                                <Toggle bind:checked={v.useNotUsed} on:change={()=>{
                                    if(v.useNotUsed){
                                        v={...notUsedSchedule.get(v.time),
                                            id: -1,
                                            hasNotUsed: true,
                                            useNotUsed: true
                                        };
                                    }else {
                                        v={...defaultSchedule[v.time],
                                            id: -1,
                                            hasNotUsed: true,
                                            useNotUsed: false
                                        };
                                    }
                                }}/>
                            {/if}
                        </div>
                        <p>{JSON.stringify(v)}</p>
                        <div class="aspect-square h-full flex items-center justify-center">
                            <Button class="flex flex-col !p-2 aspect-square">
                                <TrashBinSolid/>
                                Delete
                            </Button>
                        </div>
                    </Card>
                </div>
            {/each}
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