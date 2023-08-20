<script lang="ts">
    import {AccordionItem, Accordion, Card} from 'flowbite-svelte';
    import {ClipboardCheckSolid} from "flowbite-svelte-icons";

    const unsubmitted=["a"];
</script>
<p class="text-9xl dark:text-white">Tasks</p>

<Accordion>
    <AccordionItem>
        <span slot="header">未提出</span>
        {#each unsubmitted as v}
            <Card size=xl horizontal class="w-full !max-w-full">
                <ClipboardCheckSolid/>
            </Card>
        {/each}
    </AccordionItem>
    <AccordionItem>
        <span slot="header">期限切れ</span>
    </AccordionItem>
    <AccordionItem>
        <span slot="header">今週</span>
    </AccordionItem>
    <AccordionItem>
        <span slot="header">今月</span>
    </AccordionItem>
    <AccordionItem>
        <span slot="header">それ以降</span>
    </AccordionItem>
</Accordion>