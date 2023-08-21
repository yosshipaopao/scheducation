<script lang="ts">
    import {Button, ButtonGroup, Card, NumberInput} from "flowbite-svelte";
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
<svelte:head>
    <title>時間割編集 | Scheducation</title>
</svelte:head>
<div class="w-full grid grid-cols-4 gap-2">
    <Card href="/schedule/edit/default" class="!p-2 h-fit flex items-center justify-center">
        Default
    </Card>
    <Card href="/schedule/edit/subject" class="!p-2 h-fit flex items-center justify-center">
        Subject
    </Card>
</div>
<Card size="xl" class="mt-4">
    <div class="w-full h-12 flex justify-between items-center mb-4">
        <ButtonGroup>
            <NumberInput bind:value={year}/>
            <NumberInput bind:value={month}/>
            <Button href="/schedule/edit/month/{year}/{month}">EDIT</Button>
        </ButtonGroup>
    </div>
</Card>