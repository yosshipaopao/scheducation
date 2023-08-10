<script lang="ts">
    import {Modal, Button, Select, Label, Input} from "flowbite-svelte";
    export let open = false;
    export let subjects;
    export let subjectsSelect : { value: string, name: string }[];

    const subjectForm={
        short: "",
        name: "",
        teacher: "",
        room: "",
        memo: ""
    }
    const Submit= () => {
        const id = crypto.randomUUID();
        subjectsSelect.push({value: id, name: subjectForm.name});
        subjectsSelect=subjectsSelect;
        subjects.push({
            id: id,
            short: subjectForm.short,
            name: subjectForm.name,
            teacher: subjectForm.teacher,
            room: subjectForm.room,
            memo: subjectForm.memo
        });
        subjects=subjects;
        open = false;
    }
</script>
<Modal title="教科を追加" bind:open={open} autoclose={false} outsideclose>
    <Label for="select-ex" class="mb-0">Example</Label>
    <Select id="select-ex" items={subjectsSelect}/>
    <form on:submit|preventDefault={Submit}>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <Label for="shortname" class="mb-2">Subject Name(short)</Label>
                <Input type="text" id="shortname" placeholder="教科名（短）" required bind:value={subjectForm.short}/>
            </div>
            <div>
                <Label for="fullname" class="mb-2">Subject Name(full)</Label>
                <Input type="text" id="fullname" placeholder="教科名（長）" required bind:value={subjectForm.name}/>
            </div>
            <div>
                <Label for="teacher" class="mb-2">Teacher</Label>
                <Input type="text" id="teacher" placeholder="先生" bind:value={subjectForm.teacher}/>
            </div>
            <div>
                <Label for="room" class="mb-2">Room</Label>
                <Input type="text" id="room" placeholder="教室" bind:value={subjectForm.room}/>
            </div>
        </div>
        <div class="mb-6">
            <Label for="memo" class="mb-2">Memo</Label>
            <Input type="text" id="memo" placeholder="メモ" bind:value={subjectForm.memo}/>
        </div>
        <Button type="submit">追加</Button>
    </form>
</Modal>