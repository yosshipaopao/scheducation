<script lang="ts">
    import {Modal, Button, Select, Label, FloatingLabelInput} from "flowbite-svelte";

    export let open = false;
    export let subjects: any[];
    export let subjectsSelect: { value: string, name: string }[];

    let subjectForm = {
        short: "",
        name: "",
        teacher: "",
        room: "",
        memo: ""
    }
    const Submit = () => {
        const id = crypto.randomUUID();
        subjectsSelect.push({value: id, name: subjectForm.name});
        subjectsSelect = subjectsSelect;
        subjects.push({
            id: id,
            short: subjectForm.short,
            name: subjectForm.name,
            teacher: subjectForm.teacher,
            room: subjectForm.room,
            memo: subjectForm.memo
        });
        subjectForm = {
            short: "",
            name: "",
            teacher: "",
            room: "",
            memo: ""
        }
        subjects = subjects;
        open = false;
    }
</script>
<Modal title="教科を追加" bind:open={open} autoclose={false} outsideclose>
    <Label for="select-ex">
        Example
        <Select id="select-ex" underline items={subjectsSelect}/>
    </Label>
    <form on:submit|preventDefault={Submit}>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <FloatingLabelInput type="text" label="Subject Name(full)" required bind:value={subjectForm.name}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Subject Name(short)" required bind:value={subjectForm.short}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Teacher" bind:value={subjectForm.teacher}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Room" bind:value={subjectForm.room}/>
            </div>
        </div>
        <div class="mb-6">
            <FloatingLabelInput type="text" label="Memo" bind:value={subjectForm.memo}/>
        </div>
        <Button type="submit">追加</Button>
    </form>
</Modal>