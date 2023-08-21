<script lang="ts">
    import {Button, Label, P, Select} from "flowbite-svelte";
    import {page} from "$app/stores";
    import {onMount} from "svelte";


    let grade = 1;
    let classV = 1;

    const notifaction = async () => {
        Notification.requestPermission(permission => {
            console.log(permission); // 'default', 'granted', 'denied'

        });
    }
    onMount(() => {
        const vapidPublicKey = 'BHS3G48yZ-2Io7-Sqb5loESg_DjBHShF_XfTZA6C8mWPB5-mS4AnAx5xnzIQGS4yxMtKWmFtOaUgSyyLccDRDdA';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => {
                console.log("registering push")
                return serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            })
            .then(subscription => {
                // 購読開始
                fetch("/push/key", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({subscription})
                }).then(res => res.json()).then(res => {
                    console.log(res)
                })
            })
    })
    const test = async () => {
        const res = await fetch("/push/test")
        console.log(res)
    }

    const garades = [
        {value: 1, name: "1"},
        {value: 2, name: "2"},
        {value: 3, name: "3"},
    ]
    const classes = [
        {value: 1, name: "A"},
        {value: 2, name: "B"},
        {value: 3, name: "C"},
        {value: 4, name: "D"},
        {value: 5, name: "E"},
    ]

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
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
    <div class="flex gap-4">
        <Button on:click={notifaction}>Notifaction</Button>
        <Button on:click={test}>Test</Button>
    </div>
    <div class="w-full flex mt-4">
        <Button type="submit" color="primary" class="ml-auto">Submit</Button>
    </div>
</form>
