<script lang="ts">
    import {Button, FloatingLabelInput, Modal} from "flowbite-svelte";

    export let value: {
        id: number,
        name: string,
        teacher: string,
        room: string,
        info: string,
    };
    export let open: boolean = false;

    export let onChange: Function = (v: typeof value) => {
        console.log(v);
    };
    export let onFail: Function = (e: string) => {
        console.log(e);
    };

    const Submit = async () => {
        const formData = new FormData();
        formData.append("data", JSON.stringify(value));
        const res = await fetch("/schedule/edit/subject?/update", {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            open = false;
            onChange(value);
        } else {
            open = false;
            console.log(res);
            onFail(res.status + " " + res.statusText);
        }
    }
</script>

<Modal title="Edit Subject" bind:open={open} outsideclose>
    <form on:submit|preventDefault={Submit}>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <FloatingLabelInput type="text" label="Subject Name" required bind:value={value.name}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Teacher" required bind:value={value.teacher}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Room" bind:value={value.room}/>
            </div>
            <div>
                <FloatingLabelInput type="text" label="Info" bind:value={value.info}/>
            </div>
        </div>
        <Button type="submit">更新</Button>
    </form>
</Modal>