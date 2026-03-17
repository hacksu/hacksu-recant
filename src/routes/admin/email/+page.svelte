<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ── Compose state ──────────────────────────────────────────────────────
	let fromName = $state('HacKSU Team');
	let toRaw = $state('');
	let ccRaw = $state('');
	let bccRaw = $state('');
	let subject = $state('');
	let body = $state('');

	// ── CC/BCC visibility ──────────────────────────────────────────────────
	let ccBccVisible = $state(false);

	let toAddresses = $derived(
		toRaw.split(',').map((e) => e.trim()).filter(Boolean)
	);

	$effect(() => {
		if (toAddresses.length > 1) {
			ccBccVisible = false;
			ccRaw = '';
			bccRaw = '';
		}
	});

	// ── Variables ──────────────────────────────────────────────────────────
	type VarType = 'single' | 'list';
	type SharedVar = { id: string; name: string; type: VarType; value: string; listValues: string[] };
	type RecipientVar = { id: string; name: string; values: string[] };

	let sharedVars = $state<SharedVar[]>([
		{ id: crypto.randomUUID(), name: '', type: 'single', value: '', listValues: [''] }
	]);
	let recipientVars = $state<RecipientVar[]>([]);
	let prevToLength = $state(0);

	$effect(() => {
		// When toAddresses changes, sync recipientVar value arrays
		const len = toAddresses.length;
		if (len === prevToLength) return;
		prevToLength = len;
		recipientVars = recipientVars.map((v) => {
			const synced = [...v.values];
			while (synced.length < len) synced.push('');
			return { ...v, values: synced.slice(0, len) };
		});
	});

	// Serialized for form submission and preview.
	// Use $derived.by for multi-statement derived values (Svelte 5).
	let sharedVariablesJSON = $derived.by(() => {
		const obj: Record<string, string | string[]> = {};
		for (const v of sharedVars) {
			if (!v.name) continue;
			obj[v.name] = v.type === 'list' ? v.listValues.filter(Boolean) : v.value;
		}
		return JSON.stringify(obj);
	});

	let recipientVariablesJSON = $derived.by(() => {
		const obj: Record<string, string[]> = {};
		for (const v of recipientVars) {
			if (!v.name) continue;
			obj[v.name] = v.values;
		}
		return JSON.stringify(obj);
	});

	// ── Live preview ───────────────────────────────────────────────────────
	let previewHtml = $state('');

	$effect(() => {
		// Track reactive dependencies
		const _body = body;
		const _sv = sharedVariablesJSON;
		const _rv = recipientVariablesJSON;
		const _to = JSON.stringify(toAddresses);

		const id = setTimeout(async () => {
			try {
				const res = await fetch('/admin/email/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						body: _body,
						sharedVariables: JSON.parse(_sv),
						recipientVariables: JSON.parse(_rv),
						toAddresses: JSON.parse(_to)
					})
				});
				if (res.ok) {
					const { html } = await res.json();
					previewHtml = html;
				}
			} catch {
				// Preview failure is silent
			}
		}, 400);
		return () => clearTimeout(id);
	});

	// ── Unsaved state ──────────────────────────────────────────────────────
	type LoadedState = { to: string; subject: string; body: string; varCount: number };
	let lastLoaded = $state<LoadedState>({ to: '', subject: '', body: '', varCount: 0 });

	let isDirty = $derived(
		toRaw !== lastLoaded.to ||
		subject !== lastLoaded.subject ||
		body !== lastLoaded.body ||
		sharedVars.filter((v) => v.name).length !== lastLoaded.varCount
	);

	// ── Library drawer ─────────────────────────────────────────────────────
	let drawerOpen = $state(false);
	let drawerTab = $state<'templates' | 'drafts'>('templates');
	let pendingLoad = $state<{ type: 'template' | 'draft'; id: string; name: string } | null>(null);
	let showLoadConfirm = $state(false);

	function openDrawer(tab: 'templates' | 'drafts' = 'templates') {
		drawerTab = tab;
		drawerOpen = true;
	}

	function loadItem(type: 'template' | 'draft', id: string, name: string) {
		if (isDirty) {
			pendingLoad = { type, id, name };
			showLoadConfirm = true;
		} else {
			applyLoad(type, id);
		}
	}

	function applyLoad(type: 'template' | 'draft', id: string) {
		if (type === 'template') {
			const t = data.templates.find((t) => t.id === id);
			if (!t) return;
			subject = t.subject;
			body = t.body;
			// Restore variable names + types (no values)
			sharedVars = (t.variableNames as { name: string; type: VarType }[]).map((v) => ({
				id: crypto.randomUUID(),
				name: v.name,
				type: v.type,
				value: '',
				listValues: ['']
			}));
			lastLoaded = { to: toRaw, subject: t.subject, body: t.body, varCount: (t.variableNames as {name:string}[]).length };
		} else {
			const d = data.drafts.find((d) => d.id === id);
			if (!d) return;
			fromName = d.fromName || 'HacKSU Team';
			toRaw = (d.toAddresses as string[]).join(', ');
			ccRaw = (d.ccAddresses as string[]).join(', ');
			bccRaw = (d.bccAddresses as string[]).join(', ');
			subject = d.subject;
			body = d.body;
			const sv = d.sharedVariables as Record<string, string | string[]>;
			sharedVars = Object.entries(sv).map(([name, val]) => ({
				id: crypto.randomUUID(),
				name,
				type: Array.isArray(val) ? 'list' : 'single',
				value: Array.isArray(val) ? '' : val,
				listValues: Array.isArray(val) ? val : ['']
			}));
			const rv = d.recipientVariables as Record<string, string[]>;
			recipientVars = Object.entries(rv).map(([name, values]) => ({
				id: crypto.randomUUID(),
				name,
				values
			}));
			lastLoaded = { to: toRaw, subject: d.subject, body: d.body, varCount: Object.keys(d.sharedVariables as Record<string, unknown>).length };
		}
		drawerOpen = false;
	}

	// ── Send modal ─────────────────────────────────────────────────────────
	let showSendModal = $state(false);
	let sending = $state(false);
	let sendError = $state('');
	let sendSuccess = $state('');

	// ── Variable panel ─────────────────────────────────────────────────────
	let varPanelCollapsed = $state(false);

	// ── Save draft / template dialogs ──────────────────────────────────────
	let showSaveDraftDialog = $state(false);
	let showSaveTemplateDialog = $state(false);
	let saveName = $state('');

	function varNamesJSON() {
		return JSON.stringify(
			sharedVars
				.filter((v) => v.name)
				.map((v) => ({ name: v.name, type: v.type }))
		);
	}
