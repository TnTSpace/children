<script lang="ts">
	import {
		Composer,
		ContentEditable,
		RichTextPlugin,
		HorizontalRuleNode,
		HorizontalRulePlugin,
		YoutubePlugin,
		YouTubeNode,
		TabIndentationPlugin,
		TablePlugin,
		TableNode,
		TableRowNode,
		TableCellNode,
		HistoryPlugin,
		SharedHistoryPlugin,
		ListPlugin,
		ListItemNode,
		CheckListPlugin,
		LinkPlugin,
		LinkNode,
		FloatingLinkEditorPlugin,
		AutoLinkNode,
		AutoLinkPlugin,
		ImagePlugin,
		ImageNode,
		MarkdownShortcutPlugin,
		CaptionEditorHistoryPlugin,
		CodeHighlightNode,
		CodeHighlightPlugin,
		LayoutItemNode,
		CodeNode,
		CodeActionMenuPlugin,
		KeywordNode,
		HashtagNode,
		HashtagPlugin,
		TableCellResizerPlugin,
		ColumnLayoutPlugin,
		BlueskyNode,
		BlueskyPlugin,
		AutoFocusPlugin,
		TwitterPlugin,
		LayoutContainerNode,
		TweetNode,
		ListNode,
		QuoteNode,
		HeadingNode,
		ALL_TRANSFORMERS,
		generateHtmlFromNodes,
		$getRoot as getRoot,
		generateNodesFromDOM,
		type LexicalEditor,
	} from "svelte-lexical";
	import { theme } from "svelte-lexical/dist/themes/default";
	import CustomToolbar from "./custom-toolbar.svelte";
	import { ScrollArea } from "../scroll-area";
	import { cn } from "$lib/utils";
	import { onMount } from "svelte";
	import "./custom.css";
	// import { Code, Download, Lock, Upload } from '@lucide/svelte';
	import { downloadLexicalJson } from ".";

	interface Props {
		value?: string | null;
		class?: string;
	}

	let { value = $bindable(null), class: className }: Props = $props();

	const initialConfig = {
		theme,
		namespace: "pg_Demo",
		nodes: [
			HeadingNode,
			QuoteNode,
			ListNode,
			ListItemNode,
			CodeNode,
			CodeHighlightNode,
			LinkNode,
			AutoLinkNode,
			HorizontalRuleNode,
			YouTubeNode,
			TweetNode,
			ImageNode,
			TableNode,
			TableRowNode,
			TableCellNode,
			LayoutItemNode,
			LayoutContainerNode,
			KeywordNode,
			HashtagNode,
			BlueskyNode,
		],
		onError: (error: Error) => {
			console.error("Lexical Config Error:", error);
		},
	};

	let mounted = $state(false);
	let composer = $state<Composer>();
	let initialized = $state(false);

	const handleDownload = () => {
		const json = composer?.getEditor().getEditorState().toJSON();
		downloadLexicalJson(json as any, "my.json");
	};

	const handleHtml = () => {
		const editor = composer?.getEditor() as LexicalEditor;
		editor.read(() => {
			const html = generateHtmlFromNodes(editor);
			console.log(html);
		});
	};

	// Initialize editor with initial value only once
	$effect(() => {
		if (composer && !initialized) {
			const editor = composer.getEditor() as LexicalEditor;
			editor.update(() => {
				const parser = new DOMParser();
				const dom = parser.parseFromString(value || "", "text/html");
				const nodes = generateNodesFromDOM(editor, dom);
				getRoot().clear();
				getRoot().select().insertNodes(nodes);
			});
			initialized = true;
		}
	});

	// Listen for changes and update value
	$effect(() => {
		if (!composer || !initialized) return;

		const editor = composer.getEditor() as LexicalEditor;
		return editor.registerUpdateListener(() => {
			editor.read(() => {
				value = generateHtmlFromNodes(editor);
			});
		});
	});

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<Composer {initialConfig} bind:this={composer}>
		<div
			class={cn(
				"editor-shell svelte-lexical",
				"border-muted-foreground/20! bg-background! text-foreground! my-0! w-full! max-w-full!",
				className,
			)}
		>
			<ScrollArea class="w-full grid" orientation="horizontal">
				<CustomToolbar />
			</ScrollArea>

			<div
				class={cn(
					"editor-container relative",
					"border-muted-foreground/20! bg-background! text-foreground!",
				)}
			>
				<div class="editor-scroller">
					<div class="editor max-h-40 overflow-x-auto">
						<ContentEditable />
					</div>
				</div>

				<RichTextPlugin />
				<HistoryPlugin />
				<ListPlugin />
				<LinkPlugin />
				<AutoLinkPlugin />
				<ImagePlugin />
				<TablePlugin />
				<CodeHighlightPlugin />
				<HorizontalRulePlugin />
				<YoutubePlugin />
				<TwitterPlugin />
				<BlueskyPlugin />
				<TabIndentationPlugin />
				<CheckListPlugin />
				<HashtagPlugin />
				<FloatingLinkEditorPlugin />
				<CaptionEditorHistoryPlugin />
				<CodeActionMenuPlugin />
				<TableCellResizerPlugin />
				<ColumnLayoutPlugin />
				<MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
				<SharedHistoryPlugin />
				<AutoFocusPlugin />

				<!-- <div class="absolute right-1 bottom-1 flex items-center gap-2">
					<Button size="icon" variant="outline">
						<Upload />
					</Button>
					<Button size="icon" variant="outline" onclick={handleDownload}>
						<Download />
					</Button>
					<Button size="icon" variant="outline" onclick={handleHtml}>
						<Code />
					</Button>
				</div> -->
			</div>
		</div>
	</Composer>
{/if}
