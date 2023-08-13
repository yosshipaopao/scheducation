<script lang="ts">
    import {Button, Card, FloatingLabelInput, Input, Label, Modal, Spinner, Toast} from "flowbite-svelte";
    import {slide} from "svelte/transition";
    import EditOutline from 'flowbite-svelte-icons/EditOutline.svelte';
    import CheckSolid from "flowbite-svelte-icons/CheckSolid.svelte";
    import TrashBinSolid from "flowbite-svelte-icons/TrashBinSolid.svelte";
    export let data;
    let subjects = data.subjects;
    const newSubjectTemplate = () => {
        return {
            id: crypto.randomUUID() as string,
            name: "",
            short: "",
            teacher: "",
            room: "",
            memo: "",
        };
    };
    let newSubject = newSubjectTemplate();
    let editingSubject = newSubject;
    let editType = "Add";
    let newSubjectModal = false;
    const addSubject = async (type: string) => {
        running = true;
        const sendData = new FormData();
        sendData.append("type", type);
        sendData.append("subject", JSON.stringify(editingSubject));
        try {
            const res = await fetch("", {
                method: "POST",
                body: sendData,
            });
            if (res.ok) {
                successToast.show = true;
                successToast.msg = "Success";
                if (type === "Add") {
                    subjects.push(editingSubject);
                    subjects=subjects
                    editingSubject = newSubjectTemplate();
                }else {
                    subjects=subjects
                }
                setTimeout(() => {
                    successToast.show = false;
                }, 5000);
            } else {
                errorToast.show = true;
                errorToast.msg = res.statusText + " " + res.status;
                setTimeout(() => {
                    errorToast.show = false;
                }, 5000);
            }
        } catch (e) {
            console.error(e);
            errorToast.show = true;
            errorToast.msg = e.error??e.statusText + " " + e.status
            setTimeout(() => {
                errorToast.show = false;
            }, 5000);
        } finally {
            running = false;
        }
        newSubjectModal = false;
        running = false;
    }
    let running = false;
    const errorToast = {
        show: false,
        msg: "Error",
    }
    const successToast = {
        show: false,
        msg: "Success",
    }
    const deleteSubject=(id:string)=>{
        const sendData = new FormData();
        sendData.append("type", "Delete");
        sendData.append("subject", JSON.stringify({id}));
        fetch("", {
            method: "POST",
            body: sendData,
        }).then(res=>{
            if (res.ok) {
                successToast.show = true;
                successToast.msg = "Success";
                subjects=subjects.filter(subject=>subject.id!==id);
                setTimeout(() => {
                    successToast.show = false;
                }, 5000);
            } else throw res;
        }).catch(e=>{
            console.error(e);
            errorToast.show = true;
            errorToast.msg = e.error??e.statusText + " " + e.status;
            setTimeout(() => {
                errorToast.show = false;
            }, 5000);
        })
    }
</script>
<Card size="xl" class="flex flex-col items-center gap-2">
    {#each subjects as subject}
        <Card size="xl" class="w-full flex flex-row justify-center items-center">
            <div class="flex w-full flex-col">
                <div class="w-full grid grid-cols-2">
                    <div>
                        <h3>Name:{subject.name}</h3>
                        <p>ShortName:{subject.short}</p>
                    </div>
                    <div>
                        <p>Teacher:{subject.teacher}</p>
                        <p>Room:{subject.room}</p>
                    </div>
                </div>
                <p>Memo:{subject.memo}</p>
            </div>
            <div class="flex flex-col gap-2">
                <Button class="ml-auto" on:click={()=>{editType="Edit";editingSubject=subject;newSubjectModal=true}}>
                    <EditOutline/>
                </Button>
                <Button class="ml-auto" on:click={()=>deleteSubject(subject.id)}>
                    <TrashBinSolid/>
                </Button>
            </div>
        </Card>
    {/each}
    <div class="w-full flex justify-end">
        <Button class="btn btn-primary" on:click={()=>{editType="Add";editingSubject=newSubject;newSubjectModal=true}}>
            Add Subject
        </Button>
    </div>
</Card>
<Modal title="{editType} new Subject" bind:open={newSubjectModal} outsideclose={!running}>
    {#if running}
        <div class="flex justify-center items-center h-64">
            <Spinner size="24"/>
        </div>
    {:else }
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <FloatingLabelInput label="教科名" required bind:value={editingSubject.name}/>
            </div>
            <div>
                <FloatingLabelInput label="教科名（短）" required bind:value={editingSubject.short}/>
            </div>
            <div>
                <FloatingLabelInput label="担当教員" bind:value={editingSubject.teacher}/>
            </div>
            <div>
                <FloatingLabelInput label="教室" bind:value={editingSubject.room}/>
            </div>
        </div>
        <div>
            <FloatingLabelInput label="メモ" bind:value={editingSubject.memo}/>
        </div>
    {/if}
    <svelte:fragment slot='footer'>
        <Button class="ml-auto"
                on:click={() => addSubject(editType)}
                disabled={running}>{editType === "Add" ? "Add" : "Update"}</Button>
        <Button color="alternative" disabled={running} on:click={()=>newSubjectModal=false}>Close</Button>
    </svelte:fragment>
</Modal>
<Toast class="fixed" position="bottom-right" transition={slide} bind:open={errorToast.show} color="red">
    <p slot="icon">!</p>
    {errorToast.msg}
</Toast>
<Toast class="fixed" position="bottom-right" transition={slide} bind:open={successToast.show} color="blue">
    <CheckSolid slot="icon"/>
    {successToast.msg}
</Toast>