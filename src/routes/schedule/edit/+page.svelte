<script lang="ts">

    import {Button, Card} from "flowbite-svelte";
</script>
<div class="w-full grid grid-cols-4 gap-2">
    <Card href="/schedule/edit/default">
        Default
    </Card>
    <Card href="/schedule/edit/subject">
        Subject
    </Card>
</div>
<Card size="xl">
    <Button color="primary" size="lg" href="/schedule/edit/date/2023/8/10">
        Default
    </Button>
</Card>