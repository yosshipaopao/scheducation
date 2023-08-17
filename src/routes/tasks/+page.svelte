<script lang="ts">
    import { AccordionItem, Accordion } from 'flowbite-svelte';
</script>
<p class="text-9xl dark:text-white">Tasks</p>

<Accordion>
    <AccordionItem>
        <span slot="header">My Header 1</span>
        <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>
        <p class="text-gray-500 dark:text-gray-400">
            Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 dark:text-blue-500 hover:underline"> get started </a>
            and start developing websites even faster with components on top of Tailwind CSS.
        </p>
    </AccordionItem>
</Accordion>