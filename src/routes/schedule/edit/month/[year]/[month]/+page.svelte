<script lang="ts">
    import {Button, ButtonGroup, Card, Input, NumberInput, Toggle} from "flowbite-svelte";
    import TrashBinSolid from "flowbite-svelte-icons/TrashBinSolid.svelte";
    import CloseSolid from "flowbite-svelte-icons/CloseSolid.svelte";
    import EditOutline from "flowbite-svelte-icons/EditOutline.svelte";

    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let dates: Date[] = [];
    const updateDays = (year: number, month: number) => {
        dates = [];
        const startDate = new Date(year, month - 1, 1);
        startDate.setDate(-startDate.getDay() + 1);
        const finalDate = new Date(year, month, 0);
        finalDate.setDate(finalDate.getDate() + 6 - finalDate.getDay());
        const total = (finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const date = new Date(startDate);
        for (let i = 0; i < total; i++) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
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
        updateDays(year, month);
    }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
</script>
<Card size="xl" class="mt-4">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <ButtonGroup>
            <NumberInput bind:value={year}/>
            <NumberInput bind:value={month}/>
        </ButtonGroup>
    </div>
    <div class="overflow-x-auto">
        <div class="w-[960px] h-fit grid grid-cols-7 gap-2 mb-2">
            {#each days as day}
                <Card class="h-8 !p-2 relative dark:text-white flex flex-col items-center justify-center">
                    <p>{day}</p>
                </Card>
            {/each}
            {#each dates as v}
                <Card class="h-28 !p-0 relative dark:text-white flex flex-col items-center justify-center gap-2">
                    <a class="w-full h-full flex items-center justify-center" href={`/schedule/edit/date/${v.getFullYear()}/${v.getMonth()+1}/${v.getDate()}`}>
                        <p class="text-2xl">{`${v.getMonth() + 1}/${v.getDate()}`}</p>
                    </a>
                    <div class="w-full h-[75%] flex items-center justify-center">
                        <Toggle>Holiday</Toggle>
                    </div>
                </Card>
            {/each}
        </div>
    </div>
</Card>