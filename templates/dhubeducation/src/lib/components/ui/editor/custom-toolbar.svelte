<script lang="ts">
	import {
		BlockFormatDropDown,
		UndoButton,
		RedoButton,
		Toolbar,
		Divider,
		ParagraphDropDownItem,
		HeadingDropDownItem,
		BulletDropDrownItem,
		NumberDropDrownItem,
		CheckDropDrownItem,
		QuoteDropDrownItem,
		CodeDropDrownItem,
		CodeLanguageDropDown,
		FontFamilyDropDown,
		FontSizeDropDown,
		FontSizeEntry,
		BoldButton,
		ItalicButton,
		UnderlineButton,
		InsertLink,
		FormatCodeButton,
		InsertDropDown,
		DropDownAlign,
		InsertHRDropDownItem,
		InsertImageDropDownItem,
		MoreStylesDropDown,
		StrikethroughDropDownItem,
		SubscriptDropDownItem,
		SuperscriptDropDownItem,
		ClearFormattingDropDownItem,
		DropDownTextColorPicker,
		DropDownBackColorPicker,
		InsertColumnLayoutDropDownItem,
		InsertColumnsDialog,
		InsertTableDialog,
		InsertTableDropDownItem,
		ShortcutsPlugin,
		InsertYoutubeDialog,
		InsertYoutubeDropDownItem,
		InsertTweetDropDownItem,
		InsertTweetDialog,
		InsertBlueskyDialog,
		InsertBlueskyDropDownItem,
		StrikethroughButton,
	} from 'svelte-lexical';
	import InsertImageDialog from './InsertImageDialog.svelte';

	let imageDialog = $state<InsertImageDialog>();
	let columnsDialog = $state<InsertColumnsDialog>();
	let tableDialog = $state<InsertTableDialog>();
	let youtubeDialog = $state<InsertYoutubeDialog>();
	let tweetDialog = $state<InsertTweetDialog>();
	let blueskyDialog = $state<InsertBlueskyDialog>();
</script>

<Toolbar>
	{#snippet children({ editor, activeEditor, blockType })}
		<UndoButton />
		<RedoButton />
		{#if activeEditor === editor}
			<BlockFormatDropDown>
				<ParagraphDropDownItem />
				<HeadingDropDownItem headingSize="h1" />
				<HeadingDropDownItem headingSize="h2" />
				<HeadingDropDownItem headingSize="h3" />
				<NumberDropDrownItem />
				<BulletDropDrownItem />
				<CheckDropDrownItem />
				<QuoteDropDrownItem />
				<CodeDropDrownItem />
			</BlockFormatDropDown>
			<Divider />
		{/if}
		{#if blockType === 'code'}
			<CodeLanguageDropDown />
		{:else}
			<FontFamilyDropDown />
			<!-- <FontSizeDropDown /> -->
			<FontSizeEntry />
			<Divider />
			<ItalicButton />
			<UnderlineButton />
			<FormatCodeButton />
			<DropDownTextColorPicker />
			<DropDownBackColorPicker />
			<InsertLink />
			<MoreStylesDropDown>
				<StrikethroughDropDownItem />
				<SubscriptDropDownItem />
				<SuperscriptDropDownItem />
				<ClearFormattingDropDownItem />
			</MoreStylesDropDown>
			<Divider />
			{#if activeEditor === editor}
				<InsertDropDown>
					<InsertHRDropDownItem />
					<InsertImageDropDownItem onclick={() => imageDialog?.open()} />
					<InsertColumnLayoutDropDownItem onclick={() => columnsDialog?.open()} />
					<InsertTableDropDownItem onclick={() => tableDialog?.open()} />
					<InsertYoutubeDropDownItem onclick={() => youtubeDialog?.open()} />
					<InsertTweetDropDownItem onclick={() => tweetDialog?.open()} />
					<InsertBlueskyDropDownItem onclick={() => blueskyDialog?.open()} />
				</InsertDropDown>
				<Divider />
			{/if}
		{/if}
		<DropDownAlign />

		<InsertImageDialog bind:this={imageDialog} />
		<InsertColumnsDialog bind:this={columnsDialog} />
		<InsertTableDialog bind:this={tableDialog} />
		<InsertYoutubeDialog bind:this={youtubeDialog} />
		<InsertTweetDialog bind:this={tweetDialog} />
		<InsertBlueskyDialog bind:this={blueskyDialog} />
	{/snippet}
</Toolbar>
