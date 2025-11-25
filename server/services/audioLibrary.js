const DEFAULT_AUDIO_PRESETS = [
  {
    id: 'preset-hype-1',
    title: 'Hype Drop',
    duration: 18,
    audio_url:
      'https://cdn.pixabay.com/audio/2022/08/11/audio_9ba6510d84.mp3',
    bpm: 130,
    mood: 'energy'
  },
  {
    id: 'preset-soft-1',
    title: 'Soft Focus',
    duration: 24,
    audio_url:
      'https://cdn.pixabay.com/audio/2022/03/15/audio_46b6a6d911.mp3',
    bpm: 92,
    mood: 'calm'
  },
  {
    id: 'preset-voiceover-1',
    title: 'Voice Over Base',
    duration: 30,
    audio_url:
      'https://cdn.pixabay.com/audio/2021/11/10/audio_6552dfe7e6.mp3',
    bpm: 100,
    mood: 'neutral'
  }
];

export async function fetchAudioPresets(limit = 12) {
  const apiKey = process.env.PIXABAY_AUDIO_API_KEY;
  if (!apiKey) {
    return enrichFallback(DEFAULT_AUDIO_PRESETS);
  }

  try {
    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('media_type', 'music');
    url.searchParams.set('order', 'popular');
    url.searchParams.set('per_page', String(limit));

    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        'Pixabay audio API error:',
        response.status,
        await response.text()
      );
      return enrichFallback(DEFAULT_AUDIO_PRESETS);
    }

    const data = await response.json();
    if (!data?.hits?.length) {
      return enrichFallback(DEFAULT_AUDIO_PRESETS);
    }

    return data.hits.map((hit) => ({
      id: `pixabay-${hit.id}`,
      title: hit.tags || hit.user || 'Audio preset',
      duration: hit.duration || hit.audio_length || 20,
      audio_url: hit.audio || hit.previewURL,
      preview_url: hit.previewURL || hit.audio,
      bpm: hit.bpm || null,
      mood: hit.tags?.split(',')?.[0]?.trim(),
      tags: hit.tags,
      user: hit.user
    }));
  } catch (error) {
    console.error('Audio library fetch failed:', error.message);
    return enrichFallback(DEFAULT_AUDIO_PRESETS);
  }
}

function enrichFallback(presets) {
  return presets.map((preset) => ({
    ...preset,
    preview_url: preset.audio_url,
    tags: preset.mood,
    user: 'Pixabay'
  }));
}

export function selectPresetById(presets, presetId) {
  if (!presetId) return null;
  return presets.find((preset) => preset.id === presetId) || null;
}

export function generatePresetPayload(preset) {
  if (!preset) return null;
  return {
    preset_id: preset.id,
    title: preset.title,
    url: preset.audio_url,
    duration: preset.duration,
    bpm: preset.bpm,
    mood: preset.mood
  };
}

