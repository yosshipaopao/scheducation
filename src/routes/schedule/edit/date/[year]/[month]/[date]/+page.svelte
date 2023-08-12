<script lang="ts">
    import type {PageData} from "./$types"
    import {Button, ButtonGroup, Card, Input, Select, Toast, Toggle} from "flowbite-svelte";
    import ChevronRightSolid from "flowbite-svelte-icons/ChevronRightSolid.svelte";
    import ChevronLeftSolid from "flowbite-svelte-icons/ChevronLeftSolid.svelte";
    import AddSubjectModal from "$lib/components/schedule/AddSubjectModal.svelte";
    import {slide} from "svelte/transition";
    import CheckCircleOutline from "flowbite-svelte-icons/CheckCircleOutline.svelte";

    export let data: PageData;
    $:year = data.slug.year;
    $:month = data.slug.month;
    $:date = data.slug.date;
    //subject関係
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
    //schedule関係
    let schedule: any[] = [];
    let defaultSchedule: typeof data.defaultSchedule = [];
    let specialSchedule: typeof data.specialSchedule = [];
    let beforeSchedule: string;
    //わけないとwatchされてると思われて更新できてない
    const updateSchedule = (def: typeof defaultSchedule, spe: typeof specialSchedule) => {
        const tmp = def.map(v => ({...v,}));
        for (const s of spe) tmp[s.time] = {...s};
        schedule = tmp.map(v => ({
            ...v,
            special: v.special !== 0,
            unique: v.special === 2,
        }));
        defaultSchedule = def;
        specialSchedule = spe;
        beforeSchedule = JSON.stringify(schedule);
    };
    $:updateSchedule(data.defaultSchedule, data.specialSchedule);
    let openSubjectModal = false;
    interface MsgToast {
        show: boolean,
        msg: string
    }
    let successToast: MsgToast= {
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
        formData.append("special", JSON.stringify(specialSubjects));
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
            <Button on:click={()=>{schedule = JSON.parse(beforeSchedule);successToast={show:true,msg:"リセットしました。"};setTimeout(()=>successToast.show=false,3000)}}>
                Reset
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
                    </Card>
                    <Card size="xl"
                          class="grow flex flex-row items-center !p-2 {v.special?'h-48':'h-24'} transition-all">
                        <div class="flex {v.special?'flex-col mr-4 gap-4':'flex-row'}">
                            <Toggle bind:checked={v.special}>特別</Toggle>
                            {#if v.special}
                                <Toggle bind:checked={v.unique} on:change={()=>v.subject=""}>特別教科</Toggle>
                                <Select
                                        bind:value={v.subject}
                                        items={v.unique?specialSubjectsSelect:defaultSubjectsSelect}/>
                            {/if}
                        </div>
                        {#if v.special}
                            <div class="w-full h-full grid grid-rows-2 gap-2">
                                <div class="flex flex-col gap-2">
                                    <p class="text-gray-50">持ち物</p>
                                    <Input bind:value={v.belongings} class="w-full"/>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <p class="text-gray-50">メモ</p>
                                    <Input bind:value={v.memo} class="w-full"/>
                                </div>
                            </div>
                        {:else }
                            <div class="w-full">
                                <p>{defaultSubjectsSelect.find(w => w.value === v.subject)?.name ?? specialSubjectsSelect.find(w => w.value === v.subject)?.name ?? "未設定"}</p>
                            </div>
                        {/if}
                    </Card>
                </div>
            {/each}
        </div>
    </div>
</Card>
<AddSubjectModal bind:open={openSubjectModal} bind:subjects={specialSubjects}
                 bind:subjectsSelect={specialSubjectsSelect}/>
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