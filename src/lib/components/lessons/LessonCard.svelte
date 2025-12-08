<script lang="ts">
import type { LessonRepo } from '../../../routes/api/lessons/repos/+server';
import { getTechnologyIconUrl } from '../../lessons/iconify';

let { lesson }: { lesson: LessonRepo } = $props();

// Extract hierarchical category path from topics (non-lesson tags, general -> specific)
const categoryPath = $derived.by(() => {
	if (!lesson.topics) return [];
	return lesson.topics
		.filter((topic) => topic !== 'lesson')
		.map((topic) => topic.charAt(0).toUpperCase() + topic.slice(1));
});

// Clean display name - remove category prefixes if present, then Title Case
const displayName = $derived.by(() => {
	let name = lesson.name;
	categoryPath.forEach((category) => {
		const prefix = category.toLowerCase() + '-';
		if (name.toLowerCase().startsWith(prefix)) {
			name = name.substring(prefix.length);
		}
	});
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
});

// Icon from lesson name or topics, with initials fallback
const iconUrl = $derived.by(() => {
	let url = getTechnologyIconUrl(lesson.name);
	if (url) return url;
	for (const topic of lesson.topics) {
		const match = topic.match(/^(.+?)-(\d+)/);
		const topicName = match ? match[1] : topic;
		url = getTechnologyIconUrl(topicName);
		if (url) return url;
	}
	return null;
});

const initials = $derived.by(() => {
	if (iconUrl) return null;
	const words = lesson.name.split(/[\s-]/);
	if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
	return lesson.name.substring(0, 2).toUpperCase();
});

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 7) {
		return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
	} else if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
	} else if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `${months} month${months !== 1 ? 's' : ''} ago`;
	} else {
		const years = Math.floor(diffDays / 365);
		return `${years} year${years !== 1 ? 's' : ''} ago`;
	}
};
</script>

<div
	class="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col justify-start relative w-full max-w-full min-h-[280px] shadow-lg overflow-hidden text-left transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:bg-white/20 active:-translate-y-0.5"
	role="button"
	tabindex="0"
>
	<div class="flex flex-col w-full h-full text-base p-7 overflow-hidden box-border">
		<h2
			class="text-2xl m-0 mb-4 font-bold tracking-tight text-white w-full box-border overflow-hidden text-ellipsis whitespace-nowrap"
		>
			{displayName}
		</h2>

		{#if lesson.description}
			<p
				class="m-0 mb-5 leading-relaxed text-white/95 text-lg w-full box-border line-clamp-3 overflow-hidden text-ellipsis break-words"
			>
				{lesson.description}
			</p>
		{/if}

		<div class="mt-auto pt-4 border-t border-white/25 text-left">
			<span class="text-[0.95rem] text-white/90 font-medium">Updated {formatDate(lesson.last_commit_date || lesson.updated_at)}</span>
		</div>
	</div>
</div>
