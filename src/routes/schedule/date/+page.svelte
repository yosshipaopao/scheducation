<script lang="ts">
    import {browser} from "$app/environment";
    import {goto} from "$app/navigation";

    const now=new Date();
    if(browser)goto(`/schedule/date/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`)
</script>