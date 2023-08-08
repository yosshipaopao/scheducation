<script lang='ts'>
	import { signIn } from '@auth/sveltekit/client';
</script>


<div class='container h-full mx-auto flex justify-center items-center'>
	<div class='flex flex-col justify-center items-center'>
		<p class='text-2xl font-bold text-center'>このボタンを押せば<code class='code font-bold text-2xl'>SignIn</code><br/>さあどうする？</p>
		<button class='btn btn-xl variant-filled rounded-xl mt-4' on:click={()=>signIn("google")}>Sign In</button>
	</div>
</div>