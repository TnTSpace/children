<script lang="ts">
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import { Home, ArrowLeft, AlertCircle, RefreshCcw } from "@lucide/svelte";
    import { fly } from "svelte/transition";

    const status = page.status || 404;
    const message = page.error?.message || "Page not found";
    
    const descriptions: Record<number, string> = {
        404: "Oops! The page you're looking for has vanished into the digital void.",
        500: "Something went wrong on our end. Our AI is currently recalibrating.",
        403: "Access denied. You don't have the clearance for this sector.",
    };

    const description = descriptions[status] || "An unexpected error occurred.";
</script>

<div class="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute top-1/4 -left-20 size-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-1/4 -right-20 size-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

    <div class="max-w-md w-full text-center space-y-8 relative" in:fly={{ y: 20, duration: 600 }}>
        <div class="space-y-4">
            <div class="inline-flex items-center justify-center size-24 bg-muted rounded-3xl text-primary mb-4 shadow-xl">
                {#if status === 404}
                    <AlertCircle class="size-12" />
                {:else}
                    <AlertCircle class="size-12 text-destructive" />
                {/if}
            </div>
            
            <h1 class="text-8xl font-bold tracking-tighter text-foreground/10 absolute -top-12 left-1/2 -translate-x-1/2 select-none">
                {status}
            </h1>
            
            <div class="relative">
                <h2 class="text-4xl font-bold tracking-tight text-foreground">
                    {message}
                </h2>
                <p class="mt-4 text-muted-foreground text-lg font-medium leading-relaxed">
                    {description}
                </p>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Button 
                variant="outline" 
                class="w-full sm:w-auto gap-2 active:scale-95 transition-all"
                onclick={() => window.history.back()}
            >
                <ArrowLeft class="size-5" />
                Go Back
            </Button>
            <Button 
                variant="outline" 
                class="w-full sm:w-auto gap-2 active:scale-95 transition-all"
                onclick={() => window.location.reload()}
            >
                <RefreshCcw class="size-5" />
                Reload
            </Button>
            <Button 
                class="w-full sm:w-auto gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                onclick={() => window.location.href = '/'}
            >
                <Home class="size-5" />
                Back to Home
            </Button>
        </div>
    </div>
</div>
