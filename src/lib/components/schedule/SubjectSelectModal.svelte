<script lang="ts">
    import {Button, ButtonGroup, Input, InputAddon, Modal, Search, Spinner} from 'flowbite-svelte';
    import {SearchOutline} from "flowbite-svelte-icons";
    import type {SubjectData} from "$lib/server/schedule/DB";

    export let open: boolean = false;
    export let restAble: boolean = false;
    export let onChange: (value: SubjectData) => void;

    let q: string = '';
    const reset = (o: boolean) => q = '';
    $:reset(open);

    let timeout: NodeJS.Timeout;
    const search = async (query: string, offset: number) => {
        if (query === '') return new Promise<any>((resolve, reject) => reject('empty query'))
        return new Promise<any[]>((resolve) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (query === q) {
                    const data = await fetch(`/schedule/edit/api/search?q=${query}&offset=${offset}`);
                    resolve(await data.json());
                }
            }, 500);
        })
    }
</script>
<Modal title="Select Subject" bind:open={open} autoclose={false} outsideclose>
    <ButtonGroup class="w-full" size="sm">
        <Search bind:value={q}/>
        <Button on:click={()=>{q=""}}>
            Clear
        </Button>
    </ButtonGroup>
    <div class="w-full h-64 overflow-y-auto">
        {#await search(q, 0)}
            <div class="w-full h-full flex justify-center items-center">
                <Spinner size="10"/>
            </div>
        {:then v}
            <div class="h-fit w-full flex flex-row gap-4">
                {#each v as w}
                    <button class="grid grid-cols-2 w-full h-fit border border-white rounded-xl text-left p-2 bg-gray-500 text-white"
                            on:click={()=>{
                    onChange(w)
                    open = false;
                }}>
                        <div>
                            <p>name:{w.name}</p>
                            <p>teacher:{w.teacher}</p>
                        </div>
                        <div>
                            <p>room:{w.room}</p>
                            <p>info:{w.info}</p>
                        </div>
                    </button>
                {/each}
            </div>
        {:catch error}
            {#if restAble}
                <button class="grid grid-cols-2 w-full h-fit border border-white rounded-xl text-left p-2 bg-gray-500 text-white"
                        on:click={()=>{
                    onChange({
                        name: "休み",
                        id:-1,
                        teacher: "",
                        room: "",
                        info: ""
                    })
                    open = false;
                }}>
                    休み
                </button>
            {/if}
            <p>{error}</p>
        {/await}
    </div>
</Modal>