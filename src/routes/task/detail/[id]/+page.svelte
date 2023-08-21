<script lang="ts">

    import {Button, Card, Toast} from "flowbite-svelte";
    import {slide} from "svelte/transition";
    import {CheckCircleOutline} from "flowbite-svelte-icons";

    export let data;
    const done = async (id: string) => {
        const formData = new FormData();
        formData.append("id", id);
        const res = await fetch("/task/?/done", {
            method: "POST",
            body: formData
        })
        if (res.ok) {
            successToast.show = true;
            successToast.msg = "提出しました";
            setTimeout(() => {
                successToast.show = false;
            }, 3000)

        } else {
            errorToast.show = true;
            errorToast.msg = "提出に失敗しました\n" + res.status + " " + res.statusText;
            setTimeout(() => {
                errorToast.show = false;
            }, 3000)
        }
    }


    let errorToast = {
        show: false,
        msg: ''
    }
    let successToast = {
        show: false,
        msg: ''
    }
</script>

<svelte:head>
    <title>TaskDetail | Scheducation</title>
</svelte:head>
<Card size="xl" class="w-full flex flex-row">
    {#await data.streamed.data}
        <div >Loading...</div>
    {:then v}
        <div class="w-full">
            <p class="text-3xl">{v.title}</p>
            <p class="text-xl">期限: {Math.round(v.limitDate / 10000)}
                /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
            <p class="text-sm">{v.description}</p>

        </div>
        <div class="w-40 md:w-80"><Button on:click={()=>done(v.id)}>Done</Button></div>
    {:catch error}
        <div >Error: {error.message}</div>
    {/await}
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