</script>

<!-- Overlay for drawer -->
{#if drawerOpen}
	<div
		class="fixed inset-0 z-[99] bg-black/50"
		role="button"
		tabindex="-1"
		onclick={() => (drawerOpen = false)}
		onkeydown={() => {}}
		aria-label="Close drawer"
	></div>
{/if}

<!-- Library Drawer -->
<div
	class="fixed left-0 top-0 bottom-0 z-[100] w-72 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-250"
	class:translate-x-0={drawerOpen}
	class:-translate-x-full={!drawerOpen}
>
	<div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
		<h2 class="font-semibold text-sm">Library</h2>
		<button class="text-gray-400 hover:text-white text-sm px-2 py-1 rounded" onclick={() => (drawerOpen = false)}>✕</button>
	</div>

	<!-- Tabs -->
	<div class="flex border-b border-gray-700">
		{#each ['templates', 'drafts'] as tab}
			<button
				class="flex-1 py-2 text-xs font-semibold border-b-2 transition-colors"
				class:border-hacksu-green={drawerTab === tab}
				class:text-hacksu-green={drawerTab === tab}
				class:border-transparent={drawerTab !== tab}
				class:text-gray-400={drawerTab !== tab}
				onclick={() => (drawerTab = tab as 'templates' | 'drafts')}
			>
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
				{#if tab === 'drafts' && data.drafts.length > 0}
					<span class="ml-1 bg-hacksu-green text-black text-[10px] font-bold rounded-full px-1.5">{data.drafts.length}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Items -->
	<div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
		{#if drawerTab === 'templates'}
			{#each data.templates as t}
				<div class="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:border-hacksu-green/50 transition-colors">
					<div class="font-medium text-sm mb-0.5">{t.name}</div>
					<div class="text-xs text-gray-400 mb-2">
						{(t.variableNames as {name:string}[]).map(v=>v.name).join(', ') || 'No variables'}
					</div>
					<div class="flex gap-2">
						<button class="text-xs border border-gray-500 rounded px-2 py-1 hover:border-gray-300 hover:text-white text-gray-300 transition-colors" onclick={() => loadItem('template', t.id, t.name)}>Load</button>
						<form method="POST" action="?/deleteTemplate" use:enhance>
							<input type="hidden" name="id" value={t.id} />
							<button type="submit" class="text-xs border border-red-400/30 text-red-400 rounded px-2 py-1 hover:bg-red-400/10 transition-colors">Delete</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="text-xs text-gray-500 text-center mt-4">No saved templates</p>
			{/each}
		{:else}
			{#each data.drafts as d}
				<div class="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:border-hacksu-green/50 transition-colors">
					<div class="font-medium text-sm mb-0.5">{d.name}</div>
					<div class="text-xs text-gray-400 mb-2">To: {(d.toAddresses as string[]).join(', ') || '(none)'}</div>
					<div class="flex gap-2">
						<button class="text-xs border border-gray-500 rounded px-2 py-1 hover:border-gray-300 hover:text-white text-gray-300 transition-colors" onclick={() => loadItem('draft', d.id, d.name)}>Load</button>
						<form method="POST" action="?/deleteDraft" use:enhance>
							<input type="hidden" name="id" value={d.id} />
							<button type="submit" class="text-xs border border-red-400/30 text-red-400 rounded px-2 py-1 hover:bg-red-400/10 transition-colors">Delete</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="text-xs text-gray-500 text-center mt-4">No saved drafts</p>
			{/each}
		{/if}
	</div>

	<div class="p-3 border-t border-gray-700 flex gap-2">
		<button class="flex-1 text-xs border border-gray-600 rounded px-2 py-1.5 font-semibold hover:border-gray-400 text-gray-300 hover:text-white transition-colors" onclick={() => { saveName = ''; showSaveDraftDialog = true; }}>Save Draft</button>
		<button class="flex-1 text-xs border border-gray-600 rounded px-2 py-1.5 font-semibold hover:border-gray-400 text-gray-300 hover:text-white transition-colors" onclick={() => { saveName = ''; showSaveTemplateDialog = true; }}>Save Template</button>
	</div>
</div>

<!-- Main layout -->
<div class="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">

	<!-- Topbar -->
	<div class="flex items-center gap-3 px-4 py-2.5 bg-gray-800 border-b border-gray-700 shrink-0">
		<span class="text-base font-bold text-hacksu-green">Email Console</span>
		<div class="w-px h-5 bg-gray-600"></div>
		<button class="text-xs border border-gray-700 rounded px-3 py-1.5 font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors" onclick={() => openDrawer('templates')}>Templates &amp; Drafts</button>
		<div class="flex-1"></div>
		{#if sendSuccess}
			<span class="text-xs text-hacksu-green font-semibold">{sendSuccess}</span>
		{/if}
		<button class="bg-hacksu-green text-black font-bold text-sm px-4 py-1.5 rounded-md hover:bg-hacksu-green/80 transition-colors" onclick={() => { showSendModal = true; sendError = ''; }}>Send</button>
	</div>

	<!-- Header fields -->
	<div class="bg-gray-800 border-b border-gray-700 px-4 shrink-0">
		<!-- From -->
		<div class="flex items-center border-b border-gray-700 min-h-[38px]">
			<span class="w-16 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">From</span>
			<input bind:value={fromName} class="flex-1 bg-transparent outline-none text-sm py-2 max-w-[200px]" type="text" placeholder="HacKSU Team" />
			<span class="text-xs text-gray-600 px-3">via {data.gmailFrom}</span>
		</div>
		<!-- To -->
		<div class="flex items-center border-b border-gray-700 min-h-[38px]" class:border-b-0={!ccBccVisible}>
			<span class="w-16 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">To</span>
			<input bind:value={toRaw} class="flex-1 bg-transparent outline-none text-sm py-2" type="text" placeholder="alice@example.com, bob@example.com" />
			{#if toAddresses.length <= 1}
				<button class="text-xs text-blue-400 hover:bg-blue-400/10 px-2 py-1 rounded transition-colors shrink-0" onclick={() => (ccBccVisible = !ccBccVisible)}>
					{ccBccVisible ? '− CC / BCC' : '+ CC / BCC'}
				</button>
			{/if}
		</div>
		<!-- CC -->
		{#if ccBccVisible}
			<div class="flex items-center border-b border-gray-700 min-h-[38px]">
				<span class="w-16 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">CC</span>
				<input bind:value={ccRaw} class="flex-1 bg-transparent outline-none text-sm py-2" type="text" placeholder="cc@example.com" />
			</div>
			<!-- BCC -->
			<div class="flex items-center border-b border-gray-700 min-h-[38px]">
				<span class="w-16 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">BCC</span>
				<input bind:value={bccRaw} class="flex-1 bg-transparent outline-none text-sm py-2" type="text" placeholder="bcc@example.com" />
			</div>
		{/if}
		<!-- Subject -->
		<div class="flex items-center min-h-[38px]">
			<span class="w-16 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Subject</span>
			<input bind:value={subject} class="flex-1 bg-transparent outline-none text-sm py-2" type="text" placeholder="Hey &#123;&#123;recipient.name&#125;&#125;, welcome to &#123;&#123;vars.eventName&#125;&#125;!" />
		</div>
	</div>

	<!-- Editor + Preview -->
	<div class="flex flex-1 min-h-0">
		<!-- Editor pane -->
		<div class="flex flex-col flex-1 border-r border-gray-700 min-w-0">
			<div class="flex items-center justify-between px-4 py-1.5 bg-gray-800 border-b border-gray-700 shrink-0 gap-3">
				<span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">HTML / Handlebars</span>
				<div class="flex items-center gap-2 bg-blue-900/30 border border-blue-500/25 rounded px-3 py-1 text-[11px] text-blue-300 flex-1">
					<strong class="text-blue-400">Heads up:</strong> All styles must be inline — &lt;style&gt; tags and external CSS are stripped by most email clients.
				</div>
			</div>
			<textarea
				bind:value={body}
				class="flex-1 bg-gray-950 text-gray-100 font-mono text-[13px] p-4 resize-none outline-none leading-relaxed"
				spellcheck="false"
				placeholder="Write your email HTML here..."
			></textarea>
		</div>
		<!-- Preview pane -->
		<div class="flex flex-col flex-1 min-w-0">
			<div class="flex items-center justify-between px-4 py-1.5 bg-gray-800 border-b border-gray-700 shrink-0">
				<span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Preview</span>
				<span class="text-[11px] text-gray-500">
					{toAddresses.length > 0 ? `Showing: ${toAddresses[0]}` : 'Showing: first recipient'}
				</span>
			</div>
			<iframe title="Email preview" class="flex-1 bg-white" srcdoc={previewHtml}></iframe>
		</div>
	</div>

	<!-- Variable Panel -->
	<div
		class="bg-gray-800 border-t border-gray-700 shrink-0 overflow-hidden transition-all duration-200"
		style="max-height: {varPanelCollapsed ? '38px' : '220px'}"
	>
		<button
			class="flex items-center justify-between w-full px-4 py-2 hover:bg-white/5 transition-colors"
			onclick={() => (varPanelCollapsed = !varPanelCollapsed)}
		>
			<span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Variables</span>
			<span class="text-[10px] text-gray-500 transition-transform" style="transform: rotate({varPanelCollapsed ? '-90deg' : '0deg'})">▾</span>
		</button>

		<div class="flex border-t border-gray-700" style="height: calc(220px - 38px)">
			<!-- Shared vars -->
			<div class="flex-1 border-r border-gray-700 p-3 overflow-y-auto flex flex-col gap-2">
				<div class="text-[11px] font-bold text-hacksu-green uppercase tracking-wider mb-1">
					Shared <code class="normal-case tracking-normal font-normal bg-hacksu-green/10 px-1 rounded text-[10px]">&#123;&#123;vars.X&#125;&#125;</code>
				</div>
				{#each sharedVars as v (v.id)}
					<div class="bg-gray-900 border border-gray-600 rounded-md p-2 flex flex-col gap-1.5">
						<div class="flex items-center gap-1.5">
							<input
								bind:value={v.name}
								class="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-mono outline-none focus:border-hacksu-green"
								placeholder="varName"
							/>
							<!-- Type toggle -->
							<div class="flex border border-gray-600 rounded overflow-hidden text-[10px] font-bold">
								<button
									class="px-2 py-0.5 transition-colors"
									class:bg-gray-600={v.type === 'single'}
									class:text-white={v.type === 'single'}
									class:text-gray-500={v.type !== 'single'}
									onclick={() => {
										if (v.type !== 'single') {
											v.value = v.listValues[0] ?? '';
											v.type = 'single';
										}
									}}
								>Single</button>
								<button
									class="px-2 py-0.5 transition-colors"
									class:bg-gray-600={v.type === 'list'}
									class:text-white={v.type === 'list'}
									class:text-gray-500={v.type !== 'list'}
									onclick={() => {
										if (v.type !== 'list') {
											v.listValues = v.value ? [v.value] : [''];
											v.type = 'list';
										}
									}}
								>List</button>
							</div>
							<button class="ml-auto text-gray-500 hover:text-red-400 text-xs px-1 transition-colors" onclick={() => { sharedVars = sharedVars.filter(s => s.id !== v.id); }}>✕</button>
						</div>
						{#if v.type === 'single'}
							<input bind:value={v.value} class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs outline-none focus:border-hacksu-green w-full" placeholder="value" />
						{:else}
							<div class="flex flex-col gap-1">
								{#each v.listValues as _, i}
									<div class="flex gap-1 items-center">
										<input bind:value={v.listValues[i]} class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs outline-none focus:border-hacksu-green" placeholder="item" />
										<button
											class="text-gray-500 hover:text-red-400 text-xs px-1 transition-colors"
											onclick={() => {
												if (v.listValues.length > 1) v.listValues = v.listValues.filter((_, j) => j !== i);
											}}
										>✕</button>
									</div>
								{/each}
								<button class="text-[10px] text-hacksu-green/70 hover:text-hacksu-green text-left mt-0.5 transition-colors" onclick={() => { v.listValues = [...v.listValues, '']; }}>+ add item</button>
							</div>
						{/if}
					</div>
				{/each}
				<button class="text-xs border border-dashed border-hacksu-green/40 text-hacksu-green/70 hover:text-hacksu-green hover:bg-hacksu-green/5 rounded px-2 py-1 transition-colors mt-1 self-start" onclick={() => { sharedVars = [...sharedVars, { id: crypto.randomUUID(), name: '', type: 'single', value: '', listValues: [''] }]; }}>+ Add variable</button>
			</div>

			<!-- Per-recipient vars -->
			<div class="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
				<div class="text-[11px] font-bold text-hacksu-green uppercase tracking-wider mb-1">
					Per-Recipient <code class="normal-case tracking-normal font-normal bg-hacksu-green/10 px-1 rounded text-[10px]">&#123;&#123;recipient.X&#125;&#125;</code>
				</div>
				{#if toAddresses.length === 0}
					<p class="text-[11px] text-gray-500">Add emails to the To field first.</p>
				{/if}
				{#each recipientVars as v (v.id)}
					<div class="bg-gray-900 border border-gray-600 rounded-md p-2 flex flex-col gap-1.5">
						<div class="flex items-center gap-1.5">
							<input bind:value={v.name} class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-mono outline-none focus:border-hacksu-green" placeholder="varName" />
							<button class="text-gray-500 hover:text-red-400 text-xs px-1 transition-colors" onclick={() => { recipientVars = recipientVars.filter(r => r.id !== v.id); }}>✕</button>
						</div>
						{#each toAddresses as email, i}
							<div class="flex gap-1.5 items-center">
								<span class="text-[10px] text-gray-500 w-24 overflow-hidden text-ellipsis whitespace-nowrap shrink-0">{email}</span>
								<input bind:value={v.values[i]} class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs outline-none focus:border-hacksu-green" placeholder="value" />
							</div>
						{/each}
					</div>
				{/each}
				<button class="text-xs border border-dashed border-hacksu-green/40 text-hacksu-green/70 hover:text-hacksu-green hover:bg-hacksu-green/5 rounded px-2 py-1 transition-colors mt-1 self-start" onclick={() => { recipientVars = [...recipientVars, { id: crypto.randomUUID(), name: '', values: toAddresses.map(() => '') }]; }}>+ Add variable</button>
			</div>
		</div>
	</div>
</div>

<!-- Send Confirmation Modal -->
{#if showSendModal}
	<div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/65">
		<div class="bg-gray-800 border border-gray-600 rounded-xl p-6 w-[480px] max-w-[95vw] shadow-2xl">
			<h2 class="text-lg font-bold mb-1">Ready to send?</h2>
			<p class="text-sm text-gray-400 mb-5">Review before sending — this cannot be undone.</p>
			<!-- Note: subject is shown as the raw Handlebars template, not rendered.
			     Server-side rendering of the subject preview would require an extra fetch
			     to /admin/email/preview, which is not worth the latency for a confirmation modal. -->
			<div class="space-y-0 divide-y divide-gray-700 text-sm">
				<div class="flex justify-between py-2.5"><span class="text-gray-400">From</span><span class="font-medium">{fromName} &lt;{data.gmailFrom}&gt;</span></div>
				<div class="flex justify-between py-2.5"><span class="text-gray-400">To</span><span class="font-medium text-right max-w-[280px] break-all">{toRaw || '(none)'}</span></div>
				{#if ccRaw}<div class="flex justify-between py-2.5"><span class="text-gray-400">CC</span><span class="font-medium">{ccRaw}</span></div>{/if}
				{#if bccRaw}<div class="flex justify-between py-2.5"><span class="text-gray-400">BCC</span><span class="font-medium">{bccRaw}</span></div>{/if}
				<div class="flex justify-between py-2.5"><span class="text-gray-400">Subject (template)</span><span class="font-medium text-right max-w-[280px]">{subject}</span></div>
				<div class="flex justify-between py-2.5"><span class="text-gray-400">Recipients</span><span class="font-medium">{toAddresses.length}</span></div>
			</div>
			{#if sendError}
				<div class="mt-3 bg-yellow-400/10 border border-yellow-400/25 rounded-lg p-3 text-xs text-yellow-300">{sendError}</div>
			{/if}
			<div class="flex gap-2 justify-end mt-5">
				<button class="border border-gray-600 rounded-md px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-400 transition-colors" onclick={() => { showSendModal = false; sendError = ''; }}>Cancel</button>
				<form method="POST" action="?/send" use:enhance={({ formData, cancel }) => {
					// Client-side validation
					if (toAddresses.length === 0) {
						sendError = 'At least one recipient is required in the To field.';
						cancel();
						return;
					}
					for (const v of recipientVars) {
						if (v.name && v.values.length !== toAddresses.length) {
							sendError = `Variable "${v.name}" has ${v.values.length} value(s) but there are ${toAddresses.length} recipient(s).`;
							cancel();
							return;
						}
					}
					// Inject JSON fields
					formData.set('sharedVariables', sharedVariablesJSON);
					formData.set('recipientVariables', recipientVariablesJSON);
					formData.set('toAddresses', toRaw);
					formData.set('ccAddresses', ccRaw);
					formData.set('bccAddresses', bccRaw);
					sending = true;
					return async ({ result, update }) => {
						sending = false;
						if (result.type === 'failure') {
							sendError = (result.data?.error as string) ?? 'Unknown error';
						} else if (result.type === 'success') {
							showSendModal = false;
							sendError = '';
							sendSuccess = `✓ Sent to ${result.data?.count} recipient(s)`;
							setTimeout(() => (sendSuccess = ''), 4000);
						}
						await update();
					};
				}}>
					<input type="hidden" name="fromName" value={fromName} />
					<input type="hidden" name="subject" value={subject} />
					<input type="hidden" name="body" value={body} />
					<button type="submit" disabled={sending} class="bg-hacksu-green text-black font-bold text-sm px-4 py-2 rounded-md hover:bg-hacksu-green/80 disabled:opacity-50 transition-colors">
						{sending ? 'Sending…' : 'Send Now'}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Load Confirm Modal -->
{#if showLoadConfirm && pendingLoad}
	<div class="fixed inset-0 z-[300] flex items-center justify-center bg-black/65">
		<div class="bg-gray-800 border border-gray-600 rounded-xl p-5 w-80 shadow-2xl">
			<h3 class="font-semibold text-sm mb-2">Load {pendingLoad.type} "{pendingLoad.name}"?</h3>
			<p class="text-xs text-gray-400 mb-4">You have unsaved changes. Loading this will replace the current compose state.</p>
			<div class="flex gap-2 justify-end">
				<button class="border border-gray-600 rounded px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors" onclick={() => { showLoadConfirm = false; pendingLoad = null; }}>Cancel</button>
				<button class="bg-hacksu-green text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-hacksu-green/80 transition-colors" onclick={() => { if (pendingLoad) applyLoad(pendingLoad.type, pendingLoad.id); showLoadConfirm = false; pendingLoad = null; }}>Load Anyway</button>
			</div>
		</div>
	</div>
{/if}

<!-- Save Draft Dialog -->
{#if showSaveDraftDialog}
	<div class="fixed inset-0 z-[300] flex items-center justify-center bg-black/65">
		<div class="bg-gray-800 border border-gray-600 rounded-xl p-5 w-80 shadow-2xl">
			<h3 class="font-semibold text-sm mb-3">Save Draft</h3>
			<input bind:value={saveName} class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm outline-none focus:border-hacksu-green mb-4" placeholder="Draft name" />
			<div class="flex gap-2 justify-end">
				<button class="border border-gray-600 rounded px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors" onclick={() => (showSaveDraftDialog = false)}>Cancel</button>
				<form method="POST" action="?/saveDraft" use:enhance={({ formData }) => {
					formData.set('name', saveName);
					formData.set('toAddresses', JSON.stringify(toAddresses));
					formData.set('ccAddresses', JSON.stringify(ccRaw.split(',').map(e=>e.trim()).filter(Boolean)));
					formData.set('bccAddresses', JSON.stringify(bccRaw.split(',').map(e=>e.trim()).filter(Boolean)));
					formData.set('sharedVariables', sharedVariablesJSON);
					formData.set('recipientVariables', recipientVariablesJSON);
					return async ({ update }) => { showSaveDraftDialog = false; await update(); };
				}}>
					<input type="hidden" name="fromName" value={fromName} />
					<input type="hidden" name="subject" value={subject} />
					<input type="hidden" name="body" value={body} />
					<button type="submit" class="bg-hacksu-green text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-hacksu-green/80 transition-colors">Save</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Save Template Dialog -->
{#if showSaveTemplateDialog}
	<div class="fixed inset-0 z-[300] flex items-center justify-center bg-black/65">
		<div class="bg-gray-800 border border-gray-600 rounded-xl p-5 w-80 shadow-2xl">
			<h3 class="font-semibold text-sm mb-3">Save Template</h3>
			<input bind:value={saveName} class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm outline-none focus:border-hacksu-green mb-4" placeholder="Template name" />
			<div class="flex gap-2 justify-end">
				<button class="border border-gray-600 rounded px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors" onclick={() => (showSaveTemplateDialog = false)}>Cancel</button>
				<form method="POST" action="?/saveTemplate" use:enhance={({ formData }) => {
					formData.set('name', saveName);
					formData.set('variableNames', varNamesJSON());
					return async ({ update }) => { showSaveTemplateDialog = false; await update(); };
				}}>
					<input type="hidden" name="subject" value={subject} />
					<input type="hidden" name="body" value={body} />
					<button type="submit" class="bg-hacksu-green text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-hacksu-green/80 transition-colors">Save</button>
				</form>
			</div>
		</div>
	</div>
{/if}
