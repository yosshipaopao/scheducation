<script lang="ts">
    import {ButtonGroup, Button, Card, NumberInput, Toggle, Toast, Input} from "flowbite-svelte";
    import type {PageData} from "./$types";
    import {goto} from "$app/navigation";
    import {CheckCircleOutline, ChevronLeftSolid, ChevronRightSolid} from "flowbite-svelte-icons";
    import MonthSkeleton from "$lib/components/schedule/MonthSkeleton.svelte";
    import {slide} from "svelte/transition";

    export let data: PageData;
    let year = data.slug.year;
    let month = data.slug.month;
    let updated= new Map<number,{ h:boolean,i:string }>();

    const save=async ()=>{
        const form = new FormData();
        const data=Array.from(updated.entries())
        if(data.length===0) return;
        form.append("data", JSON.stringify(data));
        const res=await fetch("",{
            method:"POST",
            body:form
        });
        if (res.ok) {
            successToast = {show: true, msg: "保存しました"};
            setTimeout(() => successToast.show=false, 3000);
        } else {
            errorToast = {show: true, msg: "保存に失敗しました\n"+res.status+" "+res.statusText};
            setTimeout(() => errorToast.show=false, 3000);
        }
    }
    $: {
        if (month < 1) {
            year--;
            month = 12;
        }
        if (month > 12) {
            year++;
            month = 1;
        }
        if (year !== data.slug.year || month !== data.slug.month) goto(`/schedule/edit/month/${year}/${month}`)
    }
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    let successToast = {show: false, msg: ""};
    let errorToast = {show: false, msg: ""};
</script>
<svelte:head>
    <title>時間割編集 | Scheducation</title>
</svelte:head>
<Card size="xl" class="mt-4">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <Button on:click={() => {
            month--;
        }}>
            <ChevronLeftSolid/>
        </Button>
        <ButtonGroup>
            <NumberInput bind:value={year}/>
            <NumberInput bind:value={month}/>
        </ButtonGroup>
        <ButtonGroup>
            <Button on:click={() => {
            month++;
        }}>
                <ChevronRightSolid/>
            </Button>
            <Button on:click={save}>Save</Button>
        </ButtonGroup>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] h-fit grid grid-cols-7 gap-2 mb-2">
            {#each days as day}
                <Card class="h-8 !p-2 relative dark:text-white flex flex-col items-center justify-center">
                    <p>{day}</p>
                </Card>
            {/each}
            {#await data.streamed.data}
                <MonthSkeleton/>
            {:then value}
                {#each value as v}
                    <Card class="h-28 !p-2 relative dark:text-white flex flex-col items-center justify-center gap-2">
                        <a class="w-full h-full flex items-center justify-center" href="/schedule/edit/date/{Math.round(v.date / 10000)}/{Math.round(v.date / 100) % 100}/{v.date % 100}"><p>{Math.round(v.date / 100) % 100}/{v.date % 100}</p></a>
                        <Input size="sm" bind:value={v.info} on:change={()=>{
                            if (updated.has(v.date)) updated.get(v.date).i=v.info;
                            else updated.set(v.date,{h: v.holiday,i: v.info});
                        }}/>
                        <Toggle bind:checked={v.holiday} disabled={v.defaultHoliday} on:change={()=>{
                            if (updated.has(v.date)) updated.get(v.date).h=v.holiday;
                            else updated.set(v.date,{h: v.holiday,i: v.info});
                        }}>Holiday</Toggle>
                    </Card>
                {/each}
            {:catch error}
                <p>{error.message}</p>
            {/await}
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