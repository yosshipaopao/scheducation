<script lang="ts">
    import {
        AccordionItem,
        Accordion,
        Card,
        Button,
        Modal,
        Input,
        Label,
        Textarea,
        Select,
        Toast
    } from 'flowbite-svelte';
    import {CheckCircleOutline, ClipboardOutline} from "flowbite-svelte-icons";
    import {slide} from "svelte/transition";

    export let data;

    let openAddModal = false;

    let addTaskInput = {
        type: "class",
        title: "",
        deadline: "",
        time: 0,
        description: ""
    }
    const add = async () => {
        console.log(addTaskInput);
        if (addTaskInput.deadline === "") {
            errorToast.show = true;
            errorToast.msg = "期限を入力してください";
            setTimeout(() => {
                errorToast.show = false;
            }, 3000)
            return;
        }
        if (addTaskInput.title === "") {
            errorToast.show = true;
            errorToast.msg = "タスク名を入力してください";
            setTimeout(() => {
                errorToast.show = false;
            }, 3000)
            return;
        }
        const formData = new FormData();
        formData.append("type", addTaskInput.type);
        formData.append("title", addTaskInput.title);
        formData.append("deadline", addTaskInput.deadline);
        formData.append("time", addTaskInput.time.toString());
        formData.append("description", addTaskInput.description);
        const res = await fetch("?/add", {
            method: "POST",
            body: formData
        })
        if (res.ok) {
            successToast.show = true;
            successToast.msg = "追加しました";
            setTimeout(() => {
                successToast.show = false;
            }, 3000)

        } else {
            errorToast.show = true;
            errorToast.msg = "追加に失敗しました\n" + res.status + " " + res.statusText;
            setTimeout(() => {
                errorToast.show = false;
            }, 3000)
        }
        addTaskInput = {
            type: "class",
            title: "",
            deadline: "",
            time: 0,
            description: ""
        }
    }
    const done = async (id: string) => {
        const formData = new FormData();
        formData.append("id", id);
        const res = await fetch("?/done", {
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
    <title>Task | Scheducation</title>
</svelte:head>
<Card size="xl" class="w-full h-16 flex flex-row items-center justify-between !p-2 mb-10">
    <Button on:click={() => openAddModal=true}>追加</Button>
    <p>Task</p>
    <Button on:click={() => {}}></Button>
</Card>
{#await data.streamed.data}
    <p>loading...</p>
{:then value}
    <Accordion multiple>
        {#if value.unSubmitted.length > 0}
            <AccordionItem open>
                <span slot="header">未提出</span>
                <div class="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                    {#each value.unSubmitted as v}
                        <Card size=xl horizontal class="w-full !max-w-full flex flex-row items-center !p-2" href="/task/detail/{v.id}">
                            <ClipboardOutline class="m-4"/>
                            <div class="flex flex-col gap-2">
                                <p class="text-xl">{v.title}</p>
                                <p class="text-sm">期限: {Math.round(v.limitDate / 10000)}
                                    /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
                            </div>
                            <div class="flex ml-auto">
                                <Button on:click={()=>done(v.id)}>提出</Button>
                            </div>
                        </Card>
                    {/each}
                </div>
            </AccordionItem>
        {/if}

        <AccordionItem open={value.today.length>0}>
            <span slot="header">今日</span>
            <div class="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                {#each value.today as v}
                    <Card size=xl horizontal class="w-full !max-w-full flex flex-row items-center !p-2" href="/task/detail/{v.id}">
                        <ClipboardOutline class="m-4"/>
                        <div class="flex flex-col gap-2">
                            <p class="text-xl">{v.title}</p>
                            <p class="text-sm">期限: {Math.round(v.limitDate / 10000)}
                                /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
                        </div>
                        <div class="flex ml-auto">
                            <Button on:click={()=>done(v.id)}>提出</Button>
                        </div>
                    </Card>
                {/each}
            </div>
        </AccordionItem>
        <AccordionItem open={value.thisWeek.length>0}>
            <span slot="header">今週</span>
            <div class="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                {#each value.thisWeek as v}
                    <Card size=xl horizontal class="w-full !max-w-full flex flex-row items-center !p-2" href="/task/detail/{v.id}">
                        <ClipboardOutline class="m-4"/>
                        <div class="flex flex-col gap-2">
                            <p class="text-xl">{v.title}</p>
                            <p class="text-sm">期限: {Math.round(v.limitDate / 10000)}
                                /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
                        </div>
                        <div class="flex ml-auto">
                            <Button on:click={()=>done(v.id)}>提出</Button>
                        </div>
                    </Card>
                {/each}
            </div>
        </AccordionItem>
        <AccordionItem open={value.thisMonth.length>0}>
            <span slot="header">今月</span>
            <div class="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                {#each value.thisMonth as v}
                    <Card size=xl horizontal class="w-full !max-w-full flex flex-row items-center !p-2" href="/task/detail/{v.id}">
                        <ClipboardOutline class="m-4"/>
                        <div class="flex flex-col gap-2">
                            <p class="text-xl">{v.title}</p>
                            <p class="text-sm">期限: {Math.round(v.limitDate / 10000)}
                                /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
                        </div>
                        <div class="flex ml-auto">
                            <Button on:click={()=>done(v.id)}>提出</Button>
                        </div>
                    </Card>
                {/each}
            </div>
        </AccordionItem>
        <AccordionItem open={value.afterThisMonth.length>0}>
            <span slot="header">それ以降</span>
            <div class="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                {#each value.afterThisMonth as v}
                    <Card size=xl horizontal class="w-full !max-w-full flex flex-row items-center !p-2" href="/task/detail/{v.id}">
                        <ClipboardOutline class="m-4"/>
                        <div class="flex flex-col gap-2">
                            <p class="text-xl">{v.title}</p>
                            <p class="text-sm">期限: {Math.round(v.limitDate / 10000)}
                                /{Math.round(v.limitDate % 10000 / 100)}/{v.limitDate % 100} : {v.limitTime}</p>
                        </div>
                        <div class="flex ml-auto">
                            <Button on:click={()=>done(v.id)}>提出</Button>
                        </div>
                    </Card>
                {/each}
            </div>
        </AccordionItem>
    </Accordion>
{:catch error}
    <p>{error}</p>
{/await}
<Modal bind:open={openAddModal} title="Add Task" autoclose outsideclose>
    <Select label="タスクの種類" items={[{value:"class",name:"クラス"},{value: "user",name:"Only you"}]}
            bind:value={addTaskInput.type}/>
    <Label>
        <p>タスク名</p>
        <Input type="text" bind:value={addTaskInput.title}/>
    </Label>
    <Label>
        <p>期限</p>
        <Input type="date" bind:value={addTaskInput.deadline}/>
    </Label>
    <Label>
        <p>期限</p>
        <Input type="number" bind:value={addTaskInput.time}/>
    </Label>
    <Label>
        <p>詳細</p>
        <Textarea bind:value={addTaskInput.description}/>
    </Label>
    <div class="flex flex-row gap-2 justify-end">
        <Button>キャンセル</Button>
        <Button on:click={add}>追加
        </Button>
    </div>
</Modal>
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