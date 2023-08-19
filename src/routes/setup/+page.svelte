<script lang="ts">
    import {Button, Label, P, Select} from "flowbite-svelte";
    import {page} from "$app/stores";


    let grade = 1;
    let classV = 1;

    const garades=[
        {value:1, name:"1"},
        {value:2, name:"2"},
        {value:3, name:"3"},
    ]
    const classes=[
        {value:1, name:"A"},
        {value:2, name:"B"},
        {value:3, name:"C"},
        {value:4, name:"D"},
        {value:5, name:"E"},
    ]
</script>
<P>
    SettingUp
</P>
<form method="post">
    <div class="flex gap-2">
        <div class="w-full">
            <Label>Grade</Label>
            <Select bind:value={grade} items={garades} name="grade"/>
        </div>
        <div class="w-full">
            <Label>Class</Label>
            <Select bind:value={classV} items={classes} name="class"/>
        </div>
    </div>
    <div class="w-full flex mt-4">
        <Button type="submit" color="primary" class="ml-auto">Submit</Button>
    </div>
</form>