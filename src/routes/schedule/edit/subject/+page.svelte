<script lang="ts">
    import {
        Button,
        ButtonGroup,
        Card,
        Input,
        InputAddon,
        Spinner,
        Toast
    } from "flowbite-svelte";
    import {slide} from "svelte/transition";
    import {CheckSolid, SearchOutline} from "flowbite-svelte-icons";


    let q = '';
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
            }, 1000);
        })
    }

    const del=async (id:number)=>{
        const form=new FormData();
        form.append("id",id.toString());
        const res=await fetch("?/delete",{method:"POST",body:form});
        if(res.ok){
            successToast.show=true;
            successToast.msg="success deleted"
        }else{
            errorToast.show=true;
            errorToast.msg="failed to delete\n"+res.status+" "+res.statusText;
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
<Card size="xl" class="flex flex-col items-center gap-2">
    <ButtonGroup class="w-full" size="sm">
        <InputAddon>
            <SearchOutline/>
            Search
        </InputAddon>
        <Input bind:value={q}/>
        <Button on:click={()=>{q=""}}>
            Clear
        </Button>
    </ButtonGroup>
    <div class="w-full h-[60vh] overflow-y-auto mt-10">
        {#await search(q, 0)}
            <div class="w-full h-full flex justify-center items-center">
                <Spinner size="10"/>
            </div>
        {:then v}
            <div class="h-fit w-full flex flex-row gap-4">
                {#each v as w}
                    <Card size="xl" class="flex flex-row items-center w-full !p-2">
                        <div class="grid grid-cols-2 w-full">
                            <div>
                                <p>name:{w.name}</p>
                                <p>teacher:{w.teacher}</p>
                            </div>
                            <div>
                                <p>room:{w.room}</p>
                                <p>info:{w.info}</p>
                            </div>
                        </div>
                        <div class="w-24 flex flex-col gap-2">
                            <Button size="sm">edit</Button>
                            <Button size="sm" on:click={()=>del(w.id)}>delete</Button>
                        </div>
                    </Card>
                {/each}
            </div>
        {:catch error}
            <p>{error}</p>
        {/await}
    </div>
    <div class="w-full flex justify-end">
        <Button class="btn btn-primary">
            Add Subject
        </Button>
    </div>
</Card>
<Toast class="fixed" position="bottom-right" transition={slide} bind:open={errorToast.show} color="red">
    <p slot="icon">!</p>
    {errorToast.msg}
</Toast>
<Toast class="fixed" position="bottom-right" transition={slide} bind:open={successToast.show} color="blue">
    <CheckSolid slot="icon"/>
    {successToast.msg}
</Toast>