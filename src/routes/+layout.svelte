<script lang="ts">
    import "../app.postcss";

    import {page} from '$app/stores';

    import {
        Avatar,
        DarkMode,
        Footer,
        FooterCopyright, FooterLink,
        FooterLinkGroup,
        Navbar,
        NavBrand,
        NavHamburger,
        NavLi,
        NavUl,
        Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Chevron
    } from "flowbite-svelte";

    import {signIn, signOut} from '@auth/sveltekit/client';
    import {browser} from "$app/environment";
    import {goto} from "$app/navigation";

    $: activeUrl = $page.url.pathname;

    $: if($page.data.session&&$page.data.session.user&&!$page.url.pathname.startsWith("/setup"))if(!$page.data.session.user?.class)if(browser)goto("/setup")

    const date = new Date();
</script>
<header>
    <Navbar let:hidden let:toggle
            navClass="fixed px-4 py-2.5 w-full z-20 top-0 left-0 border-b">
        <NavBrand href="/">
            <img src="/icon/icon-512x512.png" alt="logo" class="w-10 h-10 mr-2 rounded-full"/>
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                Scheducation
            </span>
        </NavBrand>
        <div class="flex items-center gap-4 md:order-2">
            <DarkMode/>
            <Avatar id="user-menu" class="cursor-pointer"
                    src={$page.data.session?.user?.image??"/icon/icon-512x512.png"}/>
            <NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1"/>
        </div>
        <Dropdown placement="bottom" triggeredBy="#user-menu">
            {#if $page.data.session}
                <DropdownHeader>
                    <span class="block text-sm"> {$page.data.session.user?.name} </span>
                    <span class="block truncate text-sm font-medium"> {$page.data.session.user?.email} </span>
                </DropdownHeader>
                <DropdownItem>Settings</DropdownItem>
                <DropdownDivider/>
                <DropdownItem on:click={signOut}>Sign out</DropdownItem>
            {:else}
                <DropdownHeader>
                    Not signed in
                </DropdownHeader>
                <DropdownDivider/>
                <DropdownItem on:click={()=>signIn("google")}>Sign In</DropdownItem>
            {/if}
        </Dropdown>
        <NavUl {hidden} divClass="w-full md:block md:w-auto ml-auto">
            <NavLi href="/" active={activeUrl==="/"}>HOME</NavLi>
            <NavLi id="nav-schedule" class="cursor-pointer" active={activeUrl.startsWith("/schedule")}>
                <Chevron aligned>SCHEDULE</Chevron>
            </NavLi>
            <NavLi href="/tasks" active={activeUrl.startsWith("/tasks")}>TASKS</NavLi>
            <Dropdown triggeredBy="#nav-schedule" class="w-[80vw] md:w-44 z-20">
                <DropdownItem href="/schedule/month/{date.getFullYear()}/{date.getMonth()+1}">Month</DropdownItem>
                <DropdownItem href="/schedule/week/{date.getFullYear()}/{date.getMonth()+1}/{date.getDate()}">Week
                </DropdownItem>
                <DropdownItem href="/schedule/date/{date.getFullYear()}/{date.getMonth()+1}/{date.getDate()}">Date
                </DropdownItem>
                <DropdownDivider/>
                <DropdownItem href="/schedule/edit">Edit</DropdownItem>
            </Dropdown>
        </NavUl>
    </Navbar>
</header>
<main class="lg:w-[1024px] w-full mx-auto pt-20 min-h-fitScreen">
    <slot/>
</main>
<Footer>
    <FooterCopyright href="https://yosshipaopao.com" by="yosshipaopao" year={2023}/>
    <FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        <FooterLink href="/about">About</FooterLink>
        <FooterLink href="/privacy">Privacy Policy</FooterLink>
    </FooterLinkGroup>
</Footer>